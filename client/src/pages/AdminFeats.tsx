import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { PlusCircle, Pencil, Trash2, ArrowLeft } from "lucide-react";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getGameContent,
  createGameContent,
  updateGameContent,
  deleteGameContent,
  usingFallbackData,
} from "@/lib/api";

interface Feat {
  id: number;
  name: string;
  description: string;
  prerequisites?: string[];
  type: string;
  repeatable: boolean;
  tags: string[];
  notes: string;
  input_label?: string | null;
}

export default function AdminFeats() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [feats, setFeats] = useState<Feat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeat, setSelectedFeat] = useState<Feat | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const emptyFeat = {
    name: "",
    description: "",
    prerequisites: "",
    type: "normal",
    repeatable: false,
    tags: "",
    notes: "",
    input_label: "",
  } as any;

  const [newFeat, setNewFeat] = useState<any>(emptyFeat);

  useEffect(() => {
    fetchFeats();
  }, []);

  const fetchFeats = async () => {
    setIsLoading(true);
    try {
      const data = await getGameContent("feats");
      setFeats(data);
      if (usingFallbackData) {
        toast({
          title: "Database Connection Issue",
          description:
            "Unable to connect to the database. Showing sample data for demonstration purposes only. Editing functionality will be limited.",
          variant: "destructive",
          duration: 7000,
        });
      }
    } catch (error) {
      console.error("Error fetching feats:", error);
      toast({
        title: "Error",
        description: "Failed to load feats data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseList = (val: string) =>
    val
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v);

  const handleAddFeat = async () => {
    try {
      const payload = {
        name: newFeat.name,
        description: newFeat.description,
        prerequisites: parseList(newFeat.prerequisites || ""),
        type: newFeat.type,
        repeatable: !!newFeat.repeatable,
        tags: parseList(newFeat.tags || ""),
        notes: newFeat.notes,
        input_label: newFeat.input_label || null,
      };
      const added = await createGameContent("feats", payload);
      setFeats((prev) => [...prev, added]);
      setIsAdding(false);
      setNewFeat({ ...emptyFeat });
      toast({
        title: "Success",
        description: `Feat "${added.name}" has been added.`,
      });
    } catch (error: any) {
      console.error("Error adding feat:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add feat.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFeat = async () => {
    if (!selectedFeat) return;
    try {
      const payload = {
        name: selectedFeat.name,
        description: selectedFeat.description,
        prerequisites: parseList((selectedFeat as any).prerequisitesStr || ""),
        type: selectedFeat.type,
        repeatable: !!selectedFeat.repeatable,
        tags: parseList((selectedFeat as any).tagsStr || ""),
        notes: selectedFeat.notes,
        input_label: selectedFeat.input_label || null,
      };
      const updated = await updateGameContent("feats", selectedFeat.id, payload);
      setFeats((prev) =>
        prev.map((f) => (f.id === updated.id ? updated : f))
      );
      setIsEditing(false);
      setSelectedFeat(null);
      toast({
        title: "Success",
        description: `Feat "${updated.name}" has been updated.`,
      });
    } catch (error: any) {
      console.error("Error updating feat:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update feat.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFeat = async () => {
    if (!selectedFeat) return;
    try {
      await deleteGameContent("feats", selectedFeat.id);
      setFeats((prev) => prev.filter((f) => f.id !== selectedFeat.id));
      setIsDeleting(false);
      toast({
        title: "Success",
        description: `Feat "${selectedFeat.name}" has been deleted.`,
      });
      setSelectedFeat(null);
    } catch (error: any) {
      console.error("Error deleting feat:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete feat.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminProtectedRoute>
        <div className="container mx-auto py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading feats data...</p>
        </div>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-comic">Manage Feats</h1>
        </div>

        <div className="mb-4 flex justify-end">
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button disabled={usingFallbackData}>
                <PlusCircle className="h-4 w-4 mr-2" /> Add New Feat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Feat</DialogTitle>
                <DialogDescription>
                  Create a new feat entry
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Input
                  placeholder="Name"
                  value={newFeat.name}
                  onChange={(e) => setNewFeat({ ...newFeat, name: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  rows={3}
                  value={newFeat.description}
                  onChange={(e) =>
                    setNewFeat({ ...newFeat, description: e.target.value })
                  }
                />
                <Input
                  placeholder="Prerequisites (comma separated)"
                  value={newFeat.prerequisites}
                  onChange={(e) =>
                    setNewFeat({ ...newFeat, prerequisites: e.target.value })
                  }
                />
                <Input
                  placeholder="Type"
                  value={newFeat.type}
                  onChange={(e) => setNewFeat({ ...newFeat, type: e.target.value })}
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="repeatable-new"
                    checked={newFeat.repeatable}
                    onChange={(e) =>
                      setNewFeat({ ...newFeat, repeatable: e.target.checked })
                    }
                  />
                  <label htmlFor="repeatable-new" className="text-sm">
                    Repeatable
                  </label>
                </div>
                <Input
                  placeholder="Tags (comma separated)"
                  value={newFeat.tags}
                  onChange={(e) => setNewFeat({ ...newFeat, tags: e.target.value })}
                />
                <Input
                  placeholder="Input Label"
                  value={newFeat.input_label}
                  onChange={(e) =>
                    setNewFeat({ ...newFeat, input_label: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Notes"
                  rows={2}
                  value={newFeat.notes}
                  onChange={(e) => setNewFeat({ ...newFeat, notes: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddFeat} disabled={!newFeat.name}>
                  Add Feat
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feats.map((feat) => (
                <TableRow key={feat.id}>
                  <TableCell>{feat.name}</TableCell>
                  <TableCell>{feat.type}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {feat.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog
                        open={isEditing && selectedFeat?.id === feat.id}
                        onOpenChange={(open) => {
                          if (open) {
                            setSelectedFeat({
                              ...feat,
                              prerequisitesStr: (feat.prerequisites || []).join(", "),
                              tagsStr: (feat.tags || []).join(", "),
                            } as any);
                          }
                          setIsEditing(open);
                          if (!open) setSelectedFeat(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button size="icon" variant="outline">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        {selectedFeat && (
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit Feat</DialogTitle>
                              <DialogDescription>
                                Update feat information
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2 py-2">
                              <Input
                                placeholder="Name"
                                value={selectedFeat.name}
                                onChange={(e) =>
                                  setSelectedFeat((p) => p && { ...p, name: e.target.value })
                                }
                              />
                              <Textarea
                                placeholder="Description"
                                rows={3}
                                value={selectedFeat.description}
                                onChange={(e) =>
                                  setSelectedFeat((p) => p && { ...p, description: e.target.value })
                                }
                              />
                              <Input
                                placeholder="Prerequisites (comma separated)"
                                value={(selectedFeat as any).prerequisitesStr || ""}
                                onChange={(e) =>
                                  setSelectedFeat((p) =>
                                    p && { ...p, prerequisitesStr: e.target.value }
                                  )
                                }
                              />
                              <Input
                                placeholder="Type"
                                value={selectedFeat.type}
                                onChange={(e) =>
                                  setSelectedFeat((p) => p && { ...p, type: e.target.value })
                                }
                              />
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="repeatable-edit"
                                  checked={selectedFeat.repeatable}
                                  onChange={(e) =>
                                    setSelectedFeat((p) =>
                                      p && { ...p, repeatable: e.target.checked }
                                    )
                                  }
                                />
                                <label htmlFor="repeatable-edit" className="text-sm">
                                  Repeatable
                                </label>
                              </div>
                              <Input
                                placeholder="Tags (comma separated)"
                                value={(selectedFeat as any).tagsStr || ""}
                                onChange={(e) =>
                                  setSelectedFeat((p) => p && { ...p, tagsStr: e.target.value })
                                }
                              />
                              <Input
                                placeholder="Input Label"
                                value={selectedFeat.input_label || ""}
                                onChange={(e) =>
                                  setSelectedFeat((p) =>
                                    p && { ...p, input_label: e.target.value }
                                  )
                                }
                              />
                              <Textarea
                                placeholder="Notes"
                                rows={2}
                                value={selectedFeat.notes}
                                onChange={(e) =>
                                  setSelectedFeat((p) => p && { ...p, notes: e.target.value })
                                }
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsEditing(false);
                                  setSelectedFeat(null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleUpdateFeat}>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>
                      <AlertDialog
                        open={isDeleting && selectedFeat?.id === feat.id}
                        onOpenChange={(open) => {
                          if (open) setSelectedFeat(feat);
                          setIsDeleting(open);
                          if (!open) setSelectedFeat(null);
                        }}
                      >
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the feat "{feat.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteFeat}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}

