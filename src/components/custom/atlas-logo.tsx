import { cn } from "@/lib/utils";

export function AtlasLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="844"
      height="205"
      viewBox="0 0 844 205"
      fill="none"
      className={cn("w-auto h-8", className)}
    >
      <title>Atlas Logo</title>
      <path
        className="fill-[#17515e] dark:fill-[#f1f1f1] transition-colors duration-200"
        d="m211 163 52-118h27l53 118h-29L271 59h11l-43 104zm26-25 7-21h61l7 21zm153 25V68h-38V45h103v23h-38v95zm96 0V45h28v96h59v22zm104 0 52-118h27l53 118h-29L650 59h11l-43 104zm26-25 7-21h61l7 21zm173 27q-13 0-27-4-12-3-21-10l10-20a70 70 0 0 0 38 12l13-1q6-2 8-5l2-6q0-6-4-8-3-3-9-4l-14-4-14-4q-8-1-14-6-6-3-10-10-3-6-3-15 0-10 5-18 6-8 17-14 11-5 27-5 12 0 22 3 11 3 19 8l-8 20a69 69 0 0 0-33-9l-13 2q-5 2-7 5-3 3-2 7 0 4 3 7l10 4 28 8q7 1 14 6 6 3 9 9 4 6 4 16 0 9-5 18-6 8-17 13t-28 5"
      />
      <path
        fill="#02cfe9"
        d="m0 103 24-24 24 24-24 24zM36 139l24-24 24 24-24 24zM72 175l24-24 24 24-24 24zM36 67l24-24 24 24-24 24zM72 103l24-24 24 24-24 24zM108 139l24-24 24 24-24 24zM72 31 96 7l24 24-24 24zM108 67l24-24 24 24-24 24zM144 103l24-24 24 24-24 24z"
      />
      <path fill="#02cfe9" d="M93 31h6v144h-6z" />
      <path
        fill="#02cfe9"
        d="M23 106v-6h145v6zM60 70v-7h73v7zM60 142v-7h72v7z"
      />
    </svg>
  );
}
