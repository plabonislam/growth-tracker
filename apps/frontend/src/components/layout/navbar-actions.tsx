import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/** Id of the slot `AppShell` renders on the right of the top bar. */
export const NAVBAR_ACTIONS_SLOT_ID = 'navbar-actions';

/**
 * Renders page-owned actions (e.g. "Create Module") into the app navbar.
 * Lets a deep feature component put a button in the top bar without the shell
 * having to know which page is mounted or what role the viewer holds.
 */
export function NavbarActions({ children }: { children: React.ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  // The slot lives in AppShell, which mounts before any page — resolve it
  // after the first paint so the portal has a target.
  useEffect(() => {
    setSlot(document.getElementById(NAVBAR_ACTIONS_SLOT_ID));
  }, []);

  return slot ? createPortal(children, slot) : null;
}
