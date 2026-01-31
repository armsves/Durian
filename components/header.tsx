"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, LogOut, User, Store, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { DurianLogo } from "@/components/durian-logo";

const navigation = [
  { name: "Solutions", href: "/#solutions" },
  { name: "Directory", href: "/directory" },
  { name: "Legal", href: "/legal" },
];

export function Header() {
  const pathname = usePathname();
  const { authenticated, logout, user } = usePrivy();
  const { theme, setTheme } = useTheme();
  const { userRole } = useAppStore();

  const isLanding = pathname === "/";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isLanding
          ? "bg-transparent"
          : "bg-[#FDFBF7]/80 backdrop-blur-xl border-b border-[#A8C2B9]/20"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <DurianLogo className="w-8 h-8" />
            <span className="font-serif text-xl font-semibold text-[#1A1C1A]">Durian</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[#C5A35E]",
                  pathname === item.href
                    ? "text-[#C5A35E]"
                    : "text-[#5C6B5C]"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full text-[#5C6B5C] hover:text-[#1A1C1A] hover:bg-[#A8C2B9]/20"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {authenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-[#A8C2B9]/30 text-[#2D3A2D]">
                        {user?.email?.address?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-[#A8C2B9]/30">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-[#1A1C1A]">
                      {user?.email?.address || "User"}
                    </p>
                    <p className="text-xs text-[#5C6B5C] capitalize">
                      {userRole || "Tourist"}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-[#A8C2B9]/30" />
                  {userRole === "business" ? (
                    <DropdownMenuItem asChild className="text-[#1A1C1A] hover:bg-[#A8C2B9]/20">
                      <Link href="/business/dashboard">
                        <Store className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild className="text-[#1A1C1A] hover:bg-[#A8C2B9]/20">
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {/* Admin link for admin users */}
                  {user?.email?.address === "armsves@gmail.com" && (
                    <DropdownMenuItem asChild className="text-[#C5A35E] hover:bg-[#C5A35E]/10">
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-[#A8C2B9]/30" />
                  <DropdownMenuItem onClick={logout} className="text-[#1A1C1A] hover:bg-[#A8C2B9]/20">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                className="rounded-full border-[#2D3A2D] text-[#2D3A2D] hover:bg-[#2D3A2D] hover:text-white"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
            )}

            {/* Mobile menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-[#1A1C1A]">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border-[#A8C2B9]/30">
                {navigation.map((item) => (
                  <DropdownMenuItem key={item.name} asChild className="text-[#1A1C1A]">
                    <Link href={item.href}>{item.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
