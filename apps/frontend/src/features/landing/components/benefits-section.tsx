import { BENEFITS, TONE } from '../landing.constants';

export function BenefitsSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1800px] px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => {
            const tone = TONE[benefit.tone];
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className={`group flex h-full flex-col rounded-2xl border-t-4 bg-card p-10 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0px_12px_32px_rgba(0,0,0,0.08)] ${tone.border}`}
              >
                <div
                  className={`mb-8 flex size-14 items-center justify-center rounded-xl transition-colors ${tone.bgSoft} ${tone.groupHoverBg}`}
                >
                  <Icon
                    className={`size-6 transition-colors ${tone.text} group-hover:text-white`}
                  />
                </div>
                <h3 className="mb-4 font-serif text-2xl font-semibold">
                  {benefit.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
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
