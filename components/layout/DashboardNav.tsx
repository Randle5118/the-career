"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";
import apiClient from "@/libs/api";
import logo from "@/app/icon.png";
import config from "@/config";
import { toast } from "react-hot-toast";
import { Home, ClipboardList, Menu, X, CreditCard, LogOut, ListCheck, Calendar, Briefcase, BarChart } from "lucide-react";

const navLinks = [
  {
    href: "/dashboard",
    label: "ダッシュボード",
    icon: Home,
  },
  {
    href: "/dashboard/my-career",
    label: "MyCareer",
    icon: Briefcase,
  },
  {
    href: "/dashboard/side-jobs",
    label: "副業・兼職",
    icon: Briefcase,
  },
  {
    href: "/dashboard/applications",
    label: "応募一覧",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/statuses",
    label: "ステータス管理",
    icon: ListCheck,
  },
  {
    href: "/dashboard/calendar",
    label: "カレンダー",
    icon: Calendar,
  },
  {
    href: "/dashboard/compare",
    label: "比較する",
    icon: BarChart,
  },
];

// Dashboard navigation: Header on mobile, Sidebar on desktop
const DashboardNav = () => {
  const supabase = createClient();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, [supabase]);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleBilling = async () => {
    setIsLoading(true);

    try {
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-portal",
        {
          returnUrl: window.location.href,
        }
      );

      window.location.href = url;
    } catch (e: any) {
      // 如果是沒有 billing account 的錯誤，顯示更友好的訊息
      if (e.message?.includes("お支払いアカウントがありません")) {
        toast.error("まずプランを選択してください。");
      } else {
        console.error(e);
      }
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
            title={`${config.appName} Dashboard`}
          >
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-8"
              width={32}
              height={32}
            />
            <span className="font-bold text-base text-gray-900">{config.appName}</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="メニューを開く"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer (Slide from Right) */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="lg:hidden fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out">
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                <span className="font-bold text-base text-gray-900">メニュー</span>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="メニューを閉じる"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-[14px] ${
                        isActive(link.href)
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-700 hover:bg-gray-50 font-normal"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="flex-1">{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Footer - User Actions */}
              <div className="p-4 border-t border-gray-200 space-y-2">
                {/* User Info */}
                {mounted && (
                  <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                    {user?.user_metadata?.avatar_url ? (
                      <img
                        src={user?.user_metadata?.avatar_url}
                        alt={"Profile picture"}
                        className="w-9 h-9 rounded-full shrink-0 border border-gray-200"
                        referrerPolicy="no-referrer"
                        width={36}
                        height={36}
                      />
                    ) : (
                      <span className="w-9 h-9 bg-gray-200 flex justify-center items-center rounded-full shrink-0 capitalize text-sm font-medium text-gray-700">
                        {user?.email?.charAt(0) || "U"}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-[14px] text-gray-900">
                        {user?.user_metadata?.name || user?.email?.split("@")[0] || "ユーザー"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user?.email || ""}
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Button */}
                <button
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all text-[14px] text-gray-700"
                  onClick={handleBilling}
                  disabled={isLoading}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="flex-1 text-left">お支払い情報</span>
                  {isLoading && (
                    <span className="loading loading-spinner loading-xs"></span>
                  )}
                </button>

                {/* Logout Button */}
                <button
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-all text-[14px] text-gray-700"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="flex-1 text-left">ログアウト</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 w-64 bg-white border-r border-gray-200 z-40">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 h-16 px-6 border-b border-gray-200 bg-white">
            <Image
              src={logo}
              alt={`${config.appName} logo`}
              className="w-8"
              width={32}
              height={32}
            />
            <span className="font-bold text-lg text-gray-900">
              {config.appName}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-[14px] ${
                    isActive(link.href)
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-700 hover:bg-gray-50 font-normal"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="flex-1">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Account Section at Bottom */}
          <div className="p-4 border-t border-gray-200 bg-white space-y-2">
            {/* User Info */}
            {mounted && (
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user?.user_metadata?.avatar_url}
                    alt={"Profile picture"}
                    className="w-9 h-9 rounded-full shrink-0 border border-gray-200"
                    referrerPolicy="no-referrer"
                    width={36}
                    height={36}
                  />
                ) : (
                  <span className="w-9 h-9 bg-gray-200 flex justify-center items-center rounded-full shrink-0 capitalize text-sm font-medium text-gray-700">
                    {user?.email?.charAt(0) || "U"}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-[14px] text-gray-900">
                    {user?.user_metadata?.name || user?.email?.split("@")[0] || "ユーザー"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user?.email || ""}
                  </div>
                </div>
              </div>
            )}

            {/* Billing Button */}
            <button
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all text-[14px] text-gray-700"
              onClick={handleBilling}
              disabled={isLoading}
            >
              <CreditCard className="w-4 h-4" />
              <span className="flex-1 text-left">お支払い情報</span>
              {isLoading && (
                <span className="loading loading-spinner loading-xs"></span>
              )}
            </button>

            {/* Logout Button */}
            <button
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-all text-[14px] text-gray-700"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              <span className="flex-1 text-left">ログアウト</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardNav;
