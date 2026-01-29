'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/error-state';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erro na visualização:', error);
  }, [error]);

  return (
    <div className="container py-8">
      <ErrorState
        title="Erro ao carregar visualização"
        message={
          error.message ||
          'Ocorreu um erro inesperado ao carregar a visualização. Por favor, tente novamente.'
        }
        onRetry={reset}
      />
    </div>
  );
}
