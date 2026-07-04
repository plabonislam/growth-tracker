import { BENEFITS, TONE } from '../landing.constants';

export function BenefitsSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => {
            const tone = TONE[benefit.tone];
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className={`flex h-full flex-col rounded-xl border-t-4 bg-card p-6 shadow-sm transition-all hover:shadow-md ${tone.border}`}
              >
                <div
                  className={`mb-6 flex size-12 items-center justify-center rounded-lg ${tone.bgSoft}`}
                >
                  <Icon className={`size-6 ${tone.text}`} />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
