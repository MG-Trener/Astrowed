"use client";
import { useActionState } from "react";
import { signIn } from "@/app/login/actions";
export function LoginForm({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState(signIn, { error: "" });
  return (
    <form className="form" action={action}>
      <label className="field">
        Пароль кабинета
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          disabled={!configured}
        />
      </label>
      <button className="button primary" disabled={!configured || pending}>
        {pending ? "Входим…" : "Войти в кабинет →"}
      </button>
      {state.error && (
        <p className="error" role="alert">
          {state.error}
        </p>
      )}
      {!configured && (
        <p className="method-note">
          Кабинет защищён и пока не активирован. Укажите WORKSPACE_PASSWORD и
          SESSION_SECRET в локальном ENV, чтобы включить доступ.
        </p>
      )}
    </form>
  );
}
