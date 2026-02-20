"use client";

import React, { useState, ReactNode } from "react";
import HeaderDashboard from "../components/HeaderDashboard";
import Sidebar from "../components/Sidebar";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen">
      
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div
        className={`
          relative flex flex-1 flex-col transition-all duration-300 overflow-auto
          ${isCollapsed ? "lg:ml-20" : "lg:ml-80"}
        `}
      >
        <HeaderDashboard
        //   sidebarOpen={sidebarOpen}
        //   setSidebarOpen={setSidebarOpen}
        //   isCollapsed={isCollapsed}
        //   setIsCollapsed={setIsCollapsed}
        />

        <main className="p-3 md:p-6 2xl:p-10 transition-all duration-300 ">
          {children}
        </main>
      </div>
    </div>
  );
}
