import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Pencil, Eye, EyeOff, Copy, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getProject, getEnvironment, createVariable, updateVariable, deleteVariable } from "@/lib/store";
import { EnvVariable } from "@/lib/types";
import { toast } from "sonner";

export default function EnvironmentDetail() {
  const { projectId, envId } = useParams<{ projectId: string; envId: string }>();
  const [project, setProject] = useState(() => getProject(projectId!));
  const [env, setEnv] = useState(() => getEnvironment(projectId!, envId!));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingVar, setEditingVar] = useState<EnvVariable | null>(null);
  const [deletingVar, setDeletingVar] = useState<EnvVariable | null>(null);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const refresh = () => {
    setProject(getProject(projectId!));
    setEnv(getEnvironment(projectId!, envId!));
  };

  if (!project || !env) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Environment not found</p>
          <Button asChild variant="outline"><Link to="/">Back to Dashboard</Link></Button>
        </div>
      </div>
    );
  }

  const openCreate = () => { setEditingVar(null); setKey(""); setValue(""); setDialogOpen(true); };
  const openEdit = (v: EnvVariable) => { setEditingVar(v); setKey(v.key); setValue(v.value); setDialogOpen(true); };

  const handleSave = () => {
    if (!key.trim()) return;
    if (editingVar) {
      updateVariable(project.id, env.id, editingVar.id, key.trim(), value);
      toast.success("Variable updated");
    } else {
      createVariable(project.id, env.id, key.trim(), value);
      toast.success("Variable added");
    }
    setDialogOpen(false);
    refresh();
  };

  const handleDelete = () => {
    if (!deletingVar) return;
    deleteVariable(project.id, env.id, deletingVar.id);
    toast.success("Variable deleted");
    setDeleteDialogOpen(false);
    setDeletingVar(null);
    refresh();
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link to={`/project/${project.id}`}><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <Link to="/" className="hover:text-foreground transition-colors">Projects</Link>
            <span>/</span>
            <Link to={`/project/${project.id}`} className="hover:text-foreground transition-colors">{project.name}</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{env.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">{env.name} Variables</h1>
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4" /> Add Variable
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {env.variables.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <KeyRound className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-4">No variables yet. Add your first key-value pair.</p>
            <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4" /> Add Variable</Button>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {env.variables.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <code className="font-mono text-sm font-medium">{v.key}</code>
                    </TableCell>
                    <TableCell>
                      <code className="font-mono text-sm text-muted-foreground">
                        {revealedIds.has(v.id) ? v.value : maskValue(v.value)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleReveal(v.id)}>
                          {revealedIds.has(v.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyValue(v.value)}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(v)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setDeletingVar(v); setDeleteDialogOpen(true); }}>
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
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVar ? "Edit Variable" : "Add Variable"}</DialogTitle>
            <DialogDescription>{editingVar ? "Update the key-value pair." : "Add a new environment variable."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!key.trim()}>{editingVar ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Variable</DialogTitle>
            <DialogDescription>Delete <code className="font-mono font-medium">{deletingVar?.key}</code>? This cannot be undone.</DialogDescription>
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
