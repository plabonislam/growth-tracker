import { TONE } from '../landing.constants';
import { useTestimonials } from '../hooks/use-landing';

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function TestimonialsSection() {
  const { data: testimonials = [] } = useTestimonials();

  return (
    <section id="success-stories" className="bg-slate-900 py-16 text-white">
      <div className="mx-auto max-w-[1800px] px-6">
        <div className="mb-20 text-center">
          <h2 className="mb-4 font-serif text-4xl font-bold">
            Success Stories
          </h2>
          <p className="text-lg text-slate-400">
            Hear from engineers who transformed their career through DSI Club.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="group rounded-[2.5rem] border border-slate-700/50 bg-slate-800/50 p-10 backdrop-blur-sm transition-all hover:border-slate-500"
            >
              <figcaption className="mb-8 flex items-center gap-5">
                <div
                  className={`flex size-16 items-center justify-center rounded-full text-lg font-bold text-white ring-4 ring-slate-700 transition-all ${TONE[t.tone].bg}`}
                >
                  {initials(t.name)}
                </div>
                <div>
                  <div className="text-xl font-bold">{t.name}</div>
                  <div className={`font-medium ${TONE[t.tone].text}`}>
                    {t.role}
                  </div>
                </div>
              </figcaption>
              <blockquote className="text-xl italic leading-relaxed text-slate-300">
                “{t.quote}”
              </blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
