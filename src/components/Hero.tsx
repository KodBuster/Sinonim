import { HeroContent } from "./HeroContent";
import { HeroMedia } from "./HeroMedia";

export function Hero() {
  return (
    <section className="relative bg-white border-b border-brand-sand">
      <div className="relative mx-auto max-w-7xl lg:px-10">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-12 items-center lg:min-h-[580px]">
          <HeroContent className="order-2 lg:order-1 px-4 md:px-6 lg:px-10 pt-4 pb-8 lg:py-16" />

          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end px-0 pt-0 pb-1 lg:px-0 lg:py-16">
            <div className="relative w-full lg:max-w-lg">
              <div className="relative aspect-[3/4] overflow-hidden rounded-none border-0 bg-black lg:rounded-2xl lg:border lg:border-brand-sand lg:shadow-lg">
                <HeroMedia />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
