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
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-emerald-600 transition">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 transition">How it Works</a>
            </div>

            {!session?.user ? (
              <>
                <button onClick={() => router.push('/auth/signin')} className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition">
                  Sign In
                </button>
                <button onClick={() => router.push('/auth/signup')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-lg">
                  Get Started Free
                </button>
              </>
              )
              : (
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
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white border rounded-lg shadow-md border-gray-200 z-50">
                    <button
                      onClick={()=>handleLogout()}
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              )
            }
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;