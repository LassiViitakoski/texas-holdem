import { Link } from '@tanstack/react-router';
import { Chip } from '@/components/shared';

export const Navbar = () => (
  <div className="w-full bg-gray-900/80 backdrop-blur-sm border-gray-700">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="text-white font-bold text-xl">
            PokerPro
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          <Link to="/games" className="text-gray-300 hover:text-white transition-colors">
            Games
          </Link>

          <Link to="/profile" className="text-gray-300 hover:text-white transition-colors">
            Profile
          </Link>
          <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
            Register
          </Link>
          <Chip amount={5000} className="ml-4" />
        </nav>
      </div>
    </div>
  </div>
);
