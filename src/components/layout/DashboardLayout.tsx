import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from './Sidebar';
  return (
    <div className="flex h-screen w-full bg-background relative overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto relative z-10">
        {children}
      </main>
    </div>
  );
};
