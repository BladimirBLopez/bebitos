export default function PageHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
      <div>
        <h1 className="font-sans text-xl sm:text-2xl font-bold text-panel-ink">
          {title}
        </h1>
        {meta && (
          <p className="text-panel-ink-soft text-sm mt-0.5">{meta}</p>
        )}
      </div>
      {action}
    </div>
  );
}