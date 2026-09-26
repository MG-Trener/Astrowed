import { luoShuOrder } from "../domain/feng-shui/catalog";
import {
  doorNames,
  spiritNames,
  starNames,
  type QimenChart,
} from "../domain/qimen/engine";
import { palaceZodiac } from "../components/palace-zodiac";
import type { ReportArtwork } from "./report-artwork-files";

const xml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
const ink = "#193f37",
  muted = "#526c63",
  gold = "#9b7637";
function text(
  value: string,
  x: number,
  y: number,
  size = 12,
  color = ink,
  anchor = "start",
  width?: number,
) {
  // Only constrain unusually long user-provided labels; never cut off chart data.
  const fit =
    width && [...value].length * size * 0.6 > width
      ? ` textLength="${width}" lengthAdjust="spacingAndGlyphs"`
      : "";
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}"${fit}>${xml(value)}</text>`;
}
function lines(value: string, width: number) {
  const result: string[] = [];
  for (const word of value.split(/\s+/)) {
    if (
      !result.length ||
      result[result.length - 1].length + word.length + 1 > width
    )
      result.push(word);
    else result[result.length - 1] += " " + word;
  }
  return result;
}

/** A self-contained A4 sheet, independent of viewport, selected palace and hidden layers. */
export function qimenPrintSvg(chart: QimenChart, artwork: ReportArtwork = {}) {
  const dun = chart.dun === "yang" ? "Ян" : "Инь";
  const cells = luoShuOrder
    .map((id, index) => {
      const p = chart.palaces.find((palace) => palace.id === id)!;
      const x = 70 + (index % 3) * 218,
        y = 250 + Math.floor(index / 3) * 204;
      let content = `<g data-palace="${id}"><rect x="${x + 2}" y="${y + 2}" width="214" height="200" rx="7" fill="${id === 5 ? "url(#jadePaper)" : "#fffef9"}" stroke="#b1bda7"/><path d="M${x + 14} ${y + 34}h190" stroke="#c4ae76" stroke-width=".8"/>`;
      content += text(`${id}  ${p.name}`, x + 13, y + 24, 15);
      content += text(p.direction, x + 205, y + 24, 10, muted, "end");
      if (id === 5) {
        content += text(
          `${dun} Дунь · ${chart.ju} цзюй`,
          x + 109,
          y + 68,
          18,
          ink,
          "middle",
        );
        content += text(
          chart.system === "chaibu"
            ? "Чай Бу · часовая карта"
            : "Ручной цзюй · часовая карта",
          x + 109,
          y + 93,
          11,
          muted,
          "middle",
        );
        content += text(p.earth, x + 109, y + 138, 34, gold, "middle");
        content += text(
          "天禽 · Тянь Цинь",
          x + 109,
          y + 169,
          14,
          ink,
          "middle",
        );
      } else {
        content += text("НЕБО", x + 73, y + 48, 8, muted, "middle");
        content += text("ЗЕМЛЯ", x + 145, y + 48, 8, muted, "middle");
        content += text(p.heaven, x + 73, y + 81, 29, ink, "middle");
        content += text(p.earth, x + 145, y + 81, 29, gold, "middle");
        content += `<path d="M${x + 12} ${y + 94}h194" stroke="#d4ded5"/>`;
        const entities = [
          ["ДУХ", p.spirit, spiritNames[p.spirit]],
          ["ДВЕРЬ", p.door, doorNames[p.door]],
          ["ЗВЕЗДА", p.star, starNames[p.star]?.split(" · ")[0]],
        ];
        entities.forEach(([role, symbol, label], i) => {
          const cx = x + 38 + i * 71;
          content += text(role, cx, y + 111, 8, muted, "middle");
          content += text(symbol, cx, y + 138, 23, ink, "middle");
          content += text(label ?? symbol, cx, y + 157, 9, muted, "middle");
        });
        const notes = [
          p.hosted ? `寄 ${p.hosted} · Тянь Цинь` : "",
          p.dutyStar ? "Чжи Фу" : "",
          p.dutyDoor ? "Чжи Ши" : "",
        ].filter(Boolean);
        content += text(notes.join(" / "), x + 109, y + 178, 9, gold, "middle");
      }
      content += text(
        palaceZodiac
          .filter((animal) => animal.palace === id)
          .map((animal) => `${animal.branch} ${animal.name}`)
          .join(" · "),
        x + 109,
        y + 194,
        9,
        muted,
        "middle",
      );
      return content + "</g>";
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 794 1123">
    <title>Ци Мэнь · девять дворцов</title>
    <defs><linearGradient id="jadePaper" x2="1" y2="1"><stop stop-color="#e7eee0"/><stop offset="1" stop-color="#f6f5e9"/></linearGradient><linearGradient id="jadeNight"><stop stop-color="#102b23"/><stop offset="1" stop-color="#071c19"/></linearGradient></defs>
    <rect width="794" height="1123" fill="#f9f8f1"/>
    <rect x="22" y="20" width="750" height="168" rx="10" fill="url(#jadeNight)" stroke="#ae9862"/>
    <g fill="none" stroke="#bfa36b" opacity=".16"><circle cx="644" cy="99" r="74"/><ellipse cx="644" cy="99" rx="91" ry="33" transform="rotate(-30 644 99)"/></g>
    ${artwork.qimen ? `<image href="${xml(artwork.qimen)}" x="540" y="34" width="210" height="140" preserveAspectRatio="xMidYMid meet"/>` : ""}
    <g font-family="Arial, 'Microsoft YaHei', 'PingFang SC', sans-serif">
    ${text("ASTROWED / КАРТА МОМЕНТА", 44, 46, 10, "#d8bd82")}
    ${text("Ци Мэнь · девять дворцов", 44, 83, 26, "#f3efdf")}
    ${text(chart.input.name, 44, 109, 13, "#d0dac9", "start", 468)}
    ${text(`${chart.input.date} · ${chart.input.time} · ${chart.input.city}`, 44, 132, 11, "#c7d2c1", "start", 468)}
    ${text(chart.input.timezone, 44, 148, 10, "#abbeb0")}
    ${text(`${dun} Дунь · ${chart.ju} цзюй   /   ${chart.term} · ${chart.yuan} юань`, 44, 173, 14, "#dfc993")}
    ${text(`Столпы: ${chart.pillars.join(" / ")}   ·   Сюнь: ${chart.xun}   ·   скрытый Цзя: ${chart.concealed}`, 44, 213, 12)}
    ${text("ЮГ", 397, 236, 12, gold, "middle")}
    ${text("ЮВ", 70, 236, 11, muted)}${text("ЮЗ", 724, 236, 11, muted, "end")}
    <g transform="translate(47 556) rotate(-90)">${text("ВОСТОК", 0, 0, 11, gold, "middle")}</g>
    <g transform="translate(747 556) rotate(90)">${text("ЗАПАД", 0, 0, 11, gold, "middle")}</g>
    ${cells}
    ${text("СЕВЕР", 397, 884, 12, gold, "middle")}
    ${text("СВ", 70, 884, 11, muted)}${text("СЗ", 724, 884, 11, muted, "end")}
    ${text(`Время расчёта: ${chart.localTime} · поправка ${Math.round(chart.correctionMinutes * 100) / 100} мин.`, 44, 921, 11, muted)}
    ${text(`Чжи Фу: ${chart.dutyStar} → дворец ${chart.starTarget} · Чжи Ши: ${doorNames[chart.dutyDoor]} → дворец ${chart.doorTarget}`, 44, 943, 11, muted)}
    ${lines(chart.method, 106)
      .map((line, i) => text(line, 44, 970 + i * 16, 10, muted))
      .join("")}
    <path d="M44 1042h706" stroke="#bfa36b"/>
    ${artwork.expert ? `<image href="${xml(artwork.expert)}" x="699" y="1053" width="43" height="43" preserveAspectRatio="xMidYMid meet"/>` : ""}
    ${text("Юлия Гаврилычева · эксперт-астролог", 44, 1065, 12)}
    ${text("Традиционная символическая модель. Интерпретация требует контекста всей карты.", 44, 1085, 9, muted)}
    ${text("1 / 1", 750, 1110, 9, muted, "end")}
    </g></svg>`;
}

/** Rasterize only for PDF so Cyrillic and Chinese remain portable without external fonts. */
export async function qimenPdfBlob(svgUrl: string) {
  const image = new Image();
  image.src = svgUrl;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 2480;
  canvas.height = 3508;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Не удалось подготовить изображение карты.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  pdf.setProperties({ title: "Ци Мэнь · девять дворцов", author: "Astrowed" });
  pdf.addImage(
    canvas.toDataURL("image/png"),
    "PNG",
    0,
    0,
    210,
    297,
    undefined,
    "FAST",
  );
  return pdf.output("blob");
}
