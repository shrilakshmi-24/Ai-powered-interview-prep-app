import { Button } from "@/components/ui/button";

function Header() {
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full bg-gradient-to-br from-blue-500 to-red-500" />
        <h1 className="text-base font-bold md:text-2xl">Interview Bit</h1>
      </div>
     <Button>Login</Button>
    </nav>
  );
}

export default Header;
