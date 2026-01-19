"use client";

import { FC, useState } from 'react';
import { Video, Shield, Users, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

interface NavbarProps {
  className?: string;
}

const Navbar: FC<NavbarProps> = ({ className = '' }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [showLogoutOption, setShowLogoutOption] = useState(false);
  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/auth/signin" });
    } catch (error) {
      console.error("Logout failed. Please try again.");
    }
  }

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
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => setShowLogoutOption(prev => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-emerald-50 transition"
                >
                  <UserCircle className="w-6 h-6 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">
                    {session?.user?.name}
                  </span>
                </button>

                {showLogoutOption && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-xl border-gray-200 z-50 py-1">
                    <button
                      onClick={() => router.push('/dashboard')}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      My Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 mt-1"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;