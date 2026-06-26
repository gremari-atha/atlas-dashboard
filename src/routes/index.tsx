import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (context.auth?.tenant) {
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
