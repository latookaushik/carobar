'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { logInfo } from '@/app/lib/logging';

// Using same Purchase data structure from the form
import PurchaseEntryForm, { PurchaseFormData } from './PurchaseEntryForm';

type PurchaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  initialData?: Partial<PurchaseFormData>;
};

export default function PurchaseModal({
  isOpen,
  onClose,
  isEditing = false,
  initialData = {},
}: PurchaseModalProps) {
  // Log the initial data for debugging
  logInfo(`PurchaseModal: initialData=${JSON.stringify(initialData)}`);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent scrolling on the body when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-start justify-center p-4">
      <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-lg max-h-[90vh] overflow-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="p-1">
          <PurchaseEntryForm isEditing={isEditing} initialData={initialData} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
