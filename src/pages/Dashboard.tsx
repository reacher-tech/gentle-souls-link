import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FolderOpen, Trash2, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";
import { Project } from "@/lib/types";
import { toast } from "sonner";

export default function Dashboard() {
  const user = getCurrentUser();
  const [projects, setProjects] = useState<Project[]>(getProjects());
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
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
    setSheetOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setDescription(p.description);
    setSheetOpen(true);
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
    setSheetOpen(false);
    refresh();
  };

  const handleDelete = (project: Project) => {
    deleteProject(project.id);
    toast.success("Project deleted");
    refresh();
  };

  const totalEnvs = projects.reduce((s, p) => s + p.environments.length, 0);
  const totalVars = projects.reduce(
    (s, p) => s + p.environments.reduce((se, e) => se + e.variables.length, 0),
    0
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
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
                      onClick={() => handleDelete(project)}
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

      {/* Create/Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingProject ? "Edit Project" : "New Project"}</SheetTitle>
            <SheetDescription>
              {editingProject
                ? "Update project details."
                : "Create a new project to organize your environment variables."}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-6">
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
          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)} className="btn-press">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()} className="btn-press">
              {editingProject ? "Save" : "Create"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
