import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DREProjectionInputs } from '@/core/types';
import { saveDREProjection } from '@/lib/actions/models';
import { toast } from 'sonner';

interface UseDREProjectionPersistOptions {
  modelId: string;
  debounceMs?: number;
}

interface UseDREProjectionPersistResult {
  isSaving: boolean;
  lastSavedAt: Date | null;
  error: string | null;
  save: (data: DREProjectionInputs[]) => void;
}

export function useDREProjectionPersist({
  modelId,
  debounceMs = 800,
}: UseDREProjectionPersistOptions): UseDREProjectionPersistResult {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestDataRef = useRef<DREProjectionInputs[] | null>(null);

  const save = useCallback((data: DREProjectionInputs[]) => {
    if (!modelId) return;

    latestDataRef.current = data;

    // Limpa timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Seta novo timer de debounce
    debounceTimerRef.current = setTimeout(async () => {
      const dataToSave = latestDataRef.current;
      if (!dataToSave) return;

      setIsSaving(true);
      setError(null);

      try {
        const result = await saveDREProjection(modelId, dataToSave);

        if (result.success) {
          setLastSavedAt(new Date());
          router.refresh();
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
    }, debounceMs);
  }, [modelId, debounceMs, router]);

  // Cleanup do timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSavedAt,
    error,
    save,
  };
}
