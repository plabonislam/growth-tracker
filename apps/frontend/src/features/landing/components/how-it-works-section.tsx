import { STEPS, TONE } from '../landing.constants';

export function HowItWorksSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-6 font-serif text-4xl font-bold">
            A 3-Step Journey to Success
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Our proven methodology ensures that every member reaches their
            professional potential through continuous engagement.
          </p>
        </div>

        <div className="relative">
          {/* vertical spine */}
          <div className="absolute bottom-0 left-6 top-0 hidden w-1 bg-border/40 sm:block md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-24">
            {STEPS.map((step) => {
              const tone = TONE[step.tone];
              const Icon = step.icon;
              const reverse = step.order % 2 === 0;
              return (
                <div
                  key={step.order}
                  className={`relative flex flex-col items-center gap-12 md:flex-row lg:gap-24 ${
                    reverse ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className={`md:w-1/2 ${reverse ? '' : 'md:text-right'}`}>
                    <h3
                      className={`mb-4 font-serif text-3xl font-semibold ${tone.text}`}
                    >
                      {step.order}. {step.title}
                    </h3>
                    <p className="text-lg text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <div
                    className={`z-10 flex size-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg ring-[12px] ring-background ${tone.bg}`}
                  >
                    {step.order}
                  </div>
                  <div className="hidden md:block md:w-1/2">
                    <div className="flex h-40 items-center gap-8 rounded-[2rem] border bg-muted/40 p-10 shadow-sm">
                      <Icon
                        className={`size-14 shrink-0 opacity-60 ${tone.text}`}
                      />
                      <div className="h-3 w-full overflow-hidden rounded-full bg-background shadow-inner">
                        <div className={`h-full w-2/3 ${tone.bg}`} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
