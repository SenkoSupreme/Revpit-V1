'use client';

import { useState, useCallback } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id:      string;
  message: string;
  variant: ToastVariant;
}

/**
 * useToast — minimal toast notification hook.
 * Returns `toasts` array and a `toast(message, variant)` trigger.
 * Auto-dismisses after 3500ms.
 *
 * @example
 * const { toasts, toast } = useToast();
 * toast('Drop submitted!', 'success');
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  return { toasts, toast, dismiss };
}
