import { TONE } from '../landing.constants';
import { useStats } from '../hooks/use-landing';

export function StatsSection() {
  const { data: stats = [] } = useStats();

  return (
    <section className="border-y bg-muted/30 py-8">
      <div className="mx-auto max-w-[1800px] px-6">
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.id}>
              <div className={`text-5xl font-bold ${TONE[stat.tone].text}`}>
                {stat.value}
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
