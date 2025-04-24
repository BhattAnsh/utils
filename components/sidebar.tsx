"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, CheckSquare } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

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
  ];

  return (
    <div className="flex h-full w-[220px] flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">Organizer</h2>
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            asChild
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={cn(
              "justify-start gap-2 px-4",
              pathname === item.href ? "font-medium" : "font-normal"
            )}
          >
            <Link href={item.href}>
              {item.icon}
              {item.name}
            </Link>
          </Button>
        ))}
      </nav>
    </div>
  );
}