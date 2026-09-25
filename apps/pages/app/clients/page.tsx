import Link from "next/link";
export const metadata = { title: "Кабинет консультанта" };
export default function Page() {
  return (
    <div className="page-wrap">
      <div className="page-title">
        <div>
          <div className="eyebrow">КАБИНЕТ КОНСУЛЬТАНТА</div>
          <h1>Ваше рабочее пространство.</h1>
          <p>
            Публичная версия позволяет рассчитывать и исследовать карты без
            регистрации.
          </p>
        </div>
      </div>
      <div className="empty-state">
        <h2>Онлайн-кабинет готовится к запуску.</h2>
        <p>
          Сохранение клиентов, история консультаций и редактор материалов
          появятся после подключения защищённого кабинета. Сейчас можно
          построить карту и сохранить её через меню печати.
        </p>
        <Link href="/calculator" className="button primary">
          Рассчитать карту →
        </Link>
      </div>
    </div>
  );
}
