import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    const isAuthed =
      context.auth?.tenant ||
      (typeof window !== "undefined" && !!localStorage.getItem("auth.tenant"));
    if (isAuthed) {
      throw redirect({
        to: "/dashboard",
      });
    }
    throw redirect({
      to: "/login",
    });
  },
  component: () => null,
});
