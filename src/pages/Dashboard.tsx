import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FolderOpen, Trash2, Pencil, Terminal, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/store";
import { getCurrentUser, logout } from "@/lib/auth";
import { Project } from "@/lib/types";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [projects, setProjects] = useState<Project[]>(getProjects());
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const refresh = () => setProjects(getProjects());

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingProject(null);
    setName("");
    setDescription("");
    setDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setDescription(p.description);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingProject) {
      updateProject(editingProject.id, name.trim(), description.trim());
      toast.success("Project updated");
    } else {
      createProject(name.trim(), description.trim());
      toast.success("Project created");
    }
    setDialogOpen(false);
    refresh();
  };

  const handleDelete = () => {
    if (!deletingProject) return;
    deleteProject(deletingProject.id);
    toast.success("Project deleted");
    setDeleteDialogOpen(false);
    setDeletingProject(null);
    refresh();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out");
  };

  const totalEnvs = projects.reduce((s, p) => s + p.environments.length, 0);
  const totalVars = projects.reduce(
    (s, p) => s + p.environments.reduce((se, e) => se + e.variables.length, 0),
    0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 glass sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Jodna ENV Store</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.email}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="btn-press">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats + actions */}
        <div className="animate-fade-in-up mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Welcome{user ? `, ${user.name}` : ""}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your environment variables across projects
              </p>
            </div>
            <Button onClick={openCreate} className="btn-press shrink-0">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Projects", value: projects.length, color: "bg-primary/10 text-primary" },
              { label: "Environments", value: totalEnvs, color: "bg-accent text-accent-foreground" },
              { label: "Variables", value: totalVars, color: "bg-secondary text-secondary-foreground" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`rounded-xl p-4 text-center animate-fade-in-up stagger-${i + 1}`}
                style={{ backgroundColor: undefined }}
              >
                <div className={`inline-flex rounded-lg px-3 py-1 text-xs font-medium mb-1 ${stat.color}`}>
                  {stat.label}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Search */}
          {projects.length > 0 && (
            <div className="relative animate-fade-in">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>

        {/* Projects grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-primary/60" />
            </div>
            <h2 className="text-lg font-semibold mb-1">No projects yet</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Create your first project to start managing environment variables across your team.
            </p>
            <Button onClick={openCreate} className="btn-press">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-muted-foreground">No projects match "{search}"</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, i) => (
              <Card
                key={project.id}
                className={`group card-hover animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Link to={`/project/${project.id}`} className="flex-1">
                      <CardTitle className="text-base hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                    </Link>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 btn-press"
                        onClick={() => openEdit(project)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive btn-press"
                        onClick={() => {
                          setDeletingProject(project);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {project.description && (
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Link to={`/project/${project.id}`}>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {project.environments.length} env{project.environments.length !== 1 ? "s" : ""}
                      </span>
                      <span>
                        {project.environments.reduce((sum, e) => sum + e.variables.length, 0)} variable
                        {project.environments.reduce((sum, e) => sum + e.variables.length, 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "New Project"}</DialogTitle>
            <DialogDescription>
              {editingProject
                ? "Update project details."
                : "Create a new project to organize your environment variables."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Name</Label>
              <Input
                id="project-name"
                placeholder="e.g. My API"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-desc">Description</Label>
              <Textarea
                id="project-desc"
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="btn-press">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()} className="btn-press">
              {editingProject ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingProject?.name}</strong>? This will
              also delete all environments and variables. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="btn-press">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="btn-press">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
