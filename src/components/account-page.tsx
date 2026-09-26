"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "./account-provider";
import {
  accountConfigured,
  accountFetch,
  memberAuth,
} from "@/services/account-client";
import {
  profileSchema,
  calculatorNames,
  type AccountProfile,
  type ProfileInput,
} from "@/domain/account";
import { emptyBirthInput } from "@/domain/bazi/session";
import { LocationPicker } from "./location-picker";
import type { BirthInput } from "@/domain/bazi/types";

function ConsentFields({
  privacy,
  terms,
  marketing,
  onChange,
}: {
  privacy: boolean;
  terms: boolean;
  marketing: boolean;
  onChange: (key: "privacy" | "terms" | "marketing", value: boolean) => void;
}) {
  return (
    <fieldset className="account-consents">
      <legend>Ваши согласия</legend>
      <label>
        <input
          type="checkbox"
          required
          checked={privacy}
          onChange={(e) => onChange("privacy", e.target.checked)}
        />
        <span>
          Согласен на обработку моих данных для работы кабинета и расчётов по{" "}
          <Link href="/privacy/" target="_blank">
            политике конфиденциальности
          </Link>
          .
        </span>
      </label>
      <label>
        <input
          type="checkbox"
          required
          checked={terms}
          onChange={(e) => onChange("terms", e.target.checked)}
        />
        <span>
          Принимаю{" "}
          <Link href="/terms/" target="_blank">
            условия использования
          </Link>
          .
        </span>
      </label>
      <label>
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => onChange("marketing", e.target.checked)}
        />
        <span>
          Хочу получать новости проекта по почте. Необязательно; согласие можно
          отозвать в кабинете.
        </span>
      </label>
    </fieldset>
  );
}
function SignIn() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consents, setConsents] = useState({
    privacy: false,
    terms: false,
    marketing: false,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("error")) {
      setError("Вход не завершён. Повторите вход через Google или запросите новую ссылку на почту.");
    }
  }, []);
  async function enter(google: boolean) {
    if (!consents.privacy || !consents.terms) {
      setError("Примите условия и согласие на обработку данных.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const callbackURL = `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/account/`;
      const auth = memberAuth();
      const result = google
        ? await auth.signIn.social({
            provider: "google", callbackURL,
            newUserCallbackURL: callbackURL,
            errorCallbackURL: `${callbackURL}?error=google`,
          })
        : await auth.signIn.magicLink({
            email: email.trim(),
            name: name.trim() || email.split("@")[0],
            callbackURL,
            newUserCallbackURL: callbackURL,
            errorCallbackURL: `${callbackURL}?error=email`,
          });
      if (result.error)
        throw new Error(
          google
            ? "Не удалось открыть вход Google. Попробуйте ещё раз."
            : "Сервис не принял запрос письма. Проверьте адрес и повторите позже.",
        );
      if (!google)
        setMessage(
          "Проверьте почту: отправили ссылку для подтверждения и входа. После нажатия откроется ваш кабинет. Если письма нет, проверьте папку «Спам».",
        );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось войти.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="account-login-grid">
      <section className="account-welcome">
        <span className="eyebrow">ЛИЧНОЕ ПРОСТРАНСТВО</span>
        <h1>
          Ваша история.
          <br />
          <em>Ваша карта.</em>
        </h1>
        <p>
          Одна анкета для Ба Цзы, Ци Мэнь, Гуа и персональных настроек
          календаря.
        </p>
        <ul>
          <li>Сохраните дату, время и место рождения.</li>
          <li>Подставляйте данные в расчёты одним нажатием.</li>
          <li>Обратитесь к Юлии Гаврилычевой из кабинета.</li>
        </ul>
        <span className="account-seal" aria-hidden="true">
          命
        </span>
      </section>
      <form
        className="form account-card"
        onSubmit={(e) => {
          e.preventDefault();
          void enter(false);
        }}
      >
        <h2>Вход и регистрация</h2>
        <p>Пароль не нужен: отправим ссылку на вашу почту.</p>
        <label className="field">
          Имя
          <input
            autoComplete="given-name"
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="field">
          Электронная почта
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <ConsentFields
          {...consents}
          onChange={(key, value) =>
            setConsents((s) => ({ ...s, [key]: value }))
          }
        />
        <button
          className="button primary"
          disabled={busy || !accountConfigured}
        >
          {busy ? "Подождите…" : "Получить ссылку на почту"}
        </button>
        <div className="account-divider">или</div>
        <button
          className="button account-google"
          type="button"
          disabled={busy || !accountConfigured}
          onClick={() => void enter(true)}
        >
          <span aria-hidden="true">G</span> Продолжить с Google
        </button>
        {!accountConfigured && (
          <p role="status">
            Регистрация готовится к запуску. Пожалуйста, зайдите позже.
          </p>
        )}
        {message && (
          <p className="account-notice" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
type Stats = {
  counts: { today: number; month: number; year: number; total: number };
  genders: { gender: string; count: number }[];
  calculators: { kind: string; count: number }[];
  timezone: string;
};
function StaffDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [profiles, setProfiles] = useState<AccountProfile[]>([]);
  const [requests, setRequests] = useState<
    {
      id: string;
      message: string;
      status: string;
      snapshot: AccountProfile;
      createdAt: string;
    }[]
  >([]);
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([
      accountFetch<Stats>("/admin/stats"),
      accountFetch<{ profiles: AccountProfile[] }>(
        `/admin/profiles?page=${page}`,
      ),
      accountFetch<{ requests: typeof requests }>("/admin/requests"),
    ])
      .then(([s, p, r]) => {
        if (active) {
          setStats(s);
          setProfiles(p.profiles);
          setRequests(r.requests);
          setError("");
        }
      })
      .catch(() => {
        if (active)
          setError("Не удалось загрузить статистику. Обновите страницу.");
      });
    return () => {
      active = false;
    };
  }, [page]);
  return (
    <section className="account-staff">
      <div className="eyebrow">ЭКСПЕРТ И АДМИНИСТРАТОР</div>
      <h2>Пульс проекта</h2>
      <p>Новые сохранённые анкеты · календарные периоды по времени Алматы.</p>
      {error && <p role="alert">{error}</p>}
      {stats && (
        <>
          <div className="account-metrics">
            {(
              [
                ["Сегодня", stats.counts.today],
                ["Этот месяц", stats.counts.month],
                ["Этот год", stats.counts.year],
                ["Всего", stats.counts.total],
              ] as const
            ).map(([label, value]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value.toLocaleString("ru-RU")}</strong>
              </article>
            ))}
          </div>
          <div className="account-columns">
            <section className="account-card">
              <h3>Пол в анкетах</h3>
              {[
                ["female", "Женщины"],
                ["male", "Мужчины"],
                ["unknown", "Не заполнено"],
              ].map(([key, label]) => {
                const count =
                  stats.genders.find((g) => g.gender === key)?.count || 0;
                const share = stats.counts.total
                  ? Math.round((count / stats.counts.total) * 100)
                  : 0;
                return (
                  <div className="account-ratio" key={key}>
                    <span>{label}</span>
                    <strong>
                      {count} · {share}%
                    </strong>
                    <meter
                      min={0}
                      max={Math.max(1, stats.counts.total)}
                      value={count}
                      aria-label={label}
                    />
                  </div>
                );
              })}
            </section>
            <section className="account-card">
              <h3>Выполненные расчёты</h3>
              {Object.entries(calculatorNames).map(([key, name]) => (
                <p className="account-counter" key={key}>
                  <span>{name}</span>
                  <strong>
                    {stats.calculators.find((c) => c.kind === key)?.count || 0}
                  </strong>
                </p>
              ))}
            </section>
          </div>
        </>
      )}
      <h3>Анкеты клиентов</h3>
      <div className="account-client-list">
        {profiles.map((p) => (
          <details className="account-card" key={p.userId}>
            <summary>
              <strong>{p.name}</strong>
              <span>{p.email}</span>
            </summary>
            <p>
              {p.phone} ·{" "}
              {p.birth?.gender === "female"
                ? "Женский"
                : p.birth?.gender === "male"
                  ? "Мужской"
                  : "Пол не указан"}
            </p>
            <p>
              {p.birth
                ? `${p.birth.date} · ${p.birth.unknownTime ? "Время неизвестно" : p.birth.time} · ${p.birth.city} · ${p.birth.timezone}`
                : "Данные рождения не заполнены"}
            </p>
          </details>
        ))}
      </div>
      <div className="actions">
        <button
          className="button"
          disabled={!page}
          onClick={() => setPage((n) => n - 1)}
        >
          ← Назад
        </button>
        <span>Страница {page + 1}</span>
        <button
          className="button"
          disabled={profiles.length < 25}
          onClick={() => setPage((n) => n + 1)}
        >
          Далее →
        </button>
      </div>
      <h3>Заявки на консультацию</h3>
      {requests.length ? (
        requests.map((r) => (
          <article className="account-card" key={r.id}>
            <h4>{r.snapshot.name}</h4>
            <p>
              {r.snapshot.email} · {r.snapshot.phone}
            </p>
            <p>{r.message || "Нужна консультация"}</p>
            <small>
              {r.status === "sent"
                ? "Отправлено в Telegram"
                : "Требует внимания: доставка не подтверждена"}{" "}
              · {new Date(r.createdAt).toLocaleString("ru-RU")}
            </small>
          </article>
        ))
      ) : (
        <p>Новых заявок пока нет.</p>
      )}
    </section>
  );
}
function ProfileForm() {
  const { data, refresh } = useAccount();
  const p = data!.profile;
  const [name, setName] = useState(p?.name || data!.user.name);
  const [phone, setPhone] = useState(p?.phone || "");
  const [birth, setBirth] = useState<BirthInput>(
    p?.birth || { ...emptyBirthInput, name },
  );
  const [residence, setResidence] = useState(
    p?.residence || { city: "", timezone: "", longitude: 0, latitude: 0 },
  );
  const [birthReady, setBirthReady] = useState(Boolean(p?.birth));
  const [homeReady, setHomeReady] = useState(Boolean(p?.residence));
  const [consents, setConsents] = useState({
    privacy: p?.privacyConsent || false,
    terms: p?.termsConsent || false,
    marketing: p?.marketingConsent || false,
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const update = <K extends keyof BirthInput>(key: K, value: BirthInput[K]) =>
    setBirth((b) => ({ ...b, [key]: value }));
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (birth.date && !birthReady)
        throw new Error("Выберите город рождения из списка.");
      if (residence.city && !homeReady)
        throw new Error("Выберите город проживания из списка.");
      const input = profileSchema.parse({
        name,
        phone,
        birth: birth.date
          ? { ...birth, name, time: birth.unknownTime ? "12:00" : birth.time }
          : null,
        residence: residence.city ? residence : null,
        privacyConsent: consents.privacy,
        termsConsent: consents.terms,
        marketingConsent: consents.marketing,
      });
      await accountFetch("/profile", input, "PUT");
      await refresh();
      setNotice(
        "Анкета сохранена. Теперь её можно подставлять в калькуляторы.",
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? "issues" in e
            ? "Проверьте имя, телефон, дату, время и согласия."
            : e.message
          : "Не удалось сохранить анкету.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="form account-card account-profile" onSubmit={save}>
      <div className="account-section-heading">
        <span>01</span>
        <div>
          <h2>Контакты</h2>
          <p>Почта подтверждена при входе.</p>
        </div>
      </div>
      <div className="form-grid">
        <label className="field">
          Имя
          <input
            required
            autoComplete="name"
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="field">
          Телефон
          <input
            required
            type="tel"
            autoComplete="tel"
            placeholder="+7 …"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label className="field full">
          Электронная почта
          <input type="email" value={data!.user.email} readOnly />
        </label>
      </div>
      <div className="account-section-heading">
        <span>02</span>
        <div>
          <h2>Анкета рождения</h2>
          <p>Заполните для персональных расчётов. Можно добавить позже.</p>
        </div>
      </div>
      <div className="form-grid">
        <label className="field">
          Дата рождения
          <input
            type="date"
            min="1901-01-01"
            max={new Date().toISOString().slice(0, 10)}
            value={birth.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </label>
        <label className="field">
          Пол
          <select
            value={birth.gender}
            onChange={(e) =>
              update("gender", e.target.value as BirthInput["gender"])
            }
          >
            <option value="female">Женский</option>
            <option value="male">Мужской</option>
          </select>
        </label>
        <label className="field">
          Местное время рождения
          <input
            type="time"
            value={birth.time}
            required={Boolean(birth.date) && !birth.unknownTime}
            disabled={birth.unknownTime}
            onChange={(e) => update("time", e.target.value)}
          />
        </label>
        <label className="account-check">
          <input
            type="checkbox"
            checked={birth.unknownTime}
            onChange={(e) => update("unknownTime", e.target.checked)}
          />
          Время рождения неизвестно
        </label>
      </div>
      <LocationPicker
        value={birth}
        date={birth.date}
        time={birth.time}
        onChange={(place) => setBirth((b) => ({ ...b, ...place }))}
        onReady={setBirthReady}
      />
      <div className="account-section-heading">
        <span>03</span>
        <div>
          <h2>Город проживания</h2>
          <p>Для календаря и центра карты компаса. Необязательно.</p>
        </div>
      </div>
      <LocationPicker
        value={residence}
        date={new Date().toISOString().slice(0, 10)}
        time="12:00"
        onChange={setResidence}
        onReady={setHomeReady}
      />
      <ConsentFields
        {...consents}
        onChange={(key, value) => setConsents((s) => ({ ...s, [key]: value }))}
      />
      <button className="button primary" disabled={busy}>
        {busy ? "Сохраняем…" : "Сохранить анкету"}
      </button>
      {notice && (
        <p className="account-notice" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
function ConsultationRequest() {
  const { data } = useAccount();
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  return (
    <section className="account-card account-consult">
      <div className="eyebrow">ЛИЧНЫЙ РАЗБОР</div>
      <h2>Задать свой вопрос эксперту</h2>
      <p>
        Юлия Гаврилычева
        <br />
        Эксперт-астролог
      </p>
      <form
        className="form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          setNotice("");
          const id = requestId || crypto.randomUUID();
          setRequestId(id);
          try {
            const r = await accountFetch<{ status: string; message?: string }>(
              "/requests",
              { id, message, telegramConsent: consent },
            );
            setNotice(
              r.status === "sent"
                ? "Заявка отправлена эксперту. С вами свяжутся по указанным контактам."
                : r.message || "Заявка сохранена. Доставка проверяется.",
            );
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : "Не удалось отправить заявку.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="field">
          Что хотите обсудить?
          <textarea
            rows={5}
            maxLength={1500}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setRequestId(null);
            }}
            placeholder="Отношения, выбор даты, работа, пространство дома…"
          />
        </label>
        <label className="account-check">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            Согласен передать имя, телефон, почту, анкету рождения и мой вопрос
            эксперту через Telegram для консультации.
          </span>
        </label>
        <button
          className="button primary"
          disabled={busy || !data?.profile?.birth}
        >
          {busy ? "Отправляем…" : "Мне нужна консультация →"}
        </button>
        {!data?.profile?.birth && (
          <small>Сначала сохраните анкету рождения.</small>
        )}
        {notice && (
          <p role="status" className="account-notice">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
export function AccountPage() {
  const { data, loading, error, refresh, signOut } = useAccount();
  const [tab, setTab] = useState<"profile" | "expert">("profile");
  if (loading)
    return (
      <div className="page-wrap">
        <p role="status">Загружаем ваш кабинет…</p>
      </div>
    );
  if (!data)
    return (
      <div className="page-wrap account-page">
        {error && (
          <p role="alert">
            {error}{" "}
            <button className="button" onClick={() => void refresh()}>
              Повторить
            </button>
          </p>
        )}
        <SignIn />
      </div>
    );
  return (
    <div className="page-wrap account-page">
      {error && <p role="alert" className="error">{error}</p>}
      <header className="page-title">
        <div>
          <span className="eyebrow">ЛИЧНЫЙ КАБИНЕТ</span>
          <h1>Здравствуйте, {data.profile?.name || data.user.name}.</h1>
          <p>
            {data.user.role === "admin"
              ? "Администратор проекта"
              : data.user.role === "expert"
                ? "Кабинет эксперта"
                : "Ваши данные для точных расчётов — в одном месте."}
          </p>
        </div>
        <button className="button" onClick={() => void signOut()}>
          Выйти
        </button>
      </header>
      {data.user.role !== "client" && (
        <div className="account-tabs">
          <button
            className={tab === "profile" ? "active" : ""}
            onClick={() => setTab("profile")}
          >
            Моя анкета
          </button>
          <button
            className={tab === "expert" ? "active" : ""}
            onClick={() => setTab("expert")}
          >
            Управление и статистика
          </button>
        </div>
      )}
      {tab === "expert" && data.user.role !== "client" ? (
        <StaffDashboard />
      ) : (
        <>
          <nav className="account-shortcuts" aria-label="Персональные расчёты">
            {[
              ["/calculator/", "Ба Цзы"],
              ["/qimen/", "Ци Мэнь"],
              ["/feng-shui/gua/", "Гуа"],
              ["/calendar/", "Календарь"],
              ["/compasses/", "Компасы"],
            ].map(([href, name]) => (
              <Link key={href} href={href}>
                {name} ↗
              </Link>
            ))}
          </nav>
          <div className="account-body">
            <ProfileForm />
            <ConsultationRequest />
          </div>
        </>
      )}
    </div>
  );
}
