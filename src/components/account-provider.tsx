"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Link from "next/link";
import type { AccountState, AccountProfile } from "@/domain/account";
import { consentVersion } from "@/domain/account";
import {
  accountConfigured,
  accountFetch,
  memberAuth,
} from "@/services/account-client";
import type { BirthInput } from "@/domain/bazi/types";
const Context = createContext<{
  data: AccountState | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}>({
  data: null,
  loading: true,
  error: "",
  refresh: async () => {},
  signOut: async () => {},
});
export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AccountState | null>(null);
  const [loading, setLoading] = useState(accountConfigured);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!accountConfigured) {
      setLoading(false);
      return;
    }
    try {
      const session = await memberAuth().getSession();
      if (session.error)
        throw new Error("Не удалось проверить вход. Попробуйте ещё раз.");
      setData(
        session.data?.user ? await accountFetch<AccountState>("/me") : null,
      );
      setError("");
    } catch (e) {
      setData(null);
      setError(
        e instanceof Error ? e.message : "Не удалось загрузить кабинет.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const check = () => {
      if (!document.hidden) void refresh();
    };
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [refresh]);
  async function signOut() {
    const result = await memberAuth().signOut();
    if (result.error) { setError("Не удалось завершить сеанс. Повторите выход."); return; }
    setData(null);
    try { sessionStorage.removeItem("astrowed-active-birth-v1"); } catch {}
    window.location.assign(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`);
  }
  return (
    <Context.Provider value={{ data, loading, error, refresh, signOut }}>
      {children}
    </Context.Provider>
  );
}
export const useAccount = () => useContext(Context);
export function AccountName() {
  const { data } = useAccount();
  return <>{data?.profile?.name || data?.user.name || "Кабинет"}</>;
}
export function AccountGate({ children }: { children: React.ReactNode }) {
  const { data, loading, error, refresh } = useAccount();
  if (loading)
    return (
      <div className="page-wrap">
        <p role="status">Проверяем вход…</p>
      </div>
    );
  if (!data?.profile?.privacyConsent || !data.profile.termsConsent || data.profile.consentVersion !== consentVersion)
    return (
      <div className="page-wrap">
        <section className="account-welcome">
          <span className="eyebrow">ВАША ЛИЧНАЯ КАРТА</span>
          <h1>{data ? "Завершите регистрацию" : "Расчёты в вашем кабинете"}</h1>
          <p>
            {data
              ? "Сохраните контакты и согласия в кабинете. Затем можно приступить к расчётам."
              : "Войдите через Google или по ссылке из письма. Сохранённую анкету можно использовать во всех калькуляторах."}
          </p>
          <Link className="button primary" href="/account/">
            {data ? "Заполнить профиль" : "Войти или зарегистрироваться"} →
          </Link>
          {error && (
            <p role="alert">
              {error}{" "}
              <button className="text-button" onClick={() => void refresh()}>
                Повторить
              </button>
            </p>
          )}
        </section>
      </div>
    );
  return <>{children}</>;
}
export function ProfileFill({
  onFill,
  label = "Подставить мою анкету",
}: {
  onFill: (input: BirthInput, profile: AccountProfile) => void;
  label?: string;
}) {
  const { data } = useAccount();
  const p = data?.profile;
  return p?.birth ? (
    <div className="profile-fill">
      <span>
        Сохранена анкета: <strong>{p.name}</strong>
      </span>
      <button
        className="button"
        type="button"
        onClick={() => onFill({ ...p.birth!, name: p.name }, p)}
      >
        {label} ↗
      </button>
    </div>
  ) : (
    <p className="method-note">
      <Link href="/account/">Сохраните анкету в кабинете</Link>, чтобы
      подставлять данные автоматически.
    </p>
  );
}
