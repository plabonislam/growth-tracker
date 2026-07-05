import { Globe, Mail, Terminal } from 'lucide-react';

const COLUMNS = [
  { title: 'Platform', links: ['Browse', 'Stories', 'How it Works'] },
  { title: 'Support', links: ['FAQ', 'Privacy', 'Terms'] },
  { title: 'Community', links: ['Discord', 'GitHub'] },
];

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-[1800px] px-10 py-20">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="space-y-6 md:col-span-4">
            <div className="font-serif text-2xl font-black text-primary">
              DSI Club
            </div>
            <p className="max-w-sm text-lg leading-relaxed text-muted-foreground">
              Building the future of engineering excellence through community
              and structured growth.
            </p>
            <div className="flex gap-6 text-muted-foreground">
              <Globe className="size-6 cursor-pointer transition-colors hover:text-primary" />
              <Terminal className="size-6 cursor-pointer transition-colors hover:text-primary" />
              <Mail className="size-6 cursor-pointer transition-colors hover:text-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 md:col-span-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h5 className="mb-6 text-lg font-bold">{col.title}</h5>
                <ul className="space-y-4 text-muted-foreground">
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
        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t pt-10 sm:flex-row">
          <div className="text-sm text-muted-foreground">
            © 2024 DSI Club. All rights reserved.
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Designed for Engineers by Engineers
          </div>
        </div>
      </div>
    </footer>
  );
}
