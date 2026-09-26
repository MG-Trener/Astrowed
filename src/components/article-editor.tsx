"use client";
import { useActionState, useState } from "react";
import { saveArticle } from "@/app/admin/knowledge/actions";
type Editable = {
  id: string;
  slug: string;
  title: string;
  symbol: string | null;
  summary: string;
  body: string;
  references: string;
  categoryId: string | null;
  published: boolean;
  requiresExpertReview: boolean;
};
export function ArticleEditor({ articles }: { articles: Editable[] }) {
  const [selected, setSelected] = useState("");
  const article = articles.find((a) => a.id === selected);
  return (
    <>
      <label className="field" style={{ maxWidth: 500, marginBottom: 30 }}>
        Материал
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">+ Новая статья</option>
          {articles.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
              {a.published ? "" : " · черновик"}
            </option>
          ))}
        </select>
      </label>
      <EditorForm key={selected} article={article} />
    </>
  );
}
function EditorForm({ article }: { article?: Editable }) {
  const [state, action, pending] = useActionState(saveArticle, {
    error: "",
    success: false,
  });
  return (
    <form className="form" action={action}>
      {article && <input type="hidden" name="id" value={article.id} />}
      <label className="field">
        Заголовок
        <input
          name="title"
          required
          defaultValue={article?.title}
          maxLength={200}
        />
      </label>
      <label className="field">
        Адрес (латиница и дефис)
        <input
          name="slug"
          required
          pattern="[a-z0-9-]+"
          defaultValue={article?.slug}
          maxLength={100}
        />
      </label>
      <label className="field">
        Символ
        <input
          name="symbol"
          defaultValue={article?.symbol ?? ""}
          maxLength={10}
        />
      </label>
      <label className="field">
        Категория
        <select
          name="categoryId"
          defaultValue={article?.categoryId ?? "foundations"}
        >
          <option value="foundations">Основы Ба Цзы</option>
          <option value="elements">Пять элементов</option>
        </select>
      </label>
      <label className="field full">
        Краткое описание
        <textarea
          name="summary"
          rows={2}
          defaultValue={article?.summary}
          maxLength={500}
        />
      </label>
      <label className="field full">
        Текст статьи
        <textarea
          name="body"
          required
          rows={12}
          defaultValue={article?.body}
          maxLength={50000}
        />
      </label>
      <label className="field full">
        Источники — по одной ссылке на строку
        <textarea
          name="references"
          rows={3}
          defaultValue={article?.references}
          maxLength={3000}
        />
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          name="published"
          defaultChecked={article?.published ?? false}
        />
        Опубликовать
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          name="requiresExpertReview"
          defaultChecked={article?.requiresExpertReview ?? true}
        />
        Требует экспертной проверки
      </label>
      <button className="button primary" disabled={pending}>
        {pending ? "Сохранение…" : "Сохранить материал"}
      </button>
      {state.error && (
        <p className="error full" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="success full" role="status">
          Материал сохранён.
        </p>
      )}
    </form>
  );
}
