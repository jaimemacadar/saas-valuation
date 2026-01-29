import { notFound } from 'next/navigation';
import { getModelById } from '@/lib/actions/models';

export default async function ViewLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getModelById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">{result.data.company_name}</h1>
        {result.data.description && (
          <p className="text-muted-foreground mt-1">{result.data.description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
