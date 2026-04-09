import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, Pencil, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { getProject, createEnvironment, updateEnvironment, deleteEnvironment, updateProject, deleteProject } from "@/lib/store";
import { Environment, Project } from "@/lib/types";
import { toast } from "sonner";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | undefined>(() => getProject(projectId!));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"env" | "project">("env");
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);
  const [envName, setEnvName] = useState("");
  const [projectName, setProjectName] = useState(project?.name || "");
  const [projectDesc, setProjectDesc] = useState(project?.description || "");

  const refresh = () => setProject(getProject(projectId!));

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
    setSheetMode("env");
    setEditingEnv(null);
    setEnvName("");
    setSheetOpen(true);
  };

  const openEditEnv = (env: Environment) => {
    setSheetMode("env");
    setEditingEnv(env);
    setEnvName(env.name);
    setSheetOpen(true);
  };

  const openEditProject = () => {
    setSheetMode("project");
    setProjectName(project.name);
    setProjectDesc(project.description);
    setSheetOpen(true);
  };

  const handleSaveEnv = () => {
    if (!envName.trim()) return;
    if (editingEnv) {
      updateEnvironment(project.id, editingEnv.id, envName.trim());
      toast.success("Environment updated");
    } else {
      createEnvironment(project.id, envName.trim());
      toast.success("Environment created");
    }
    setSheetOpen(false);
    refresh();
  };

  const handleDeleteEnv = (env: Environment) => {
    deleteEnvironment(project.id, env.id);
    toast.success("Environment deleted");
    refresh();
  };

  const handleUpdateProject = () => {
    if (!projectName.trim()) return;
    updateProject(project.id, projectName.trim(), projectDesc.trim());
    toast.success("Project updated");
    setSheetOpen(false);
    refresh();
  };

  const handleDeleteProject = () => {
    deleteProject(project.id);
    toast.success("Project deleted");
    navigate("/dashboard");
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
          <Button variant="outline" size="sm" className="btn-press" onClick={openEditProject}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive btn-press"
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
        <Button onClick={openCreateEnv} size="sm" className="btn-press">
          <Plus className="h-4 w-4" /> New Environment
        </Button>
      </div>

      {project.environments.length === 0 ? (
        <div className="text-center py-16 animate-fade-in-up">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Server className="h-7 w-7 text-primary/60" />
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            No environments yet. Create one like development, staging, or production.
          </p>
          <Button onClick={openCreateEnv} size="sm" className="btn-press">
            <Plus className="h-4 w-4" /> Create Environment
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.environments.map((env, i) => (
            <Card
              key={env.id}
              className={`group card-hover animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Link to={`/project/${project.id}/env/${env.id}`} className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base hover:text-primary transition-colors">
                        {env.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`border-0 text-xs ${envColorMap[env.name.toLowerCase()] || "bg-secondary text-secondary-foreground"}`}
                      >
                        {env.variables.length} var{env.variables.length !== 1 ? "s" : ""}
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
                <Link to={`/project/${project.id}/env/${env.id}`}>
                  <p className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Click to manage variables →
                  </p>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Sheet for env or project editing */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          {sheetMode === "env" ? (
            <>
              <SheetHeader>
                <SheetTitle>{editingEnv ? "Edit Environment" : "New Environment"}</SheetTitle>
                <SheetDescription>
                  {editingEnv ? "Update the environment name." : "Add a new environment to this project."}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-2 py-6">
                <Label>Name</Label>
                <Input
                  placeholder="e.g. production"
                  value={envName}
                  onChange={(e) => setEnvName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEnv()}
                />
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setSheetOpen(false)} className="btn-press">Cancel</Button>
                <Button onClick={handleSaveEnv} disabled={!envName.trim()} className="btn-press">
                  {editingEnv ? "Save" : "Create"}
                </Button>
              </SheetFooter>
            </>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>Edit Project</SheetTitle>
                <SheetDescription>Update project details.</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-6">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} />
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setSheetOpen(false)} className="btn-press">Cancel</Button>
                <Button onClick={handleUpdateProject} disabled={!projectName.trim()} className="btn-press">Save</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
