import {
  Compass,
  LayoutDashboard,
  Library,
  User,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { navigate } from '@/lib/navigation';

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  /** Route not built yet — rendered muted and non-interactive. */
  comingSoon?: boolean;
}

const ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Explore', icon: Compass, path: '/explore' },
  { label: 'My Topics', icon: Library, path: '/my-topics', comingSoon: true },
  { label: 'Profile', icon: User, path: '/profile', comingSoon: true },
];

/** Mobile bottom navigation. `activePath` marks the current tab. */
export function BottomNav({ activePath }: { activePath: string }) {
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t bg-background px-2 pb-[env(safe-area-inset-bottom)] shadow-[0px_-4px_12px_rgba(0,0,0,0.05)]">
      {ITEMS.map(({ label, icon: Icon, path, comingSoon }) => {
        const isActive = activePath === path;
        return (
          <button
            key={label}
            type="button"
            disabled={comingSoon}
            onClick={() => navigate(path)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
              isActive
                ? 'scale-105 font-bold text-primary'
                : 'text-muted-foreground hover:text-primary',
              comingSoon &&
                'text-muted-foreground/40 hover:text-muted-foreground/40',
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
