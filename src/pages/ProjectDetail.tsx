import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, Server, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  apiGetProject,
  apiUpdateProject,
  apiDeleteProject,
  apiGetEnvironments,
  apiCreateEnvironment,
  apiUpdateEnvironment,
  apiDeleteEnvironment,
  ApiProject,
  ApiEnvironment,
} from "@/lib/api";
import { toast } from "sonner";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ApiProject | null>(null);
  const [environments, setEnvironments] = useState<ApiEnvironment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"env" | "project">("env");
  const [editingEnv, setEditingEnv] = useState<ApiEnvironment | null>(null);
  const [envName, setEnvName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [proj, envs] = await Promise.all([
        apiGetProject(projectId!),
        apiGetEnvironments(projectId!),
      ]);
      setProject(proj);
      setEnvironments(envs);
      setProjectName(proj.name);
      setProjectDesc(proj.description);
    } catch (err: any) {
      toast.error(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center p-20 animate-fade-in">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Project not found</p>
          <Button asChild variant="outline" className="btn-press">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const openCreateEnv = () => {
    setDialogMode("env");
    setEditingEnv(null);
    setEnvName("");
    setDialogOpen(true);
  };

  const openEditEnv = (env: ApiEnvironment) => {
    setDialogMode("env");
    setEditingEnv(env);
    setEnvName(env.name);
    setDialogOpen(true);
  };

  const openEditProject = () => {
    setDialogMode("project");
    setProjectName(project.name);
    setProjectDesc(project.description);
    setDialogOpen(true);
  };

  const handleSaveEnv = async () => {
    if (!envName.trim()) return;
    setSaving(true);
    try {
      if (editingEnv) {
        await apiUpdateEnvironment(project._id, editingEnv._id, envName.trim());
        toast.success("Environment updated");
      } else {
        await apiCreateEnvironment(project._id, envName.trim());
        toast.success("Environment created");
      }
      setDialogOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save environment");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEnv = async (env: ApiEnvironment) => {
    try {
      await apiDeleteEnvironment(project._id, env._id);
      toast.success("Environment deleted");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete environment");
    }
  };

  const handleUpdateProject = async () => {
    if (!projectName.trim()) return;
    setSaving(true);
    try {
      await apiUpdateProject(project._id, projectName.trim(), projectDesc.trim());
      toast.success("Project updated");
      setDialogOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await apiDeleteProject(project._id);
      toast.success("Project deleted");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete project");
    }
  };

  const envColorMap: Record<string, string> = {
    development: "bg-primary/10 text-primary",
    staging: "bg-accent text-accent-foreground",
    production: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-fade-in">
        <Link to="/dashboard" className="hover:text-foreground transition-colors">Projects</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{project.name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div className="animate-slide-in-left">
          <h1 className="text-xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2 animate-slide-in-right">
          <Button variant="outline" size="sm" className="btn-press group" onClick={openEditProject}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive btn-press group"
            onClick={handleDeleteProject}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Environments
        </h2>
        <Button onClick={openCreateEnv} size="sm" className="btn-press group">
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" /> New Environment
        </Button>
      </div>

      {environments.length === 0 ? (
        <div className="text-center py-16 animate-fade-in-up">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Server className="h-7 w-7 text-primary/60" />
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            No environments yet. Create one like development, staging, or production.
          </p>
          <Button onClick={openCreateEnv} size="sm" className="btn-press group">
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" /> Create Environment
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {environments.map((env, i) => (
            <Card
              key={env._id}
              className={`group card-hover animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Link to={`/project/${project._id}/env/${env._id}`} className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base hover:text-primary transition-colors">
                        {env.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`border-0 text-xs ${envColorMap[env.name.toLowerCase()] || "bg-secondary text-secondary-foreground"}`}
                      >
                        env
                      </Badge>
                    </div>
                  </Link>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 btn-press" onClick={() => openEditEnv(env)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive btn-press"
                      onClick={() => handleDeleteEnv(env)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link to={`/project/${project._id}/env/${env._id}`}>
                  <p className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Click to manage variables →
                  </p>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for env or project editing */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="animate-scale-in">
          {dialogMode === "env" ? (
            <>
              <DialogHeader>
                <DialogTitle>{editingEnv ? "Edit Environment" : "New Environment"}</DialogTitle>
                <DialogDescription>
                  {editingEnv ? "Update the environment name." : "Add a new environment to this project."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g. production"
                  value={envName}
                  onChange={(e) => setEnvName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEnv()}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="btn-press">Cancel</Button>
                <Button onClick={handleSaveEnv} disabled={!envName.trim() || saving} className="btn-press">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingEnv ? "Save" : "Create"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>Update project details.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
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
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="btn-press">Cancel</Button>
                <Button onClick={handleUpdateProject} disabled={!projectName.trim() || saving} className="btn-press">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
