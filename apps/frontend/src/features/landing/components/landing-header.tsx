import { GraduationCap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { navigate } from '@/lib/navigation';

/** `showLogin` hides the Login button on pages where it's redundant (e.g. login). */
export function LandingHeader({ showLogin = true }: { showLogin?: boolean }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-primary">
            DSI Club
          </span>
        </div>
        {showLogin && (
          <Button size="sm" onClick={() => navigate('/login')}>
            Login
          </Button>
        )}
      </div>
    </header>
  );
}
