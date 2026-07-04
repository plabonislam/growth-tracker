import { BenefitsSection } from '@/features/landing/components/benefits-section';
import { ClubsSection } from '@/features/landing/components/clubs-section';
import { FaqSection } from '@/features/landing/components/faq-section';
import { FinalCtaSection } from '@/features/landing/components/final-cta-section';
import { HeroSection } from '@/features/landing/components/hero-section';
import { HowItWorksSection } from '@/features/landing/components/how-it-works-section';
import { LandingFooter } from '@/features/landing/components/landing-footer';
import { LandingHeader } from '@/features/landing/components/landing-header';
import { StatsSection } from '@/features/landing/components/stats-section';
import { TestimonialsSection } from '@/features/landing/components/testimonials-section';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />
      <main>
        <HeroSection />
        <StatsSection />
        <BenefitsSection />
        <ClubsSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
