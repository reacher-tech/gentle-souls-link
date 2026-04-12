import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, Trash2, Pencil, Eye, EyeOff, Copy, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  apiGetEnvironment,
  apiGetVariables,
  apiCreateVariable,
  apiUpdateVariable,
  apiDeleteVariable,
  ApiProject,
  ApiEnvironment,
  ApiVariable,
} from "@/lib/api";
import { toast } from "sonner";

export default function EnvironmentDetail() {
  const { projectId, envId } = useParams<{ projectId: string; envId: string }>();
  const [project, setProject] = useState<ApiProject | null>(null);
  const [env, setEnv] = useState<ApiEnvironment | null>(null);
  const [variables, setVariables] = useState<ApiVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVar, setEditingVar] = useState<ApiVariable | null>(null);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [proj, environment, vars] = await Promise.all([
        apiGetProject(projectId!),
        apiGetEnvironment(projectId!, envId!),
        apiGetVariables(projectId!, envId!),
      ]);
      setProject(proj);
      setEnv(environment);
      setVariables(vars);
    } catch (err: any) {
      toast.error(err.message || "Failed to load environment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, envId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project || !env) {
    return (
      <div className="flex items-center justify-center p-20 animate-fade-in">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Environment not found</p>
          <Button asChild variant="outline" className="btn-press">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const openCreate = () => { setEditingVar(null); setKey(""); setValue(""); setDialogOpen(true); };
  const openEdit = (v: ApiVariable) => { setEditingVar(v); setKey(v.key); setValue(v.value); setDialogOpen(true); };

  const handleSave = async () => {
    if (!key.trim()) return;
    setSaving(true);
    try {
      if (editingVar) {
        await apiUpdateVariable(project._id, env._id, editingVar._id, key.trim(), value);
        toast.success("Variable updated");
      } else {
        await apiCreateVariable(project._id, env._id, key.trim(), value);
        toast.success("Variable added");
      }
      setDialogOpen(false);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save variable");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (v: ApiVariable) => {
    try {
      await apiDeleteVariable(project._id, env._id, v._id);
      toast.success("Variable deleted");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete variable");
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyValue = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success("Copied to clipboard");
  };

  const maskValue = (val: string) => "•".repeat(Math.min(val.length, 32));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-fade-in">
        <Link to="/dashboard" className="hover:text-foreground transition-colors">Projects</Link>
        <span>/</span>
        <Link to={`/project/${project._id}`} className="hover:text-foreground transition-colors">{project.name}</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{env.name}</span>
      </div>

      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <h1 className="text-xl font-bold tracking-tight">{env.name} Variables</h1>
        <Button onClick={openCreate} size="sm" className="btn-press group">
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" /> Add Variable
        </Button>
      </div>

      {variables.length === 0 ? (
        <div className="text-center py-16 animate-fade-in-up">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <KeyRound className="h-7 w-7 text-primary/60" />
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            No variables yet. Add your first key-value pair.
          </p>
          <Button onClick={openCreate} size="sm" className="btn-press group">
            <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" /> Add Variable
          </Button>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card animate-fade-in-up">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[35%]">Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variables.map((v, i) => (
                <TableRow key={v._id} className={`animate-fade-in stagger-${Math.min(i + 1, 6)}`}>
                  <TableCell>
                    <code className="font-mono text-sm font-medium text-primary">{v.key}</code>
                  </TableCell>
                  <TableCell>
                    <code className="font-mono text-sm text-muted-foreground">
                      {revealedIds.has(v._id) ? v.value : maskValue(v.value)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 btn-press" onClick={() => toggleReveal(v._id)}>
                        {revealedIds.has(v._id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 btn-press" onClick={() => copyValue(v.value)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 btn-press" onClick={() => openEdit(v)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive btn-press" onClick={() => handleDelete(v)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Variable Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>{editingVar ? "Edit Variable" : "Add Variable"}</DialogTitle>
            <DialogDescription>{editingVar ? "Update the key-value pair." : "Add a new environment variable."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Key</Label>
              <Input placeholder="e.g. API_KEY" value={key} onChange={(e) => setKey(e.target.value.toUpperCase())} className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input placeholder="Enter value" value={value} onChange={(e) => setValue(e.target.value)} className="font-mono" onKeyDown={(e) => e.key === "Enter" && handleSave()} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="btn-press">Cancel</Button>
            <Button onClick={handleSave} disabled={!key.trim() || saving} className="btn-press">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingVar ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
