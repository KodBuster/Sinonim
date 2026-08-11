export const SITE_PHONE = "+7 (499)65-35-925";
export const SITE_PHONE_TEL = "tel:+74996535925";

const PHONE_DIGITS = "79037613697";
const TELEGRAM_PHONE = "+79037613697";
const DEFAULT_MESSAGE = "Здравствуйте! Интересуют украшения Синоним";

export const MESSENGERS = [
  {
    id: "max",
    label: "MAX",
    href: "https://max.ru/u/f9LHodD0cOJvAR42F_FFaqrLPtQm2Kw36zndWQqfnUVs01NnnVKahc6wOJ4",
  },
  {
    id: "telegram",
    label: "Telegram",
    href: `https://t.me/${TELEGRAM_PHONE}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: `https://wa.me/${PHONE_DIGITS}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`,
  },
] as const;

export const SHOWROOM = {
  title: "Шоурум Синоним",
  address: "129110, г. Москва, ул. Гиляровского 40, офис 13",
  hours: "Пн–Пт: 10:00 – 19:00",
  phone: SITE_PHONE,
  mapQuery: "129110, Москва, ул. Гиляровского 40, офис 13",
};

export const SHOWROOM_GEO = {
  latitude: 55.7798,
  longitude: 37.6375,
} as const;

export const SHOWROOM_MAP_EMBED_URL = `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(SHOWROOM.mapQuery)}&z=17&l=map`;

export const SHOWROOM_MAP_LINK = `https://yandex.ru/maps/?text=${encodeURIComponent(SHOWROOM.mapQuery)}`;
