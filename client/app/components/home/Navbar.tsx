"use client";

import { FC } from 'react';
import { Video, Shield, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  className?: string;
}

const Navbar: FC<NavbarProps> = ({ className = '' }) => {
  const router = useRouter();
  return (
    <nav className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b ${className}`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              Connect<span className="text-emerald-600">Meet</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-emerald-600 transition">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 transition">How it Works</a>
            </div>

            <button onClick={() => router.push('/auth/signin')} className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
              Sign In
            </button>
            <button onClick={() => router.push('/auth/signup')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-lg">
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;