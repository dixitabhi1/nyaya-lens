import {
  MessageSquare,
  Search,
  FileText,
  PenTool,
  ShieldCheck,
  Microscope,
  FileWarning,
  TrendingUp,
  Scale,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
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

const modules = [
  { title: "AI Legal Chatbot", url: "/chat", icon: MessageSquare },
  { title: "Case Analysis", url: "/case-analysis", icon: Search },
  { title: "Legal Research", url: "/research", icon: FileText },
  { title: "Document Drafting", url: "/drafting", icon: PenTool },
  { title: "Contract Analysis", url: "/contracts", icon: ShieldCheck },
  { title: "Evidence Analyzer", url: "/evidence", icon: Microscope },
  { title: "FIR Generator", url: "/fir", icon: FileWarning },
  { title: "Case Strength", url: "/strength", icon: TrendingUp },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

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
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-widest">Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((item) => (
                <SidebarMenuItem key={item.url}>
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
