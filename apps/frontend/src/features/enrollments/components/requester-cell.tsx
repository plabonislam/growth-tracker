export function RequesterCell({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return (
    <div className="min-w-0">
      {/* Below 1400px the email hides — hover the name to reveal it in a tooltip. */}
      <div className="group relative w-fit">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <span className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden w-max max-w-56 rounded-lg border bg-popover px-3 py-1.5 text-xs text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:flex group-hover:opacity-100 min-[1400px]:hidden!">
          {email}
        </span>
      </div>
      <p className="hidden truncate text-xs text-muted-foreground min-[1400px]:block">
        {email}
      </p>
    </div>
  );
}
