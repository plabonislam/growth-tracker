import { Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router';

/** Authenticated app top bar — avatar, brand, notifications. */
export function AppHeader() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center justify-between px-4 md:px-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-3"
        >
          <span className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-muted text-muted-foreground">
            <User className="size-5" />
          </span>
          <span className="font-serif text-xl font-extrabold tracking-tight text-primary">
            DSI Clubs
          </span>
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  );
}
