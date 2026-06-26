import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function PasswordText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [hide, setHide] = useState<boolean>(true);

  return (
    <button
      type="button"
      onClick={() => setHide(!hide)}
      className={cn(
        "flex items-center gap-2 cursor-pointer focus:outline-none hover:text-foreground/80 transition-colors text-xs font-mono",
        className,
      )}
    >
      {hide ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      <span>{hide ? "••••••••" : children}</span>
    </button>
  );
}
