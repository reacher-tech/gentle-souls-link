import { FolderOpen, LayoutDashboard, Terminal, KeyRound, Server, Settings, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { getProjects } from "@/lib/store";
import { getCurrentUser, logout } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
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
  const { state } = useSidebar();
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
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center shrink-0">
            <Terminal className="h-4 w-4 text-sidebar-primary" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold text-sidebar-foreground tracking-tight animate-fade-in">
              Jodna ENV
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main nav */}
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
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="bg-sidebar-border mx-3 w-auto" />

        {/* Projects nav */}
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-3.5 w-3.5" />
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
                          className="hover:bg-sidebar-accent/50"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <Server className="mr-2 h-4 w-4 shrink-0" />
                          {!collapsed && (
                            <span className="truncate">{project.name}</span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>

                      {/* Show environments under active project */}
                      {!collapsed && isProjectActive && project.environments.length > 0 && (
                        <div className="ml-6 mt-1 space-y-0.5 animate-fade-in">
                          {project.environments.map((env) => (
                            <NavLink
                              key={env.id}
                              to={`/project/${project.id}/env/${env.id}`}
                              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                            >
                              <KeyRound className="h-3 w-3 shrink-0" />
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
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 btn-press"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
