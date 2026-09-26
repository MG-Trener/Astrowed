"use client";
import { useActionState } from "react";
import { addConsultation } from "@/app/clients/actions";
export function ConsultationForm({ clientId }: { clientId: string }) {
  const [state, action, pending] = useActionState(addConsultation, {
    error: "",
    success: false,
  });
  return (
    <form className="form" action={action}>
      <input type="hidden" name="clientId" value={clientId} />
      <label className="field">
        Дата
        <input
          required
          type="date"
          name="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </label>
      <label className="field">
        Тема
        <input required name="topic" maxLength={200} />
      </label>
      <label className="field full">
        Заметки консультанта
        <textarea name="notes" rows={4} maxLength={20000} />
      </label>
      <label className="field full">
        Рекомендации
        <textarea name="recommendations" rows={3} maxLength={10000} />
      </label>
      <button className="button primary" disabled={pending}>
        {pending ? "Сохраняем…" : "Сохранить консультацию"}
      </button>
      {state.error && (
        <p className="error full" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="success full" role="status">
          Консультация сохранена.
        </p>
      )}
    </form>
  );
}
