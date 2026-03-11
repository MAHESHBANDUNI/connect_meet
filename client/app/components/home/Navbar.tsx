"use client";

import { FC, useState } from "react";
import { Video, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

interface NavbarProps {
  className?: string;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: FC<NavbarProps> = ({
  className = "",
  sidebarOpen,
  setSidebarOpen,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [showLogoutOption, setShowLogoutOption] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/auth/signin" });
    } catch (error) {
      console.error("Logout failed. Please try again.");
    }
  };

  return (
    <nav className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b ${className}`}>
      <div className="w-full px-2 sm:px-6 py-1.5 sm:py-4">
        <div className="flex items-center justify-between">

          {/* Left Section */}
          <div className="flex items-center gap-1 sm:gap-3">

            {/* Logo */}
            <div className="p-1 sm:p-2 bg-blue-600 rounded-lg">
              <Video className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
            </div>

            <span className="text-lg sm:text-2xl font-bold text-gray-800">
              Connect<span className="text-blue-600">Meet</span>
            </span>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1.5 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition">
                How it Works
              </a>
            </div>

            {!session?.user ? (
              <>
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="cursor-pointer px-1.5 sm:px-4 py-0.5 sm:py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  Sign In
                </button>

                <button
                  onClick={() => router.push("/auth/signup")}
                  className="hidden sm:block cursor-pointer px-2 sm:px-6 py-0.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
                >
                  Get Started Free
                </button>
              </>
            ) : (
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => setShowLogoutOption((prev) => !prev)}
                  className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-50 transition"
                >
                  <UserCircle className="w-6 h-6 text-blue-600" />
                  <span className="text-blue-600 font-medium">
                    {session?.user?.name}
                  </span>
                </button>

                {showLogoutOption && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-xl border-gray-200 z-50 py-1">
                    <button
                      onClick={() => router.push("/meetings")}
                      className="cursor-pointer w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      My Meetings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="cursor-pointer w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 mt-1"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;