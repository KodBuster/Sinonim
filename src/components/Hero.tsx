import { AutoplayVideo } from "./AutoplayVideo";
import { HeroContent } from "./HeroContent";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white border-b border-brand-sand">
      <div className="relative mx-auto max-w-7xl lg:px-10">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-12 items-center lg:min-h-[580px]">
          <HeroContent className="order-2 lg:order-1 px-4 md:px-6 lg:px-10 pt-4 pb-8 lg:py-16" />

          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end lg:py-16">
            <div className="relative w-full lg:max-w-lg">
              <div className="relative aspect-square overflow-hidden lg:rounded-2xl lg:shadow-lg lg:border lg:border-brand-sand">
                <AutoplayVideo
                  src="/images/video-hero_2.mp4"
                  className="absolute inset-0 h-full w-full object-cover object-center scale-125"
                  aria-label="Кольцо с лабораторным бриллиантом в серебре"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
