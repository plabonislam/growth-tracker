import { ArrowDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { navigate } from '@/lib/navigation';
import heroEngineers from '@/assets/hero-engineers.png';
import { HERO } from '../landing.constants';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pb-28 pt-20">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <h1 className="mb-8 max-w-2xl font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Grow Faster <span className="text-primary">Together</span> in the DSI
          Club
        </h1>
        <p className="mb-12 max-w-xl text-muted-foreground">{HERO.subtitle}</p>
        <div className="flex flex-col items-center gap-6">
          <Button size="lg" onClick={() => navigate('/login')}>
            {HERO.primaryCta}
          </Button>
          <a
            href="#success-stories"
            className="flex items-center gap-2 font-bold text-primary hover:underline"
          >
            {HERO.secondaryCta}
            <ArrowDown className="size-4" />
          </a>
        </div>

        {/* Hero visual — exact Stitch asset */}
        <div className="mt-16 w-full max-w-2xl rounded-3xl border bg-card p-4 shadow-[0px_20px_40px_rgba(0,0,0,0.08)]">
          <img
            src={heroEngineers}
            alt="Diverse team of software engineers collaborating on a complex coding project in a modern office."
            className="h-auto w-full rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
}
