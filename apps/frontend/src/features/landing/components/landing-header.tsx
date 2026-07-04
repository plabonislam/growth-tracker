import { GraduationCap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { navigate } from '@/lib/navigation';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-primary">
            DSI Club
          </span>
        </div>
        <Button size="sm" onClick={() => navigate('/login')}>
          Login
        </Button>
      </div>
    </header>
  );
}
