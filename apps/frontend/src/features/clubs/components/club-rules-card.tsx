import { CheckCircle2, Gavel } from 'lucide-react';

import { Card } from '@/components/ui/card';

export function ClubRulesCard({ rules }: { rules: string[] }) {
  return (
    <Card className="gap-0 p-6">
      <h3 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold">
        <Gavel className="size-5 text-primary" />
        Club Rules
      </h3>
      <div className="h-48 overflow-y-auto rounded-lg border bg-muted/40 p-4">
        <ul className="space-y-3 text-sm text-muted-foreground">
          {rules.map((rule) => (
            <li key={rule} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
