import React from 'react';
import { X } from 'lucide-react';

interface ModalContainerProps {
  children: React.ReactNode;
  onClose: () => void;
}

export const ModalContainer = ({ children, onClose }: ModalContainerProps) => {
  <div className='fixed inset-0 flex items-center justify-center z-50'>
    <div
      className='absolute inset-0 bg-black opacity-50'
      onClick={onClose}
    ></div>
    <div className='relative w-1/2 h-4/5 bg-white rounded-xl shadow-lg p-6 overflow-auto'>
      <button
        className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:cursor-pointer'
        onClick={onClose}
      >
        <X />
      </button>
      {children}
    </div>
  </div>;
};
