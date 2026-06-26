import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number; // default 5
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: PaginationProps) {
  const pages = useMemo(() => {
    if (totalPages <= 0) return [{ key: "page-1", value: 1 }];

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(2, currentPage - half); // mulai dari 2 (1 selalu ditampilkan)
    let end = Math.min(totalPages - 1, currentPage + half); // berhenti di totalPages - 1 (last selalu ditampilkan)

    // Jika dekat awal
    if (currentPage <= half + 1) {
      start = 2;
      end = Math.min(totalPages - 1, maxVisiblePages);
    }

    // Jika dekat akhir
    if (currentPage >= totalPages - half) {
      start = Math.max(2, totalPages - maxVisiblePages + 1);
      end = totalPages - 1;
    }

    const range = Array.from(
      { length: Math.max(0, end - start + 1) },
      (_, i) => start + i,
    );

    const result: Array<{ key: string; value: number | "..." }> = [];

    // Always show first page
    result.push({ key: "page-1", value: 1 });

    // Ellipsis after first if needed
    if (start > 2) {
      result.push({ key: "ellipsis-start", value: "..." });
    }

    for (const p of range) {
      result.push({ key: `page-${p}`, value: p });
    }

    // Ellipsis before last if needed
    if (end < totalPages - 1) {
      result.push({ key: "ellipsis-end", value: "..." });
    }

    // Always show last page (if more than 1)
    if (totalPages > 1) {
      result.push({ key: `page-${totalPages}`, value: totalPages });
    }

    return result;
  }, [currentPage, totalPages, maxVisiblePages]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || totalPages <= 1}
      >
        <ChevronLeft className="size-4" />
      </Button>

      {pages.map((page) =>
        page.value === "..." ? (
          <span
            key={page.key}
            className="px-2 text-muted-foreground select-none"
          >
            ...
          </span>
        ) : (
          <Button
            key={page.key}
            variant={page.value === currentPage ? "default" : "outline"}
            size="icon-sm"
            onClick={() => onPageChange(page.value as number)}
          >
            {page.value}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages <= 1}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
