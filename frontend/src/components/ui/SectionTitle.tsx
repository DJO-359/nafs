interface Props {
  icon: string;
  title: string;
}

export default function SectionTitle({ icon, title }: Props) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-2xl">{icon}</span>

      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}
