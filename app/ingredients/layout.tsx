import React from 'react';
import { Navbar } from '@/components/molecule/navbar';

interface IngredientsLayoutProps {
  children: React.ReactNode;
}

const IngredientsLayout = ({ children }: IngredientsLayoutProps) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default IngredientsLayout;
