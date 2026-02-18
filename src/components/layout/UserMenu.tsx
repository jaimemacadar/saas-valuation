"use client";

import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

interface UserMenuProps {
  userName?: string;
  userEmail?: string;
}

export function UserMenu({ userName, userEmail }: UserMenuProps) {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex items-center gap-3">
      {/* User Info */}
      <div className="hidden md:flex flex-col items-end">
        {userName ? (
          <p className="text-sm font-medium text-secondary-900">{userName}</p>
        ) : null}
        {userEmail ? <p className="text-xs text-secondary-600">{userEmail}</p> : null}
      </div>

      {/* Profile Button */}
      <Link href="/profile">
        <Button variant="outline" size="sm">
          <User className="h-4 w-4" />
        </Button>
      </Link>

      {/* Logout Button */}
      <form action={handleSignOut}>
        <Button variant="outline" size="sm" type="submit">
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </form>
    </div>
  );
}
