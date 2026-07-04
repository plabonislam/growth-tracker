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
    <section id="success-stories" className="bg-slate-900 py-20 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="font-serif text-3xl font-bold">Success Stories</h2>
          <p className="mt-4 text-slate-400">
            Hear from engineers who transformed their career through DSI Club.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="rounded-2xl border border-slate-700 bg-slate-800 p-8"
            >
              <figcaption className="mb-6 flex items-center gap-4">
                <div
                  className={`flex size-14 items-center justify-center rounded-full font-bold text-white ${TONE[t.tone].bg}`}
                >
                  {initials(t.name)}
                </div>
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className={`text-sm ${TONE[t.tone].text}`}>{t.role}</div>
                </div>
              </figcaption>
              <blockquote className="italic text-slate-300">
                “{t.quote}”
              </blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
