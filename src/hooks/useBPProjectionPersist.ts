import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BalanceSheetProjectionInputs } from '@/core/types';
import { saveBalanceSheetProjection } from '@/lib/actions/models';
import { toast } from 'sonner';

interface UseBPProjectionPersistOptions {
  modelId: string;
  debounceMs?: number;
}

interface UseBPProjectionPersistResult {
  isSaving: boolean;
  lastSavedAt: Date | null;
  error: string | null;
  save: (data: BalanceSheetProjectionInputs[]) => void;
}

export function useBPProjectionPersist({
  modelId,
  debounceMs = 800,
}: UseBPProjectionPersistOptions): UseBPProjectionPersistResult {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestDataRef = useRef<BalanceSheetProjectionInputs[] | null>(null);

  const save = useCallback((data: BalanceSheetProjectionInputs[]) => {
    if (!modelId) return;

    latestDataRef.current = data;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      const dataToSave = latestDataRef.current;
      if (!dataToSave) return;

      setIsSaving(true);
      setError(null);

      try {
        const result = await saveBalanceSheetProjection(modelId, dataToSave);

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
        console.error('[useBPProjectionPersist] Error:', err);
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);
  }, [modelId, debounceMs, router]);

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
