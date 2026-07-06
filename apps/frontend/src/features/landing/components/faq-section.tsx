import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useFaqs } from '../hooks/use-landing';

export function FaqSection() {
  const { data: faqs = [] } = useFaqs();
  // `undefined` = untouched → first question defaults open once data loads.
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  const activeId = openId === undefined ? faqs[0]?.id : openId;

  return (
    <section className="mx-auto max-w-[1000px] px-6 py-16">
      <div className="mb-16 text-center">
        <h2 className="font-serif text-4xl font-bold">
          Frequently Asked Questions
        </h2>
      </div>
      <div className="space-y-6">
        {faqs.map((faq) => {
          const isOpen = activeId === faq.id;
          return (
            <div
              key={faq.id}
              className="overflow-hidden rounded-xl border bg-card"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-muted/40"
              >
                <span className="font-bold">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    'size-5 shrink-0 transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
              {isOpen && (
                <div className="border-t px-6 py-4 text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
