import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import {
  Blocks,
  Bot,
  FileText,
  HandCoins,
  House,
  LogOut,
  Mail,
  Mails,
  Monitor,
  Moon,
  Package,
  Receipt,
  Sun,
  User,
} from "lucide-react";
import { AtlasLogo } from "@/components/custom/atlas-logo";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context-providers/auth.provider";
import { type Theme, useTheme } from "@/hooks/theme.hook";

const navGroups = [
  {
    title: "Produk",
    items: [
      { title: "Produk", url: "/dashboard/product", icon: Package },
      {
        title: "Produk di Platform",
        url: "/dashboard/platform-product",
        icon: Blocks,
      },
    ],
  },
  {
    title: "Akun",
    items: [
      { title: "Email", url: "/dashboard/email", icon: Mail },
      { title: "Akun", url: "/dashboard/account", icon: User },
    ],
  },
  {
    title: "Transaksi",
    items: [
      { title: "Transaksi", url: "/dashboard/transaction", icon: Receipt },
      {
        title: "Pengeluaran Global",
        url: "/dashboard/expense",
        icon: HandCoins,
      },
    ],
  },
  {
    title: "System",
    items: [
      { title: "BOT", url: "/dashboard/bot", icon: Bot },
      { title: "Logs", url: "/dashboard/logs", icon: FileText },
      { title: "Email Subject", url: "/dashboard/email-subject", icon: Mail },
      { title: "Email Message", url: "/dashboard/email-message", icon: Mails },
    ],
  },
];

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ context }) => {
    const isAuthed =
      context.auth?.isAuthenticated ||
      (typeof window !== "undefined" && !!localStorage.getItem("auth.tenant"));
    if (!isAuthed) {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();
  const navigate = Route.useNavigate();
  const { pathname } = useLocation();
  const { theme, setTheme } = useTheme();

  if (!auth.tenant) {
    return null;
  }

  const handleLogout = () => {
    auth.logout();
    navigate({ to: "/login" });
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border bg-card/60 backdrop-blur-md">
        <SidebarHeader className="py-5 px-4 border-b border-border/40">
          <SidebarMenu>
            <SidebarMenuItem className="flex justify-center">
              <AtlasLogo className="h-6 w-auto select-none" />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="py-3 px-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === "/dashboard"}
                    className="h-9 px-3 text-xs"
                  >
                    <Link to="/dashboard">
                      <House className="size-4" />
                      <span className="font-medium">Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {navGroups.map((nav, i) => (
            <SidebarGroup key={`nav=${i}`} className="py-2">
              <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75 px-3 mb-1">
                {nav.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {nav.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        className="h-9 px-3 text-xs"
                      >
                        <Link to={item.url}>
                          <item.icon className="size-4" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="border-t border-border/40 p-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full cursor-pointer h-9 text-xs border-destructive/20 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/40 transition-colors"
          >
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 min-w-0 min-h-screen bg-muted/20">
        <header className="sticky top-0 z-40 flex justify-between items-center px-6 py-3 border-b border-border bg-background/60 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="cursor-pointer size-8 rounded-lg hover:bg-muted/80 transition-colors" />
            <div className="h-4 w-px bg-border hidden sm:block" />
            <p className="text-xs text-muted-foreground font-mono bg-muted py-1 px-2.5 rounded-md hidden sm:block">
              {auth.tenant.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden md:inline">
                Tema:
              </span>
              <Select
                value={theme}
                onValueChange={(val) => setTheme(val as Theme)}
              >
                <SelectTrigger className="w-27.5 h-8 text-xs font-medium">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light" className="text-xs">
                    <div className="flex items-center gap-2">
                      <Sun className="size-3.5" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark" className="text-xs">
                    <div className="flex items-center gap-2">
                      <Moon className="size-3.5" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system" className="text-xs">
                    <div className="flex items-center gap-2">
                      <Monitor className="size-3.5" />
                      <span>System</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>
        <div className="px-6 py-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
