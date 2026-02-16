import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DREProjectionInputs } from '@/core/types';
import { saveDREProjection } from '@/lib/actions/models';
import { toast } from 'sonner';

interface UseDREProjectionPersistOptions {
  modelId: string;
  projectionData: DREProjectionInputs[];
  debounceMs?: number;
}

interface UseDREProjectionPersistResult {
  isSaving: boolean;
  lastSavedAt: Date | null;
  error: string | null;
}

export function useDREProjectionPersist({
  modelId,
  projectionData,
  debounceMs = 800,
}: UseDREProjectionPersistOptions): UseDREProjectionPersistResult {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevDataRef = useRef<string>('');

  useEffect(() => {
    // Não faz nada se modelId for vazio
    if (!modelId) {
      return;
    }

    // Verifica se os dados mudaram
    const currentData = JSON.stringify(projectionData);
    if (currentData === prevDataRef.current) {
      return;
    }

    // Limpa timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Seta novo timer de debounce
    debounceTimerRef.current = setTimeout(() => {
      const performSave = async () => {
        setIsSaving(true);
        setError(null);

        try {
          const result = await saveDREProjection(modelId, projectionData);

          if (result.success) {
            setLastSavedAt(new Date());
            prevDataRef.current = currentData;

            // Revalida a página para atualizar valores calculados
            startTransition(() => {
              router.refresh();
            });
          } else {
            const errorMsg = result.error || 'Erro ao salvar premissas';
            setError(errorMsg);
            toast.error(errorMsg);
          }
        } catch (err) {
          const errorMsg = 'Erro inesperado ao salvar premissas';
          setError(errorMsg);
          toast.error(errorMsg);
          console.error('[useDREProjectionPersist] Error:', err);
        } finally {
          setIsSaving(false);
        }
      };

      performSave();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [modelId, projectionData, debounceMs, router]);

  return {
    isSaving: isSaving || isPending,
    lastSavedAt,
    error,
  };
}
