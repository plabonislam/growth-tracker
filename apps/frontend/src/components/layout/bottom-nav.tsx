import { Compass, LayoutDashboard, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router';

import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

/** Only routes that exist — see the sidebar, which lists the same set. */
const ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Explore', icon: Compass, path: '/explore' },
];

/** Mobile bottom navigation. `activePath` marks the current tab. */
export function BottomNav({ activePath }: { activePath: string }) {
  const navigate = useNavigate();
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t bg-background px-2 pb-[env(safe-area-inset-bottom)] shadow-[0px_-4px_12px_rgba(0,0,0,0.05)]">
      {ITEMS.map(({ label, icon: Icon, path }) => {
        const isActive = activePath === path;
        return (
          <button
            key={label}
            type="button"
            onClick={() => navigate(path)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors',
              isActive
                ? 'scale-105 font-bold text-primary'
                : 'text-muted-foreground hover:text-primary',
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
