import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-stone-200 shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 bg-stone-50">
          <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-xl font-bold leading-none cursor-pointer"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};