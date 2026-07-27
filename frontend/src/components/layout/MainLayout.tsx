interface Props {
  title: string;
  children: React.ReactNode;
}

export default function MainLayout({ title, children }: Props) {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-md p-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">{title}</h1>
        </header>

        <div className="space-y-4">{children}</div>
      </div>
    </main>
  );
}
