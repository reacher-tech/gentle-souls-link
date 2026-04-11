import { FolderOpen, LayoutDashboard, Terminal, KeyRound, Server, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { getProjects } from "@/lib/store";
import { getCurrentUser, logout } from "@/lib/auth";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const projects = getProjects();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out");
  };

  const mainItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <Sidebar collapsible="icon">
      {/* Edge toggle tab — desktop only */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex absolute top-2 -right-3 z-50 h-7 w-6 items-center justify-center rounded-r-md bg-sidebar-accent border border-l-0 border-sidebar-border text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 shadow-sm"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 transition-transform duration-200" />
        )}
      </button>

      <SidebarHeader className="p-4 pt-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center shrink-0 transition-transform duration-300 hover:rotate-12">
            <Terminal className="h-4 w-4 text-sidebar-primary transition-all duration-300" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold text-sidebar-foreground tracking-tight animate-fade-in">
              Jodna ENV
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50 group/nav"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 transition-transform duration-200 group-hover/nav:scale-110" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="bg-sidebar-border mx-3 w-auto" />

        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-3.5 w-3.5 transition-transform duration-200 hover:scale-110" />
              {!collapsed && <span>Projects</span>}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.length === 0 ? (
                <SidebarMenuItem>
                  <div className="px-3 py-2 text-xs text-sidebar-foreground/50">
                    {!collapsed && "No projects yet"}
                  </div>
                </SidebarMenuItem>
              ) : (
                projects.map((project) => {
                  const isProjectActive = location.pathname.startsWith(`/project/${project.id}`);
                  return (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={`/project/${project.id}`}
                          className="hover:bg-sidebar-accent/50 group/proj"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <Server className="mr-2 h-4 w-4 shrink-0 transition-transform duration-200 group-hover/proj:scale-110" />
                          {!collapsed && (
                            <span className="truncate">{project.name}</span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>

                      {!collapsed && isProjectActive && project.environments.length > 0 && (
                        <div className="ml-6 mt-1 space-y-0.5 animate-fade-in">
                          {project.environments.map((env) => (
                            <NavLink
                              key={env.id}
                              to={`/project/${project.id}/env/${env.id}`}
                              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors group/env"
                              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                            >
                              <KeyRound className="h-3 w-3 shrink-0 transition-transform duration-200 group-hover/env:rotate-12" />
                              <span className="truncate">{env.name}</span>
                              <span className="ml-auto text-[10px] text-sidebar-foreground/40">
                                {env.variables.length}
                              </span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Separator className="bg-sidebar-border mb-3" />
        {!collapsed && user && (
          <div className="px-2 mb-2 animate-fade-in">
            <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 btn-press group/logout"
        >
          <LogOut className="h-4 w-4 mr-2 transition-transform duration-200 group-hover/logout:-translate-x-0.5" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
