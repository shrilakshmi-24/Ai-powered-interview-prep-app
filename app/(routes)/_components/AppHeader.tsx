import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const menuOption = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Upgrade", href: "/upgrade" },
  { name: "How it works", href: "/how-it-works" },
  { name: "interviews", href: "/interview" },
];

function AppHeader() {
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full bg-gradient-to-br from-blue-500 to-red-500" />
        <h1 className="text-base font-bold md:text-2xl">Interview Bit</h1>
      </div>
      <ul className="flex items-center gap-4 text-sm font-medium md:text-base">
        {menuOption.map((option) => (
          <li key={option.href}>
            <Link
              href={option.href}
              className="hover:underline active:underline"
            >
              {option.name}
            </Link>
          </li>
        ))}
      </ul>
      <UserButton />
    </nav>
  );
}

export default AppHeader;