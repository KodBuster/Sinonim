import { MESSENGERS, SITE_PHONE, SITE_PHONE_TEL } from "@/lib/contacts";

const ITEMS = [
  {
    id: "phone",
    label: "Позвонить",
    href: SITE_PHONE_TEL,
    hint: SITE_PHONE,
    external: false,
  },
  ...MESSENGERS.filter((item) => item.id === "max" || item.id === "telegram").map(
    (item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      hint: item.id === "max" ? "Мессенджер MAX" : "Telegram",
      external: true,
    }),
  ),
] as const;

export function MessengersPage() {
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-lg px-4 md:px-6">
        <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
          Контакты
        </p>
        <h1 className="font-heading text-3xl md:text-4xl text-brand-olive-dark mb-3">
          Написать нам
        </h1>
        <p className="text-brand-muted text-sm md:text-base mb-8">
          Выберите удобный способ связи — ответим в рабочее время.
        </p>

        <ul className="space-y-3">
          {ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="flex min-h-14 touch-manipulation items-center justify-between gap-4 rounded-xl border border-brand-olive/15 bg-brand-surface px-5 py-4 text-brand-olive-dark transition-colors hover:border-brand-terracotta hover:bg-white [-webkit-tap-highlight-color:transparent]"
              >
                <span>
                  <span className="block text-base font-medium">{item.label}</span>
                  <span className="block text-sm text-brand-muted">{item.hint}</span>
                </span>
                <span aria-hidden className="text-brand-terracotta text-lg">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-8">
          <a
            href="/"
            className="text-sm text-brand-terracotta hover:underline"
          >
            ← На главную
          </a>
        </p>
      </div>
    </section>
  );
}
