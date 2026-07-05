import { ShieldUser, Terminal } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GoogleSignInButton } from '@/features/auth/components/google-sign-in-button';
import { LandingHeader } from '@/features/landing/components/landing-header';

function HeroPanel() {
  return (
    <section className="relative hidden overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background p-10 lg:flex lg:flex-col lg:justify-center">
      {/* engineering-grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(currentColor 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px',
          color: 'var(--primary)',
        }}
      />
      {/* soft ambient blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-12 -top-12 size-64 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 -right-12 size-64 rounded-full bg-secondary/10 blur-3xl"
      />
      <div className="relative z-10 max-w-md space-y-4">
        <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight">
          <span className="block text-foreground">Engineering Excellence</span>
          <span className="block text-primary">Starts Here.</span>
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Access the centralized hub for Java development, modern frontends, and
          secure systems.
        </p>
      </div>
    </section>
  );
}

function LoginPanel() {
  return (
    <section className="flex items-center justify-center overflow-y-auto bg-background px-6 py-16 sm:px-10">
      <Card className="w-full max-w-[420px] border-none bg-transparent shadow-none">
        <CardHeader className="items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-primary shadow-sm">
            <ShieldUser className="size-7" />
          </span>
          <CardTitle className="font-serif text-3xl tracking-tight">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in with your @iinovators account
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <GoogleSignInButton />
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Internal use only
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function Footer() {
  return (
    <footer className="z-10 flex shrink-0 flex-col items-center justify-between gap-3 border-t bg-background px-6 py-4 sm:flex-row sm:px-8">
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <div className="flex items-center gap-2">
          <Terminal className="size-5 text-primary" />
          <span className="font-bold tracking-tight text-foreground">
            DSI Club
          </span>
        </div>
        <span
          aria-hidden="true"
          className="hidden h-3 w-px bg-border sm:block"
        />
        <p className="text-xs font-medium text-muted-foreground">
          © 2024 DSI Club. Enterprise Systems Group.
        </p>
      </div>
      <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
        <a href="#" className="transition-colors hover:text-primary">
          Privacy
        </a>
        <a href="#" className="transition-colors hover:text-primary">
          Terms
        </a>
        <a href="#" className="transition-colors hover:text-primary">
          Help
        </a>
      </nav>
    </footer>
  );
}

export function LoginPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <LandingHeader showLogin={false} />
      <main className="grid flex-grow overflow-hidden lg:grid-cols-2">
        <HeroPanel />
        <LoginPanel />
      </main>
      <Footer />
    </div>
  );
}
