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

  return <>{children}</>;
}
