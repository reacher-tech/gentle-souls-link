import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FolderOpen, Trash2, Pencil, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getProjects, createProject, updateProject, deleteProject } from "@/lib/store";
import { Project } from "@/lib/types";
import { toast } from "sonner";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>(getProjects());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const refresh = () => setProjects(getProjects());

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Terminal className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Jodna ENV Store</h1>
              <p className="text-sm text-muted-foreground">Manage environment variables across projects</p>
            </div>
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium mb-1">No projects yet</h2>
            <p className="text-muted-foreground text-sm mb-6">Create your first project to start managing environment variables.</p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Link to={`/project/${project.id}`} className="flex-1">
                      <CardTitle className="text-base hover:text-primary transition-colors">{project.name}</CardTitle>
                    </Link>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(project)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setDeletingProject(project); setDeleteDialogOpen(true); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {project.description && (
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <Link to={`/project/${project.id}`}>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{project.environments.length} environment{project.environments.length !== 1 ? "s" : ""}</span>
                      <span>{project.environments.reduce((sum, e) => sum + e.variables.length, 0)} variable{project.environments.reduce((sum, e) => sum + e.variables.length, 0) !== 1 ? "s" : ""}</span>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "New Project"}</DialogTitle>
            <DialogDescription>
              {editingProject ? "Update project details." : "Create a new project to organize your environment variables."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Name</Label>
              <Input id="project-name" placeholder="e.g. My API" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSave()} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-desc">Description</Label>
              <Textarea id="project-desc" placeholder="Optional description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              {editingProject ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingProject?.name}</strong>? This will also delete all environments and variables. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
