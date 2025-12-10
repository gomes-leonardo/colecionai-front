'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/shared/navbar';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tourHandler, setTourHandler] = useState<(() => void) | undefined>();

  useEffect(() => {
    const handleStartTour = () => {
      // Dispara o evento customizado que o wrapper vai escutar
      const event = new CustomEvent('start-analysis-tour');
      window.dispatchEvent(event);
    };

    setTourHandler(() => handleStartTour);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onStartTour={tourHandler} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
