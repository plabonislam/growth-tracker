import { Globe, Mail, Terminal } from 'lucide-react';

const COLUMNS = [
  { title: 'Platform', links: ['Browse', 'Stories', 'How it Works'] },
  { title: 'Support', links: ['FAQ', 'Privacy', 'Terms'] },
  { title: 'Community', links: ['Discord', 'GitHub'] },
];

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-8 py-12 md:grid-cols-2">
        <div className="space-y-4">
          <div className="text-lg font-black">DSI Club</div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Building the future of engineering excellence through community and
            structured growth.
          </p>
          <div className="flex gap-4 text-muted-foreground">
            <Globe className="size-5 cursor-pointer transition-colors hover:text-primary" />
            <Terminal className="size-5 cursor-pointer transition-colors hover:text-primary" />
            <Mail className="size-5 cursor-pointer transition-colors hover:text-primary" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h5 className="mb-4 font-bold">{col.title}</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="transition-colors hover:text-primary"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t px-8 py-8 sm:flex-row">
        <div className="text-sm text-muted-foreground">
          © 2024 DSI Club. All rights reserved.
        </div>
        <div className="text-sm text-muted-foreground">
          Designed for Engineers by Engineers
        </div>
      </div>
    </footer>
  );
}
