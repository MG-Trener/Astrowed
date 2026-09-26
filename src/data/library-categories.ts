export function librarySection(category: string | null) {
  return category === "feng-shui" || category === "qimen" ? category : "bazi";
}

export function libraryCategoryLabel(category: string | null) {
  if (category === "feng-shui") return "ФЭНШУЙ";
  if (category === "qimen") return "ЦИ МЭНЬ";
  return category === "elements" ? "ПЯТЬ ЭЛЕМЕНТОВ" : "ОСНОВЫ БА ЦЗЫ";
}

export function referenceLabel(url: string) {
  const host = new URL(url).hostname;
  if (host.endsWith("hko.gov.hk"))
    return "Hong Kong Observatory · календарные основы";
  if (host === "6tail.cn") return "lunar · документация календарного расчёта";
  if (host === "github.com") return "Astrowed · методика расчёта";
  if (host.endsWith("noaa.gov")) return "NOAA · магнитное склонение";
  if (host.endsWith("joeyyap.com")) return "Joey Yap · справочник по Ци Мэнь";
  return host;
}
