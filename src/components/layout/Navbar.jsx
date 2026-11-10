"use client";

import React, { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Menu, Search, X } from "lucide-react";
import Breadcrumb from "./Breadcrumb";
import GlobalSearch from "./GlobalSearch";
import NotificationButton from "./NotificationButton";
import AdminProfileMenu from "./AdminProfileMenu";
import Button from "../ui/Button";

export default function Navbar({
  collapsed = false,
  onToggleCollapse,
  onToggleMobile,
  breadcrumbItems,
  onLogout,
  className = "",
}) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 right-0 h-[66px] bg-white border-b border-[#E5E7EB] z-30 transition-all duration-300 ease-in-out ${
        collapsed
          ? "left-0 lg:left-[72px] w-full lg:w-[calc(100%-72px)]"
          : "left-0 lg:left-[255px] w-full lg:w-[calc(100%-255px)]"
      } ${className}`}
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* LEFT SECTION: Toggle Button + Breadcrumb */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Desktop/Tablet Toggle Button */}
          <Button
            variant="default"
            size="icon-toggle"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Buka Sidebar" : "Tutup Sidebar"}
            className="hidden lg:flex"
            title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-[18px] h-[18px] text-[#4B465C]" strokeWidth={1.8} />
            ) : (
              <PanelLeftClose className="w-[18px] h-[18px] text-[#4B465C]" strokeWidth={1.8} />
            )}
          </Button>

          {/* Mobile Drawer Toggle Button */}
          <Button
            variant="default"
            size="icon-toggle"
            onClick={onToggleMobile}
            aria-label="Buka Menu"
            className="flex lg:hidden"
            title="Buka Menu"
          >
            <Menu className="w-[18px] h-[18px] text-[#4B465C]" strokeWidth={1.8} />
          </Button>

          {/* Breadcrumb Navigation */}
          <div className="hidden sm:block">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        {/* CENTER / RIGHT SECTION */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 ml-auto">
          {/* Global Search Input (Desktop & Tablet) */}
          <div className="hidden md:block">
            <GlobalSearch />
          </div>

          {/* Mobile Search Toggle Icon (<768px) */}
          <div className="block md:hidden">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              aria-label="Buka Pencarian"
              className="w-9 h-9 flex items-center justify-center bg-white border border-[#E5E7EB] rounded-[9px] text-[#4B465C] hover:bg-gray-50 transition-colors"
            >
              {mobileSearchOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Notification Button */}
          <NotificationButton />

          {/* Vertical Divider */}
          <div className="h-7 w-[1px] bg-[#E5E7EB] shrink-0" aria-hidden="true" />

          {/* Admin Profile Section */}
          <AdminProfileMenu onLogout={onLogout} />
        </div>
      </div>

      {/* Expandable Mobile Search Bar Dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden absolute top-[66px] left-0 right-0 bg-white border-b border-[#E5E7EB] p-3 shadow-md animate-in slide-in-from-top-1">
          <GlobalSearch className="max-w-none" />
        </div>
      )}
    </header>
  );
}
