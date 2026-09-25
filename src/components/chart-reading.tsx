"use client";
import type { Chart } from "@/domain/bazi/types";
import {
  buildReading,
  conclusionLabels,
  type Conclusion,
} from "@/domain/bazi/reading";

export function ClientReading({ chart }: { chart: Chart }) {
  const reading = buildReading(chart);
  return (
    <div className="client-reading">
      <div className="reading-intro">
        <div className="eyebrow">ВАША КАРТА · ПОНЯТНЫМ ЯЗЫКОМ</div>
        <h3>Не только символы. Смысл для разговора.</h3>
        <p>{reading.notice}</p>
        <p className="reading-basis">{reading.boundaryNote}</p>
      </div>
      <div className="reading-sections">
        {reading.sections.map((section, i) => (
          <article className="reading-section" key={section.id}>
            <span className="reading-number" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3>{section.title}</h3>
              <p>{section.text}</p>
              <p className="reading-question">
                <span>Вопрос к себе</span>
                {section.question}
              </p>
              <details className="reading-evidence">
                <summary>На чём основано</summary>
                {section.evidence.length ? (
                  <ul>
                    {section.evidence.map((fact, index) => (
                      <li key={index}>{fact}</li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    Поддерживаемые признаки этого типа в показанных столпах не
                    обнаружены.
                  </p>
                )}
              </details>
            </div>
          </article>
        ))}
      </div>
      <aside className="reading-action">
        <div className="eyebrow">ОДИН ПРАКТИЧЕСКИЙ ШАГ</div>
        <p>{reading.action}</p>
        <small>
          Выберите подходящий вам эксперимент и оцените результат по реальному
          опыту.
        </small>
      </aside>
    </div>
  );
}

export function ConclusionEditor({
  chart,
  value,
  onChange,
  onReport,
}: {
  chart: Chart;
  value: Conclusion;
  onChange: (value: Conclusion) => void;
  onReport: () => void;
}) {
  const reading = buildReading(chart);
  return (
    <div className="conclusion-editor">
      <div className="reading-intro">
        <div className="eyebrow">СТРУКТУРИРОВАННОЕ ЗАКЛЮЧЕНИЕ · ЧЕРНОВИК</div>
        <h3>Собрать главное в понятный итог.</h3>
        <p>
          Ниже — автоматически составленный черновик. Его можно отредактировать
          перед обсуждением с консультантом. Это не личное заключение Юлии
          Гаврилычевой.
        </p>
        <p className="reading-basis">{reading.boundaryNote}</p>
        <details className="reading-evidence">
          <summary>Исходные столпы и методика</summary>
          <p>{reading.facts.join(" · ")}</p>
          <p>{chart.method.description}</p>
        </details>
      </div>
      {(Object.entries(conclusionLabels) as [keyof Conclusion, string][]).map(
        ([key, label]) => (
          <label className="field conclusion-field" key={key}>
            {label}
            <textarea
              rows={key === "summary" ? 5 : 7}
              maxLength={5000}
              value={value[key]}
              onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            />
          </label>
        ),
      )}
      <p className="distribution-note">
        Правки остаются в этой открытой карте и попадут в полный или
        профессиональный PDF. После закрытия или нового расчёта они не
        сохранятся. Подтверждение авторства эксперта автоматически не
        присваивается.
      </p>
      <button type="button" className="button primary" onClick={onReport}>
        Открыть отчёт с заключением <span aria-hidden>↗</span>
      </button>
    </div>
  );
}
