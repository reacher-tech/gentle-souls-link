import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Pencil, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getProject, createEnvironment, updateEnvironment, deleteEnvironment, updateProject, deleteProject } from "@/lib/store";
import { Environment, Project } from "@/lib/types";
import { toast } from "sonner";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | undefined>(() => getProject(projectId!));
  const [envDialogOpen, setEnvDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);
  const [deletingEnv, setDeletingEnv] = useState<Environment | null>(null);
  const [envName, setEnvName] = useState("");
  const [projectName, setProjectName] = useState(project?.name || "");
  const [projectDesc, setProjectDesc] = useState(project?.description || "");

  const refresh = () => setProject(getProject(projectId!));

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Project not found</p>
          <Button asChild variant="outline"><Link to="/">Back to Dashboard</Link></Button>
        </div>
      </div>
    );
  }

  const openCreateEnv = () => { setEditingEnv(null); setEnvName(""); setEnvDialogOpen(true); };
  const openEditEnv = (env: Environment) => { setEditingEnv(env); setEnvName(env.name); setEnvDialogOpen(true); };

  const handleSaveEnv = () => {
    if (!envName.trim()) return;
    if (editingEnv) {
      updateEnvironment(project.id, editingEnv.id, envName.trim());
      toast.success("Environment updated");
    } else {
      createEnvironment(project.id, envName.trim());
      toast.success("Environment created");
    }
    setEnvDialogOpen(false);
    refresh();
  };

  const handleDeleteEnv = () => {
    if (!deletingEnv) return;
    deleteEnvironment(project.id, deletingEnv.id);
    toast.success("Environment deleted");
    setDeleteDialogOpen(false);
    setDeletingEnv(null);
    refresh();
  };

  const handleUpdateProject = () => {
    if (!projectName.trim()) return;
    updateProject(project.id, projectName.trim(), projectDesc.trim());
    toast.success("Project updated");
    setEditProjectDialogOpen(false);
    refresh();
  };

  const handleDeleteProject = () => {
    deleteProject(project.id);
    toast.success("Project deleted");
    navigate("/");
  };

  const envColorMap: Record<string, string> = {
    development: "bg-accent text-accent-foreground",
    staging: "bg-secondary text-secondary-foreground",
    production: "bg-primary text-primary-foreground",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <span className="text-sm text-muted-foreground">Projects</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
              {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setProjectName(project.name); setProjectDesc(project.description); setEditProjectDialogOpen(true); }}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleDeleteProject}>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Environments</h2>
          <Button onClick={openCreateEnv} size="sm">
            <Plus className="h-4 w-4" /> New Environment
          </Button>
        </div>

        {project.environments.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Server className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-4">No environments yet. Create one like development, staging, or production.</p>
            <Button onClick={openCreateEnv} size="sm"><Plus className="h-4 w-4" /> Create Environment</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.environments.map((env) => (
              <Card key={env.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Link to={`/project/${project.id}/env/${env.id}`} className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base hover:text-primary transition-colors">{env.name}</CardTitle>
                        <Badge variant="outline" className={envColorMap[env.name.toLowerCase()] || ""}>
                          {env.variables.length} var{env.variables.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </Link>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditEnv(env)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setDeletingEnv(env); setDeleteDialogOpen(true); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link to={`/project/${project.id}/env/${env.id}`}>
                    <p className="text-xs text-muted-foreground">Click to manage variables →</p>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Env dialog */}
      <Dialog open={envDialogOpen} onOpenChange={setEnvDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEnv ? "Edit Environment" : "New Environment"}</DialogTitle>
            <DialogDescription>{editingEnv ? "Update the environment name." : "Add a new environment to this project."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input placeholder="e.g. production" value={envName} onChange={(e) => setEnvName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSaveEnv()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnvDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEnv} disabled={!envName.trim()}>{editingEnv ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete env dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Environment</DialogTitle>
            <DialogDescription>Delete <strong>{deletingEnv?.name}</strong> and all its variables? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteEnv}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit project dialog */}
      <Dialog open={editProjectDialogOpen} onOpenChange={setEditProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProjectDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateProject} disabled={!projectName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
