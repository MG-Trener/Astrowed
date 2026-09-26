import Link from "next/link";
import { PageHeading } from "@/components/expansion-pages";
import { BaguaNavigator } from "@/components/bagua-view";
export const metadata = { title: "Девять дворцов Ци Мэнь" };
export default function Page() {
  return (
    <div className="page-wrap expansion-page">
      <PageHeading
        eyebrow="九宮 / ЛО ШУ"
        title="Девять дворцов Ци Мэнь."
        text="Восемь направлений и центр образуют неподвижную основу. Стволы, двери, звёзды и духи распределяются по ней для выбранного момента."
      />
      <BaguaNavigator />
      <div className="exp-section">
        <h2>Основа и приходящие слои</h2>
        <p className="method-note">
          Здесь показаны постоянные свойства дворцов. Для личной карты
          используйте расчёт: содержимое дворцов изменится по дате, времени и
          выбранной системе. Вращающийся диск размещает центр вместе с Кунь и
          Тянь Жуй.
        </p>
        <Link className="button primary" href="/qimen">
          Построить личную карту ↗
        </Link>
      </div>
    </div>
  );
}
