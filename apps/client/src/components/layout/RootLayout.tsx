import { Link, Outlet } from "@tanstack/react-router";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <nav className="container mx-auto px-4 py-3">
          <Link to="/">Home</Link>
          <Link to="/games">Games</Link>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
} 