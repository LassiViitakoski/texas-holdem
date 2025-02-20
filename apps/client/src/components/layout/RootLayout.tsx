import { Outlet } from '@tanstack/react-router';
import { Navbar } from '@/components/layout/Navbar';

export const RootLayout = () => (
  <div className="min-h-screen bg-gray-100">
    <header className="bg-white shadow">
      <Navbar />
    </header>
    <main className="container mx-auto px-4 py-8">
      <Outlet />
    </main>
  </div>
);
