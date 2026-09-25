import Link from "next/link";
import { ContactLinks } from "./contact-links";
import Image from "next/image";
import fengArtwork from "@/assets/generated/feng-shui.webp";
import qimenArtwork from "@/assets/generated/qimen.webp";
import { observatoryArtwork, elementArtwork } from "@/assets/artwork";
import { elements } from "@/domain/bazi/catalog";
import { BaguaNavigator, GuaCalculator } from "./bagua-view";

export function PlatformDirections() {
  return (
    <section className="platform-directions">
      <div className="section-heading">
        <div>
          <div className="eyebrow">ЧЕЛОВЕК · ПРОСТРАНСТВО · ВРЕМЯ</div>
          <h2>
            Три точки зрения.
            <br />
            <span className="muted">Единая картина.</span>
          </h2>
        </div>
        <p>
          Исследовательская платформа
          <br />
          эксперта Юлии Гаврилычевой.
        </p>
      </div>
      <div className="direction-cards">
        {[
          {
            href: "/bazi",
            title: "Ба Цзы",
            han: "八字",
            sub: "Понять свою природу",
            image: observatoryArtwork.image,
            text: "Личная карта, десять богов, символические звёзды и периоды жизни.",
          },
          {
            href: "/feng-shui",
            title: "Фэн Шуй",
            han: "風水",
            sub: "Почувствовать пространство",
            image: fengArtwork,
            text: "Багуа, личное Гуа, направления и внимательный взгляд на устройство дома.",
          },
          {
            href: "/qimen",
            title: "Ци Мэнь",
            han: "奇門",
            sub: "Исследовать момент",
            image: qimenArtwork,
            text: "Девять дворцов. Двери, звёзды и духи в карте выбранного времени.",
          },
        ].map((item) => (
          <Link className="direction-card" key={item.href} href={item.href}>
            <div className="direction-image">
              <Image
                src={item.image}
                alt={item.sub}
                sizes="(max-width: 750px) 100vw, 33vw"
              />
              <span>{item.han}</span>
            </div>
            <div>
              <span className="eyebrow">{item.sub}</span>
              <h3>
                {item.title} <span>↗</span>
              </h3>
              <p>{item.text}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="expert-strip">
        <div>
          <span className="eyebrow">ЭКСПЕРТ ПРОЕКТА</span>
          <h3>Юлия Гаврилычева</h3>
        </div>
        <p>Ба Цзы · Фэн Шуй · Ци Мэнь Дунь Цзя</p>
        <Link href="/about-julia" className="text-button">
          Знакомство с подходом ↗
        </Link>
        <ContactLinks />
      </div>
    </section>
  );
}

const fengTopics = [
  {
    id: "foundations",
    n: "01",
    title: "Основы и две школы",
    text: "Школа форм рассматривает рельеф, здания, подходы и планировку. Компасные методы добавляют измеренные направления и временные циклы. Эти уровни дополняют друг друга: хороший символический сектор не исправит неудобный проход или недостаток света.",
    detail:
      "Ци — традиционный язык описания связей и движения в среде. Инь и Ян помогают сравнивать покой и активность, закрытость и открытость. Начните с наблюдений: где шумно, где спокойно, как меняется освещение и какие маршруты используются чаще всего.",
  },
  {
    id: "forms",
    n: "02",
    title: "Формы и окружение",
    text: "Рассматривайте дом вместе с улицей: подъезд, пешеходные маршруты, соседние здания, открытые пространства, вода и рельеф. Отмечайте не только форму, но и расстояние, масштаб, видимость и реальное воздействие на жильцов.",
    detail:
      "Внутри проверьте свободное открывание двери, острые выступы у проходов, доступ к окнам и удобство движения между комнатами. Рисунок на плане должен сопоставляться с фотографиями и фактическим использованием пространства.",
  },
  {
    id: "flying-stars",
    n: "03",
    title: "Летящие звёзды и время",
    text: "Сюань Кун добавляет временной слой к девяти дворцам Ло Шу. Базовая карта дома зависит от принятого периода здания и измеренного фасадного направления. Годовая и месячная карты накладываются поверх неё и не заменяют натальную карту дома.",
    detail:
      "В системе двадцатилетних периодов период 9 охватывает 2024–2043 годы. Для профессионального разбора нужны дата ввода дома в эксплуатацию, сведения о существенных реконструкциях, точный план и несколько измерений фасада. Сам по себе год ремонта не всегда меняет период: решение зависит от методики.",
  },
  {
    id: "practice",
    n: "04",
    title: "От наблюдения к решению",
    text: "Сначала сформулируйте задачу комнаты: сон, учёба, общение или работа. Затем оцените свет, шум, проходы, размещение мебели и повседневные привычки. Символические соответствия добавляйте после этих наблюдений.",
    detail:
      "Не назначайте воду, огонь или активные предметы только по названию сектора. Личное Гуа описывает направления человека, а карта дома — структуру пространства. Для индивидуального решения нужны оба контекста и реальная планировка.",
  },
];
export function FengShuiPage() {
  return (
    <div className="page-wrap expansion-page">
      <section className="module-hero">
        <div>
          <div className="eyebrow">風水 / ИСКУССТВО ПРОСТРАНСТВА</div>
          <h1>
            Дом, в котором
            <br />
            <em>есть место вам.</em>
          </h1>
          <p>
            Форма, свет, движение и направление. Исследуйте пространство через
            пять элементов, Багуа и личное Гуа.
          </p>
          <Link className="button primary" href="/feng-shui/bagua">
            Исследовать Багуа ↗
          </Link>
        </div>
        <Image
          src={fengArtwork}
          alt="Спокойный интерьер с круглым окном, деревянным столом и естественным светом"
          priority
          sizes="(max-width: 800px) 100vw, 55vw"
        />
      </section>
      <nav className="section-nav">
        <a href="#foundations">Основы</a>
        <a href="#space-elements">Пять элементов</a>
        <Link href="/feng-shui/bagua">Багуа</Link>
        <Link href="/feng-shui/gua">Личное Гуа</Link>
        <a href="#flying-stars">Летящие звёзды</a>
        <Link href="/feng-shui/recommendations">Комнаты и практика</Link>
      </nav>
      <section className="exp-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">ОТ ЦЕЛОГО К ДЕТАЛЯМ</div>
            <h2>
              Сначала увидеть.
              <br />
              Затем измерить.
            </h2>
          </div>
          <p>
            Библиотека принципов и инструментов
            <br />
            для внимательного разбора пространства.
          </p>
        </div>
        <div className="editorial-grid">
          {fengTopics.map((t) => (
            <article id={t.id} className="editorial-card" key={t.id}>
              <span className="eyebrow">{t.n} / ФЭН ШУЙ</span>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
              <details>
                <summary>Практические ориентиры</summary>
                <p>{t.detail}</p>
              </details>
            </article>
          ))}
        </div>
      </section>
      <section id="space-elements" className="exp-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">五行 / МАТЕРИАЛЫ, ФОРМЫ, ЦВЕТ</div>
            <h2>Элементы в пространстве.</h2>
          </div>
          <Link href="/explore" className="text-button">
            Циклы взаимодействия ↗
          </Link>
        </div>
        <div className="space-elements">
          {elements.map((e, i) => (
            <article key={e.id}>
              <Image
                src={elementArtwork[e.id].image}
                alt={elementArtwork[e.id].alt}
                sizes="(max-width: 750px) 45vw, 20vw"
              />
              <h3 style={{ color: e.color }}>
                {e.symbol} {e.name}
              </h3>
              <p>
                {
                  [
                    "Вертикали, древесина, зелёные оттенки. Образ роста и постепенного развития.",
                    "Свет, тёплые акценты, треугольные формы. Образ активности и проявления.",
                    "Керамика, камень, горизонтали, охристые оттенки. Образ опоры и устойчивости.",
                    "Металлические детали, округлые формы, белые и серые оттенки. Образ ясности и порядка.",
                    "Стекло, текучие линии, глубокие тёмные оттенки. Образ движения и гибкости.",
                  ][i]
                }
              </p>
            </article>
          ))}
        </div>
        <p className="method-note">
          Это язык визуальных соответствий. Цвет или материал сам по себе не
          определяет благоприятность помещения.
        </p>
      </section>
      <section className="exp-section">
        <BaguaNavigator />
      </section>
      <section className="closing-note">
        <div>
          <div className="eyebrow">СВЯЗЬ ЧЕЛОВЕКА И ПРОСТРАНСТВА</div>
          <h2>
            Ваше Гуа.
            <br />
            Восемь направлений.
          </h2>
        </div>
        <Link href="/feng-shui/gua" className="button primary">
          Рассчитать Гуа ↗
        </Link>
      </section>
    </div>
  );
}
export function BaguaPage() {
  return (
    <div className="page-wrap expansion-page">
      <PageHeading
        eyebrow="八卦 / НАВИГАТОР НАПРАВЛЕНИЙ"
        title="Восемь направлений. Один центр."
        text="Выберите сектор, чтобы увидеть его триграмму, элемент и традиционные темы."
      />
      <BaguaNavigator />
      <Link className="button" href="/feng-shui">
        ← Раздел Фэн Шуй
      </Link>
    </div>
  );
}
export function GuaPage() {
  return (
    <div className="page-wrap expansion-page">
      <PageHeading
        eyebrow="命卦 / ЛИЧНОЕ ГУА"
        title="Ваш ориентир в пространстве."
        text="Число Гуа по солнечному году рождения. Точная граница Ли Чунь особенно важна для рождённых в начале февраля."
      />
      <GuaCalculator />
      <section className="exp-section prose-grid">
        <h2>Направление и сектор.</h2>
        <div>
          <p>
            Направление — куда вы обращены лицом. Сектор — часть плана
            относительно центра дома. Благоприятное направление по личному Гуа
            не означает, что весь соответствующий сектор дома автоматически
            подходит для любой задачи.
          </p>
          <p>
            Шэн Ци, Тянь И, Янь Нянь и Фу Вэй — четыре поддерживающих
            направления в Ба Чжай. Их традиционные названия используются как
            язык анализа, а не обещание жизненных событий.
          </p>
        </div>
      </section>
    </div>
  );
}
const rooms = [
  [
    "Входная дверь",
    "Свободное открывание, понятный маршрут и достаточный свет. Оцените подход снаружи и место для повседневных вещей; не загромождайте вход декоративными предметами.",
  ],
  [
    "Спальня и кровать",
    "Покой, приватность и удобный подход к кровати. Учитывайте шум, сквозняки и освещение. Сопоставляйте направление изголовья с планом комнаты, а не только с числом Гуа.",
  ],
  [
    "Рабочее место и стол",
    "Устойчивая опора, удобное кресло и отсутствие бликов на экране. Важно видеть вход в комнату без постоянного напряжения и иметь достаточно места для работы.",
  ],
  [
    "Кухня и плита",
    "Начните с вентиляции, рабочих поверхностей и безопасных проходов. Анализ стихии Огня не заменяет требований к установке оборудования и удобству приготовления еды.",
  ],
  [
    "Детская и обучение",
    "Разделяйте зоны сна, игры и учёбы. Обеспечьте подходящий свет и доступное хранение. Символическая тема обучения должна поддерживаться реальными условиями для занятий.",
  ],
  [
    "Санузел",
    "Сухость, вентиляция и доступ для обслуживания важнее символических украшений. Оцените состояние коммуникаций и удобство помещения.",
  ],
  [
    "Зеркала и лестницы",
    "Смотрите, что отражает зеркало и не создаёт ли оно бликов. На лестницах важны обзор, освещение и свободные ступени. Не прячьте конструктивные проблемы декоративной коррекцией.",
  ],
  [
    "Тихая зона",
    "Для чтения, созерцания или личной практики подберите спокойное место вне активного прохода. Оставьте минимум предметов и возможность регулировать освещение.",
  ],
];
export function RecommendationsPage() {
  return (
    <div className="page-wrap expansion-page">
      <PageHeading
        eyebrow="ФЭН ШУЙ / ДОМ И ПОВСЕДНЕВНОСТЬ"
        title="Пространство начинается с привычек."
        text="Практические вопросы для осмотра дома. Индивидуальные рекомендации требуют плана, ориентации фасада и задачи жильцов."
      />
      <div className="editorial-grid">
        {rooms.map(([title, text], i) => (
          <article className="editorial-card" key={title}>
            <span className="eyebrow">
              {String(i + 1).padStart(2, "0")} / ДОМ
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <section className="exp-section">
        <h2>Что подготовить к разбору</h2>
        <div className="process-row">
          {[
            "План с масштабом и центром",
            "Компасные измерения фасада",
            "Период постройки и реконструкции",
            "Фотографии окружения и комнат",
            "Кто живёт в доме и какие задачи важны",
          ].map((s, i) => (
            <div key={s}>
              <span>0{i + 1}</span>
              <p>{s}</p>
            </div>
          ))}
        </div>
        <Link href="/feng-shui/gua" className="button">
          Добавить личное Гуа ↗
        </Link>
      </section>
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="page-title expansion-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </div>
  );
}
export function BaziPage() {
  return (
    <div className="page-wrap expansion-page">
      <section className="module-hero">
        <div>
          <div className="eyebrow">八字 / ЧЕЛОВЕК И ЦИКЛЫ</div>
          <h1>
            Восемь знаков.
            <br />
            <em>Много уровней смысла.</em>
          </h1>
          <p>
            От календарного расчёта к последовательному разбору: Господин дня,
            скрытые стволы, десять богов, Шэнь Ша и приходящие периоды.
          </p>
          <Link href="/calculator" className="button primary">
            Рассчитать свою карту ↗
          </Link>
        </div>
        <Image
          src={observatoryArtwork.image}
          alt={observatoryArtwork.alt}
          priority
          sizes="(max-width: 800px) 100vw, 55vw"
        />
      </section>
      <nav className="section-nav">
        <Link href="/calculator">Калькулятор</Link>
        <Link href="/bazi/current-energies">Текущие энергии</Link>
        <Link href="/bazi/luck-pillars">Такты</Link>
        <Link href="/bazi/life-years">Годы жизни</Link>
        <Link href="/bazi/stars">Звёзды и Шэнь Ша</Link>
        <Link href="/reports">PDF</Link>
      </nav>
      <div className="editorial-grid">
        {[
          [
            "01 / НАТАЛЬНАЯ ОСНОВА",
            "Столпы и внутренние связи",
            "Год, месяц, день и час с учётом часового пояса и границ солнечных терминов. Каждый скрытый ствол сопоставляется с Господином дня.",
            "/chart/demo",
          ],
          [
            "02 / ИНТЕРПРЕТАЦИЯ",
            "От символа к контексту",
            "Русские пояснения к элементам и десяти богам. Отдельно показаны фактические основания и вопросы, требующие экспертной оценки.",
            "/chart/demo#interpretation",
          ],
          [
            "03 / ДИНАМИКА",
            "Годы и десятилетия",
            "Такты Да Юнь, годовой слой и выбранные день, месяц, год. Взаимодействия показывают, какой натальный столп затронут.",
            "/bazi/life-years",
          ],
          [
            "04 / СИМВОЛИЧЕСКИЙ СЛОЙ",
            "Звёзды без загадок",
            "Цветок персика, Путешествующая лошадь, Академик, Благородный и другие маркеры с правилом поиска и местом обнаружения.",
            "/bazi/stars",
          ],
        ].map(([sub, title, text, href]) => (
          <Link className="editorial-card" key={href} href={href}>
            <span className="eyebrow">{sub}</span>
            <h3>{title} ↗</h3>
            <p>{text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
export function AboutJuliaPage() {
  return (
    <div className="page-wrap expansion-page">
      <section className="expert-hero">
        <div className="expert-monogram" aria-hidden="true">
          <span>ЮГ</span>
          <small>ЧЕЛОВЕК · ПРОСТРАНСТВО · ВРЕМЯ</small>
        </div>
        <div>
          <div className="eyebrow">ЭКСПЕРТ ПРОЕКТА ASTROWED</div>
          <h1>
            Юлия
            <br />
            <em>Гаврилычева.</em>
          </h1>
          <p>Ба Цзы · Фэн Шуй · Ци Мэнь Дунь Цзя</p>
          <p>
            Платформа для исследования личной карты, пространства и временных
            циклов. Расчёт помогает собрать факты; консультационный разбор
            связывает их с человеком и его вопросом.
          </p>
          <ContactLinks />
          <Link className="text-button" href="/calculator">
            Подготовить личную карту ↗
          </Link>
        </div>
      </section>
      <section className="exp-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">ПОДХОД ПЛАТФОРМЫ</div>
            <h2>
              Понять основания.
              <br />
              Увидеть взаимосвязи.
            </h2>
          </div>
        </div>
        <div className="editorial-grid">
          {[
            [
              "Человек",
              "Ба Цзы и Гуа помогают последовательно рассмотреть структуру карты и выбранные направления.",
            ],
            [
              "Пространство",
              "Фэн Шуй добавляет планировку, окружение, измерения и фактические условия жизни.",
            ],
            [
              "Время",
              "Ци Мэнь и временные слои Ба Цзы дают разные способы исследовать выбранный момент.",
            ],
            [
              "Обсуждение",
              "Автоматические пояснения служат материалом для разбора. Личный комментарий эксперта оформляется отдельно от расчёта.",
            ],
          ].map(([t, p]) => (
            <article className="editorial-card" key={t}>
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
