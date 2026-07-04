import { Button } from '@/components/ui/button';
import { navigate } from '@/lib/navigation';

export function FinalCtaSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-12 text-center text-primary-foreground">
          <h2 className="relative z-10 mb-6 font-serif text-3xl font-bold sm:text-4xl">
            Ready to level up your engineering game?
          </h2>
          <p className="relative z-10 mx-auto mb-10 max-w-xl text-lg text-primary-foreground/80">
            Join hundreds of engineers who have already started their journey
            towards technical mastery.
          </p>
          <div className="relative z-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/login')}
            >
              Get Started Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              Talk to a Mentor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
