import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page-wrap">
      <div className="empty-state">
        <div className="eyebrow" style={{ justifyContent: "center" }}>
          404 / ВНЕ КАРТЫ
        </div>
        <h2>Эта точка ещё не нанесена на карту.</h2>
        <p>Страница не найдена или материал ещё не опубликован.</p>
        <Link href="/" className="button">
          В обсерваторию →
        </Link>
      </div>
    </div>
  );
}
