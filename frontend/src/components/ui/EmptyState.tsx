interface Props {
  icon: string;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: Props) {
  return (
    <div className="py-8 text-center">
      <div className="mb-3 text-5xl">{icon}</div>

      <div className="font-semibold">{title}</div>

      {description && (
        <p className="mt-2 text-sm text-[var(--app-hint)]">{description}</p>
      )}
    </div>
  );
}
