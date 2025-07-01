"use client";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
];

export default function LanguageDropdown() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    startTransition(() => {
      // Replace the first segment (locale) in the pathname
      const segments = pathname.split("/");
      segments[1] = nextLocale;
      const newPath = segments.join("/");
      router.replace(newPath);
    });
  };

  return (
    <div className="relative flex items-center ml-2">
      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8CA3D5] w-4 h-4 pointer-events-none" />
      <select
        onChange={handleChange}
        defaultValue={pathname.split("/")[1]}
        className="appearance-none pl-9 pr-8 py-2 rounded-full bg-[#081935] border border-[#22304A] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#EC3B3B] transition-colors hover:border-[#EC3B3B] cursor-pointer "
        disabled={isPending}
        style={{ boxShadow: "none" }}
      >
        {languages.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
            className="bg-[#081935] text-white"
          >
            {lang.label}
          </option>
        ))}
      </select>
      {/* Dropdown arrow */}
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#8CA3D5]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
