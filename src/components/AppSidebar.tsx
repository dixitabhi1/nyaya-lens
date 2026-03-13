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
  Scale,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
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

const platformModules = [
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

const operationsModules = [
  { title: "Document Drafting", url: "/drafting", icon: PenTool },
  { title: "Evidence Analyzer", url: "/evidence", icon: Microscope },
  { title: "Lawyer Dashboard", url: "/lawyer-dashboard", icon: MessageSquare },
  { title: "Police Dashboard", url: "/police-dashboard", icon: Landmark },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {!collapsed && (
          <div className="px-4 py-5 border-b border-sidebar-border">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg gradient-accent flex items-center justify-center">
                <Scale className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-sidebar-accent-foreground tracking-tight">NyayaSetu</h2>
                <p className="text-[11px] text-sidebar-foreground/60">AI Legal Intelligence</p>
              </div>
            </div>
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
                      {!collapsed && <span className="text-sm">{item.title}</span>}
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
