import { createRemoteJWKSet, jwtVerify } from "jose";
import { accountRole, type AccountUser } from "../domain/account";
import { pool } from "./database";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;
export async function identify(request: Request): Promise<AccountUser> {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) throw new ApiError(401, "Войдите в кабинет, чтобы продолжить.");
  const base = process.env.NEON_AUTH_BASE_URL;
  if (!base) throw new ApiError(503, "Вход временно недоступен.");
  jwks ??= createRemoteJWKSet(
    new URL(process.env.NEON_AUTH_JWKS_URL || `${base}/.well-known/jwks.json`),
  );
  let id: string;
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: new URL(base).origin,
      audience: new URL(base).origin,
      algorithms: ["EdDSA"],
      requiredClaims: ["sub", "exp", "iat"],
      maxTokenAge: "16m",
    });
    if (!payload.sub) throw new Error();
    id = payload.sub;
  } catch {
    throw new ApiError(401, "Сессия истекла. Войдите ещё раз.");
  }
  // Read current, verified identity from Neon, never trust editable profile metadata.
  const { rows } = await pool().query(
    'select id, email, name, "emailVerified", banned from neon_auth."user" where id::text = $1',
    [id],
  );
  const user = rows[0];
  if (!user || user.banned || !user.emailVerified)
    throw new ApiError(401, "Подтвердите почту для доступа к кабинету.");
  return {
    id,
    email: user.email,
    name: user.name,
    role: accountRole(user.email, user.emailVerified),
  };
}
export function requireStaff(user: AccountUser) {
  if (user.role === "client")
    throw new ApiError(403, "Этот раздел доступен администратору и эксперту.");
}
