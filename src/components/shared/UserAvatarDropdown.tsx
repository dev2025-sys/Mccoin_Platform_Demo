// components/layout/UserAvatarDropdown.tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useClerk } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

export default function UserAvatarDropdown() {
  const t = useTranslations("shared");
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === "ar";
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.imageUrl} alt={user.fullName ?? ""} />
          <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44 mt-2 rounded-md bg-[#081935] text-white border border-[#0f294d] shadow-lg">
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/profile")}
          className={`flex items-center gap-2 cursor-pointer ${
            isArabic ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <User size={16} /> {isArabic ? t("profile") : t("profile")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/preferences")}
          className={`flex items-center gap-2 cursor-pointer ${
            isArabic ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <Settings size={16} />{" "}
          {isArabic ? t("preferences") : t("preferences")}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#0f294d]" />
        <DropdownMenuItem
          onClick={() => signOut()}
          className={`flex items-center gap-2 text-red-500 cursor-pointer ${
            isArabic ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <LogOut size={16} /> {isArabic ? t("logout") : t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
