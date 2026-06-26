import { SearchX } from "lucide-react";

export function NoData({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full flex flex-col justify-center items-center gap-4 py-8 text-muted-foreground animate-in fade-in-50 duration-300">
      <SearchX className="size-12 stroke-[1.5]" />
      <p className="text-sm font-medium">{children}</p>
    </div>
  );
}
