export const consultationGreeting =
  "Здравствуйте, Юлия! Хочу записаться к вам на консультацию. Подскажите, пожалуйста, какие есть форматы, стоимость и ближайшее свободное время.";

const draft = encodeURIComponent(consultationGreeting);

export const consultationLinks = {
  whatsapp: `https://wa.me/77777644655?text=${draft}`,
  telegram: `https://t.me/+77777644655?text=${draft}`,
};
