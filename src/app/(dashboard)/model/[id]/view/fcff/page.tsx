import { redirect } from 'next/navigation';

export default async function FCFFPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/model/${id}/view/balance-sheet`);
}
