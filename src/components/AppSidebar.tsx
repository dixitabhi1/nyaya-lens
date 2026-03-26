import {
  LayoutDashboard,
  MessageSquare,
  MessagesSquare,
  Search,
  Mic,
  UserRoundSearch,
  Network,
  BookOpenText,
  ShieldCheck,
  FileWarning,
  TrendingUp,
  PenTool,
  Microscope,
  Landmark,
  Shield,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { NavLink } from "@/components/NavLink";
import { useInbox } from "@/lib/inbox-context";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const basePlatformModules = [
  { title: "Home", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Legal Assistant", url: "/chat", icon: MessageSquare },
  { title: "File Complaint", url: "/fir", icon: FileWarning },
  { title: "Voice FIR", url: "/fir", icon: Mic },
  { title: "Case Analysis", url: "/case-analysis", icon: Search },
  { title: "Find Lawyers", url: "/lawyers", icon: UserRoundSearch },
  { title: "Lawyer Network", url: "/lawyer-network", icon: Network },
  { title: "Messages", url: "/messages", icon: MessagesSquare },
  { title: "Bare Acts", url: "/research", icon: BookOpenText },
  { title: "Legal Vault", url: "/contracts", icon: ShieldCheck },
  { title: "Track Case", url: "/strength", icon: TrendingUp },
];

const baseOperationsModules = [
  { title: "Document Drafting", url: "/drafting", icon: PenTool },
  { title: "Evidence Analyzer", url: "/evidence", icon: Microscope },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { unreadCount } = useInbox();
  const { user } = useAuth();
  const collapsed = state === "collapsed";
  const platformModules = basePlatformModules.filter((item) => {
    if (item.url === "/messages") {
      return Boolean(user);
    }
    return true;
  });
  const operationsModules = [
    ...baseOperationsModules,
    ...(user?.can_access_lawyer_dashboard ? [{ title: "Lawyer Dashboard", url: "/lawyer-dashboard", icon: MessageSquare }] : []),
    ...(user?.can_access_police_dashboard ? [{ title: "Police Dashboard", url: "/police-dashboard", icon: Landmark }] : []),
    ...(user?.can_access_admin_dashboard ? [{ title: "Admin Panel", url: "/admin", icon: Shield }] : []),
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {!collapsed && (
          <div className="px-4 py-5 border-b border-sidebar-border">
            <BrandMark
              markClassName="h-9 w-9 rounded-lg"
              imageClassName="h-5 w-5"
              titleClassName="text-base text-sidebar-accent-foreground"
              subtitle="AI Legal Intelligence"
              subtitleClassName="text-[11px] tracking-normal uppercase text-sidebar-foreground/60"
            />
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-widest">Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformModules.map((item) => (
                <SidebarMenuItem key={`${item.title}-${item.url}`}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/60 transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="flex items-center gap-2 text-sm">
                          <span>{item.title}</span>
                          {item.url === "/messages" && unreadCount > 0 ? (
                            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          ) : null}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-widest">Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsModules.map((item) => (
                <SidebarMenuItem key={`${item.title}-${item.url}`}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/60 transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
