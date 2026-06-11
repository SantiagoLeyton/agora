"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store";
import { getRoleHomePath, getRoleLabel } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function NavbarUserMenu({ className }: { className?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const homePath = getRoleHomePath(user.role);
  const settingsPath = user.role === "admin" ? "/admin/settings" : homePath;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-9 gap-2 rounded-full border border-border/50 bg-card pl-1 pr-3 shadow-[var(--shadow-sm)] hover:bg-muted/50 hover:shadow-[var(--shadow-md)]",
            className
          )}
        >
          <Avatar className="h-7 w-7 ring-2 ring-primary/10">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-[10px] font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[100px] truncate text-xs font-medium sm:inline">
            {user.name.split(" ")[0]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-primary">
            {getRoleLabel(user.role)}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={homePath}>
            <User className="h-4 w-4" />
            Mi espacio
          </Link>
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href={settingsPath}>
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={async () => {
            await logout();
            queryClient.clear();
            router.push("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
