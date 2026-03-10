import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden w-full max-w-[100vw]">
      <Header />
      <main className="flex-1 w-full overflow-hidden pt-16">
        {children}
      </main>
    </div>
  );
};