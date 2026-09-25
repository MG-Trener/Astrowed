import { Solar, LunarUtil } from "lunar-typescript";
import { birthSchema, normalizeTime } from "../bazi/engine";
import type { BirthInput } from "../bazi/types";
import { stems } from "../bazi/catalog";
import { palaceOf } from "../feng-shui/catalog";

const mod = (n: number, m: number) => ((n % m) + m) % m;
const ring = [1, 8, 3, 4, 9, 2, 7, 6];
const instruments = [..."戊己庚辛壬癸丁丙乙"];
const stars = ["天蓬", "天任", "天冲", "天辅", "天英", "天芮", "天柱", "天心"];
const doors = ["休", "生", "伤", "杜", "景", "死", "惊", "开"];
const spirits = [
  "值符",
  "腾蛇",
  "太阴",
  "六合",
  "白虎",
  "玄武",
  "九地",
  "九天",
];
export const starNames: Record<string, string> = {
  天蓬: "Тянь Пэн · замысел",
  天任: "Тянь Жэнь · устойчивость",
  天冲: "Тянь Чун · импульс",
  天辅: "Тянь Фу · обучение",
  天英: "Тянь Ин · проявление",
  天芮: "Тянь Жуй · забота",
  天柱: "Тянь Чжу · выражение",
  天心: "Тянь Синь · порядок",
  天禽: "Тянь Цинь · центр",
};
export const doorNames: Record<string, string> = {
  休: "Отдых",
  生: "Жизнь",
  伤: "Ранение",
  杜: "Преграда",
  景: "Сцена",
  死: "Смерть",
  惊: "Испуг",
  开: "Открытие",
};
export const spiritNames: Record<string, string> = {
  值符: "Чжи Фу",
  腾蛇: "Тэн Шэ",
  太阴: "Тай Инь",
  六合: "Лю Хэ",
  白虎: "Бай Ху",
  玄武: "Сюань У",
  九地: "Цзю Ди",
  九天: "Цзю Тянь",
};
export const doorMeaning: Record<string, string> = {
  休: "Тема паузы, переговоров и восстановления. Сопоставьте её с целью вопроса и остальными слоями дворца.",
  生: "Тема развития и ресурсов. Рассмотрите, что помогает росту, и какие реальные условия для него уже созданы.",
  伤: "Тема усилия, конкуренции и резкого действия. Проверьте цену активности и границы допустимого риска.",
  杜: "Тема границ, закрытости и подготовки. Подходит для обсуждения того, что требует защиты или дополнительного изучения.",
  景: "Тема видимости, образа и информации. Сопоставьте впечатление с содержанием и проверяемыми фактами.",
  死: "Тема завершения и неподвижности. Традиционное название двери не означает буквальную смерть и не является прогнозом здоровья.",
  惊: "Тема неожиданности, сигнала и напряжённого общения. Полезно уточнять формулировки и проверять полученные сведения.",
  开: "Тема начала, доступа и взаимодействия с внешним миром. Рассмотрите реальные возможности для контакта и действия.",
};
// Upper, middle and lower yuan, indexed from the winter solstice.
const terms = [
  "冬至",
  "小寒",
  "大寒",
  "立春",
  "雨水",
  "惊蛰",
  "春分",
  "清明",
  "谷雨",
  "立夏",
  "小满",
  "芒种",
  "夏至",
  "小暑",
  "大暑",
  "立秋",
  "处暑",
  "白露",
  "秋分",
  "寒露",
  "霜降",
  "立冬",
  "小雪",
  "大雪",
];
const juTable = [
  "174",
  "285",
  "396",
  "852",
  "963",
  "174",
  "396",
  "417",
  "528",
  "417",
  "528",
  "639",
  "936",
  "825",
  "714",
  "258",
  "147",
  "936",
  "714",
  "693",
  "582",
  "693",
  "582",
  "471",
];
export type QimenOptions = {
  system: "chaibu" | "manual";
  ju?: number;
  dun?: "yang" | "yin";
};
export function calculateQimen(
  raw: BirthInput,
  options: QimenOptions = { system: "chaibu" },
) {
  const input = birthSchema.parse(raw);
  if (input.unknownTime)
    throw new Error("Для Ци Мэнь требуется время события или рождения.");
  if (!["chaibu", "manual"].includes(options.system))
    throw new Error("Неизвестная система Ци Мэнь.");
  const { civil, local, correctionMinutes } = normalizeTime(input);
  const china = civil.setZone("UTC+8");
  const termLunar = Solar.fromYmdHms(
    china.year,
    china.month,
    china.day,
    china.hour,
    china.minute,
    0,
  ).getLunar();
  const clock = Solar.fromYmdHms(
    local.year,
    local.month,
    local.day,
    local.hour,
    local.minute,
    0,
  )
    .getLunar()
    .getEightChar();
  clock.setSect(input.dayBoundary === "zi" ? 1 : 2);
  const term = termLunar.getPrevJieQi(false).getName();
  const termIndex = terms.indexOf(term);
  if (termIndex < 0) throw new Error(`Неизвестный солнечный термин: ${term}`);
  const dayIndex = LunarUtil.JIA_ZI.indexOf(clock.getDay());
  const hour = clock.getTime();
  const hourIndex = LunarUtil.JIA_ZI.indexOf(hour);
  const yuan = Math.floor((dayIndex % 15) / 5);
  const automaticDun = termIndex < 12 ? "yang" : "yin";
  const dun = options.system === "manual" ? options.dun : automaticDun;
  const ju =
    options.system === "manual" ? options.ju : Number(juTable[termIndex][yuan]);
  if (
    !ju ||
    !Number.isInteger(ju) ||
    ju < 1 ||
    ju > 9 ||
    !dun ||
    !["yang", "yin"].includes(dun)
  )
    throw new Error("Укажите Инь/Ян Дунь и номер цзюй от 1 до 9.");
  const sign = dun === "yang" ? 1 : -1;
  const earth: string[] = Array(10).fill("");
  instruments.forEach((s, i) => {
    earth[mod(ju - 1 + sign * i, 9) + 1] = s;
  });
  const concealed = instruments[Math.floor(hourIndex / 10)];
  const leader = earth.indexOf(concealed);
  const hourStem = hour[0] === "甲" ? concealed : hour[0];
  const starTarget = earth.indexOf(hourStem);
  const host = (n: number) => (n === 5 ? 2 : n);
  const sourceIndex = ring.indexOf(host(leader));
  const targetIndex = ring.indexOf(host(starTarget));
  const rotation = mod(targetIndex - sourceIndex, 8);
  const doorTarget = mod(leader - 1 + sign * stems.indexOf(hour[0]), 9) + 1;
  const doorRotation = mod(ring.indexOf(host(doorTarget)) - sourceIndex, 8);
  const chartPalaces = Array.from({ length: 9 }, (_, i) => {
    const id = i + 1;
    if (id === 5)
      return {
        ...palaceOf(id),
        earth: earth[id],
        heaven: earth[id],
        hosted: "",
        star: "天禽",
        door: "",
        spirit: "",
        dutyStar: false,
        dutyDoor: false,
      };
    const target = ring.indexOf(id);
    const source = mod(target - rotation, 8);
    const doorSource = mod(target - doorRotation, 8);
    return {
      ...palaceOf(id),
      earth: earth[id],
      heaven: earth[ring[source]],
      hosted: ring[source] === 2 ? earth[5] : "",
      star: stars[source],
      door: doors[doorSource],
      spirit: spirits[mod(sign * (target - targetIndex), 8)],
      dutyStar: id === host(starTarget),
      dutyDoor: id === host(doorTarget),
    };
  });
  return {
    input,
    system: options.system,
    version: "qimen-rotating-1.0.0",
    term,
    yuan: ["Верхний", "Средний", "Нижний"][yuan],
    dun,
    ju,
    pillars: [
      termLunar.getEightChar().getYear(),
      termLunar.getEightChar().getMonth(),
      clock.getDay(),
      hour,
    ],
    xun: LunarUtil.JIA_ZI[Math.floor(hourIndex / 10) * 10],
    concealed,
    dutyStar: leader === 5 ? "天禽" : stars[sourceIndex],
    dutyDoor: doors[sourceIndex],
    starTarget: host(starTarget),
    doorTarget: host(doorTarget),
    palaces: chartPalaces,
    localTime: local.toFormat("yyyy-MM-dd HH:mm"),
    utc: civil.toUTC().toISO()!,
    correctionMinutes,
    method: `Вращающийся часовой диск · ${options.system === "chaibu" ? "Чай Бу (拆補), цзюй по солнечному термину и фу-тоу дня" : "ручное задание цзюй"} · центр и Тянь Цинь размещаются вместе с Кунь / Тянь Жуй · смена дня ${input.dayBoundary === "zi" ? "23:00" : "00:00"} · ${input.timeMode === "civil" ? "гражданское" : "среднее солнечное"} время`,
  };
}
export type QimenChart = ReturnType<typeof calculateQimen>;
