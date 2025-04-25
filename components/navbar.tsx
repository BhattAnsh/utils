"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LayoutDashboard, CheckSquare, Menu, X, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    });
  }, []);

  const navItems = [
    {
      name: "Kanban",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "To-Do List",
      href: "/todo",
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      name: "Pomodoro",
      href: "/pomodoro",
      icon: <Clock className="h-5 w-5" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <div className="relative">
              <span className="text-xl md:text-2xl font-medium">ZenFlow</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 transition-all duration-300 ease-in-out">
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={pathname === item.href ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "group relative px-4 transition-all duration-300 ease-in-out hover:-translate-y-0.5",
                pathname === item.href ? "font-medium" : "font-normal"
              )}
            >
              <Link href={item.href} className="flex items-center gap-2">
                {item.icon}
                {item.name}
                {pathname === item.href && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full bg-primary transform transition-transform origin-left ease-in-out duration-300" />
                )}
              </Link>
            </Button>
          ))}
          <div className="ml-4 border-l pl-4">
            <ThemeToggle systemTheme={systemTheme} />
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <ThemeToggle systemTheme={systemTheme} />
          <Button 
            variant="ghost" 
            size="icon"
            className="ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-full transform overflow-y-auto border-r bg-background p-4 transition-transform duration-300 ease-in-out md:hidden ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href={item.href} className="flex items-center gap-3">
                  {item.icon}
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}