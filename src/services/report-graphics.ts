import type { Chart } from "../domain/bazi/types";
import { elements } from "../domain/bazi/catalog";

// Inline vectors stay sharp in print and work without external requests.
export const reportOrnament = `<svg class="report-ornament" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1"><circle cx="50" cy="50" r="36"/><circle cx="50" cy="50" r="25"/><ellipse cx="50" cy="50" rx="43" ry="15" transform="rotate(-35 50 50)"/><path d="M50 3V97M3 50H97M17 17L83 83M17 83L83 17" opacity=".4"/></g><path d="M50 33L54 46L67 50L54 54L50 67L46 54L33 50L46 46Z" fill="currentColor"/></svg>`;

export function elementGraphic(chart: Chart) {
  const total = elements.reduce(
    (sum, el) => sum + chart.distribution[el.id],
    0,
  );
  let offset = 0;
  const arcs = elements
    .map((el) => {
      const amount = total ? (chart.distribution[el.id] / total) * 100 : 0;
      const arc = `<circle cx="110" cy="110" r="78" fill="none" stroke="${el.color}" stroke-width="22" pathLength="100" stroke-dasharray="${amount} ${100 - amount}" stroke-dashoffset="${-offset}" transform="rotate(-90 110 110)"/>`;
      offset += amount;
      return arc;
    })
    .join("");
  return `<figure class="element-figure"><svg viewBox="0 0 220 220" role="img" aria-label="Распределение пяти элементов карты"><circle cx="110" cy="110" r="96" fill="none" stroke="#c7d5ca"/>${arcs}<text x="110" y="113" text-anchor="middle" font-size="34" fill="#244b3c">5</text><text x="110" y="135" text-anchor="middle" font-size="9" letter-spacing="2" fill="#597365">ЭЛЕМЕНТОВ</text></svg><figcaption><h3>Пять элементов карты</h3><p class="graphic-caption">Видимые и скрытые стволы</p><div class="element-legend">${elements.map((el) => `<div><span class="element-dot" style="background:${el.color}"></span><span>${el.symbol} ${el.name}</span><b>${chart.distribution[el.id]}%</b></div>`).join("")}</div></figcaption></figure>`;
}

export function directionGraphic(gua: number) {
  const directions = ["Юг", "ЮЗ", "Запад", "СЗ", "Север", "СВ", "Восток", "ЮВ"];
  const labels = directions
    .map((name, i) => {
      const angle = (i * Math.PI) / 4 - Math.PI / 2;
      return `<text x="${150 + Math.cos(angle) * 119}" y="${150 + Math.sin(angle) * 119 + 4}" text-anchor="middle" font-size="11" fill="#375747">${name}</text>`;
    })
    .join("");
  const spokes = directions
    .map(
      (_, i) => `<path d="M150 70V46" transform="rotate(${i * 45} 150 150)"/>`,
    )
    .join("");
  return `<figure class="direction-figure"><svg viewBox="0 0 300 300" role="img" aria-label="Восемь направлений, юг сверху, Гуа ${gua}"><g fill="none" stroke="#b49b65"><circle cx="150" cy="150" r="97"/><circle cx="150" cy="150" r="86"/>${spokes}</g><path d="M150 64L165 135L236 150L165 165L150 236L135 165L64 150L135 135Z" fill="#e8eee5" stroke="#bdcbbc"/><circle cx="150" cy="150" r="48" fill="#173a2d"/><text x="150" y="140" text-anchor="middle" font-size="10" letter-spacing="2" fill="#d7bb83">ГУА</text><text x="150" y="176" text-anchor="middle" font-size="34" fill="#fff">${gua}</text>${labels}</svg><figcaption>Юг сверху · север снизу<br>Восток слева · запад справа</figcaption></figure>`;
}

export const reportGraphicStyles = `
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .cover{padding:10mm;background:#102b24;border:1px solid #b49b65;outline:1px solid #42614f;outline-offset:-4mm}
  .cover img{display:block;width:100%;height:118mm;object-fit:contain;flex-shrink:0;margin:8mm 0 6mm}
  .cover .identity h3{font-size:19px;font-weight:400;color:#f1e6cb}
  .cover .identity p{margin:3px 0 9px}
  .cover .tag{letter-spacing:2px}
  .section-heading{display:flex;align-items:center;justify-content:space-between;gap:18px;border-bottom:1px solid #b6c6bb;margin:0 0 20px;break-after:avoid}
  .section-heading h2{border:0;padding:0;margin:0 0 12px;flex:1;font-size:22px}
  .report-ornament{width:48px;height:48px;color:#a48a53;flex-shrink:0;margin-bottom:12px}
  .element-figure{display:flex;align-items:center;gap:28px;margin:22px 0;padding:18px 22px;background:#f4f6f0;border:1px solid #d7e0d3;break-inside:avoid}
  .element-figure>svg{width:180px;height:180px;flex-shrink:0}
  .element-figure figcaption{flex:1}.element-figure h3{margin:0;color:#244b3c;font-size:17px}
  .graphic-caption{color:#607365;font-size:10px;margin:2px 0 10px}
  .element-legend>div{display:flex;gap:9px;align-items:center;margin:5px 0}.element-legend b{margin-left:auto;font-weight:400}
  .element-dot{width:9px;height:9px;border-radius:50%;border:1px solid #0001;flex-shrink:0}
  .analysis-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;break-inside:avoid}.analysis-grid article{margin:0}.analysis-grid h3{margin-top:7px;font-size:12px}.analysis-grid p{font-size:10px}
  .direction-figure{margin:12px auto 18px;text-align:center;break-inside:avoid}.direction-figure svg{width:230px;height:230px}.direction-figure figcaption{font-size:9px;color:#647b6b}
  .pillars{background:#f8f9f5;border-color:#c5d1c5;break-inside:avoid}.pillar+.pillar{border-left:1px solid #d7e0d3}
  .qimen-grid{border:1px solid #b3a17c;padding:7px;gap:5px;background:#f4f5ee}
  .qimen-grid>div{background:#fff;border:1px solid #d4dbcb;border-top:3px solid #a4b4a1}
  .qimen-grid>div:nth-child(5){background:#e5eddf;border-color:#aabf9e}
  .consultation-card{margin-top:24px;padding:22px 24px;border:1px solid #b4a077;background:#f2f5ed;break-inside:avoid}
  .consultation-card h3{margin-top:0;font-size:20px;font-weight:400}.consultation-card .expert-role{font-size:12px;color:#667b63;margin:3px 0 13px}
  .consultation-card a{display:inline-block;padding:7px 18px;margin:10px 9px 0 0;border:1px solid #8b9e86;text-decoration:none}
`;
