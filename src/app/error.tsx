"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-wrap">
      <div className="empty-state">
        <h2>Не удалось загрузить этот раздел.</h2>
        <p>
          Проверьте соединение и попробуйте ещё раз. Ваши сохранённые данные не
          изменены.
        </p>
        <button className="button" onClick={reset}>
          Повторить загрузку
        </button>
      </div>
    </div>
  );
}
