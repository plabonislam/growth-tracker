import { STEPS, TONE } from '../landing.constants';

export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold">
            A 3-Step Journey to Success
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Our proven methodology ensures that every member reaches their
            professional potential through continuous engagement.
          </p>
        </div>

        <div className="relative space-y-12">
          {/* vertical spine */}
          <div className="absolute bottom-0 left-6 top-0 hidden w-px bg-border sm:block md:left-1/2 md:-translate-x-1/2" />

          {STEPS.map((step) => {
            const tone = TONE[step.tone];
            const Icon = step.icon;
            const reverse = step.order % 2 === 0;
            return (
              <div
                key={step.order}
                className={`relative flex flex-col items-center gap-8 md:flex-row ${
                  reverse ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className={`md:w-1/2 ${reverse ? '' : 'md:text-right'}`}>
                  <h3 className={`mb-2 text-2xl font-semibold ${tone.text}`}>
                    {step.order}. {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                <div
                  className={`z-10 flex size-12 shrink-0 items-center justify-center rounded-full font-bold text-white ring-8 ring-background ${tone.bg}`}
                >
                  {step.order}
                </div>
                <div className="hidden md:block md:w-1/2">
                  <div className="flex h-32 items-center gap-4 rounded-xl border bg-muted/40 p-6">
                    <Icon className={`size-9 ${tone.text}`} />
                    <div className="h-2 w-full overflow-hidden rounded-full bg-background">
                      <div className={`h-full w-2/3 ${tone.bg}`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
