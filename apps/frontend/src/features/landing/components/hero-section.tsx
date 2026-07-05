import { ArrowDown } from 'lucide-react';

import { navigate } from '@/lib/navigation';
import heroEngineers from '@/assets/hero-engineers.png';
import { HERO } from '../landing.constants';

export function HeroSection() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-slate-950">
      {/* Background image + legibility overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroEngineers}
          alt="Diverse team of software engineers collaborating on a complex coding project in a modern office."
          className="size-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="mb-8 font-serif text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
          Grow Faster <span className="text-sky-300">Together</span>
          <br />
          in the DSI Club
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-200 drop-shadow-md md:text-xl">
          {HERO.subtitle}
        </p>
        <div className="flex flex-col items-center gap-8">
          <button
            type="button"
            onClick={() => navigate('/explore')}
            className="rounded-xl bg-primary px-12 py-5 text-lg font-bold text-primary-foreground shadow-2xl transition-all hover:-translate-y-1 hover:shadow-primary/40 active:scale-95"
          >
            {HERO.primaryCta}
          </button>
          <a
            href="#success-stories"
            className="group flex items-center gap-2 font-bold text-sky-300 transition-colors hover:text-white"
          >
            {HERO.secondaryCta}
            <ArrowDown className="size-4 transition-transform group-hover:translate-y-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
