import { FaqSection } from "@/components/seo/FaqSection";
import { WARRANTY_FAQ_ITEMS } from "@/lib/warranty-faq";

export function WarrantyFaq() {
  return (
    <FaqSection
      title="Отвечаем на вопросы"
      subtitle="Об ограненных синтетических алмазах, качестве и гарантии"
      items={WARRANTY_FAQ_ITEMS}
    />
  );
}
