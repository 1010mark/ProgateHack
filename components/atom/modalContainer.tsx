import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalContainerProps {
  children: ReactNode;
  onClose: () => void;
}

export const ModalContainer = ({ children, onClose }: ModalContainerProps) => {
  return (
    <div className='fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200'>
      <div className='bg-white rounded-lg p-6 w-[600px] relative animate-in slide-in-from-bottom-4 duration-300'>
        <button
          onClick={onClose}
          className='absolute right-4 top-4 text-gray-500 hover:text-gray-700'
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};
