"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AdminLayout({
  children,
  breadcrumbItems,
  onLogout,
  className = "",
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-handle tablet screens (768px - 1024px)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 768 && width <= 1024) {
        setCollapsed(true);
      } else if (width > 1024) {
        setCollapsed(false);
      }
      if (width >= 1024) {
        setMobileOpen(false);
      }
    };

    // Run on initial mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  const handleToggleMobile = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleCloseMobile = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#27233A] font-sans antialiased">
      {/* 1. Sidebar */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={handleCloseMobile}
      />

      {/* 2. Top Navbar */}
      <Navbar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        onToggleMobile={handleToggleMobile}
        breadcrumbItems={breadcrumbItems}
        onLogout={onLogout}
      />

      {/* 3. Main Content Area */}
      <div
        className={`min-h-screen pt-[66px] flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-[255px]"
        }`}
      >
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 ${className}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
