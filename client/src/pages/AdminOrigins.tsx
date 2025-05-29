import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getGameContent, createGameContent, updateGameContent, deleteGameContent, usingFallbackData } from "@/lib/api";
import { AlertTriangle, Shield, PlusCircle, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { DatabaseStatusBanner } from "@/components/DatabaseStatusBanner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

type OriginFeature = {
  name: string;
  description: string;
  level: number;
};

type Origin = {
  id: number;
  name: string;
  description: string;
  abilityBonuses: any;
  specialAbility: string | null;
  imageUrl: string | null;
  originFeatures: OriginFeature[];
  createdAt: string;
  updatedAt: string;
};

type NewOrigin = Omit<Origin, 'id' | 'createdAt' | 'updatedAt'>;

export default function AdminOrigins() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [isLoadingOrigins, setIsLoadingOrigins] = useState(true);
  const [isFallbackData, setIsFallbackData] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<Origin | null>(null);
  const [newOrigin, setNewOrigin] = useState<NewOrigin>({
    name: '',
    description: '',
    abilityBonuses: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    },
    specialAbility: '',
    imageUrl: '',
    originFeatures: []
  });
  const [isAddingOrigin, setIsAddingOrigin] = useState(false);
  const [isEditingOrigin, setIsEditingOrigin] = useState(false);
  const [isDeletingOrigin, setIsDeletingOrigin] = useState(false);

  useEffect(() => {
    fetchOrigins();
  }, []);

  const fetchOrigins = async () => {
    setIsLoadingOrigins(true);
    setIsFallbackData(false);

    try {
      const data = await getGameContent('origins');
      setOrigins(
        data.map((origin: any) => ({
          ...origin,
          originFeatures: Array.isArray(origin.originFeatures) ? origin.originFeatures : [],
        }))
      );

      if (usingFallbackData) {
        setIsFallbackData(true);
        toast({
          title: "Database Connection Issue",
          description: "Unable to connect to the database. Showing sample data for demonstration purposes only. Editing functionality will be limited.",
          variant: "destructive",
          duration: 7000
        });
      }
    } catch (error) {
      console.error('Error fetching origins:', error);
      toast({
        title: "Error",
        description: "Failed to load origins data. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingOrigins(false);
    }
  };

  const handleAddOrigin = async () => {
    try {
      const addedOrigin = await createGameContent('origins', newOrigin);

      setOrigins(prev => [
        ...prev,
        {
          ...addedOrigin,
          originFeatures: Array.isArray(addedOrigin.originFeatures) ? addedOrigin.originFeatures : [],
        }
      ]);
      setIsAddingOrigin(false);
      setNewOrigin({
        name: '',
        description: '',
        abilityBonuses: {
          strength: 0,
          dexterity: 0,
          constitution: 0,
          intelligence: 0,
          wisdom: 0,
          charisma: 0
        },
        specialAbility: '',
        imageUrl: '',
        originFeatures: []
      });

      toast({
        title: "Success",
        description: `Origin "${addedOrigin.name}" has been added.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error adding origin:', error);

      if (origins.some(o => o.id === 0 && o.name === "Alien")) {
        toast({
          title: "Database Unavailable",
          description: "Can't add new origins while using sample data. Please try again when the database connection is restored.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add new origin. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleUpdateOrigin = async () => {
    if (!selectedOrigin) return;

    try {
      const response = await fetch(`/api/game-content/origins/${selectedOrigin.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedOrigin.name,
          description: selectedOrigin.description,
          abilityBonuses: selectedOrigin.abilityBonuses,
          specialAbility: selectedOrigin.specialAbility,
          imageUrl: selectedOrigin.imageUrl,
          originFeatures: selectedOrigin.originFeatures
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update origin');
      }

      const updatedOrigin = await response.json();
      setOrigins(prev => prev.map(origin =>
        origin.id === updatedOrigin.id
          ? { ...updatedOrigin, originFeatures: Array.isArray(updatedOrigin.originFeatures) ? updatedOrigin.originFeatures : [] }
          : origin
      ));
      setIsEditingOrigin(false);
      setSelectedOrigin(null);

      toast({
        title: "Success",
        description: `Origin "${updatedOrigin.name}" has been updated.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating origin:', error);
      toast({
        title: "Error",
        description: "Failed to update origin. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOrigin = async () => {
    if (!selectedOrigin) return;

    try {
      const response = await fetch(`/api/game-content/origins/${selectedOrigin.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete origin');
      }

      setOrigins(prev => prev.filter(origin => origin.id !== selectedOrigin.id));
      setIsDeletingOrigin(false);

      toast({
        title: "Success",
        description: `Origin "${selectedOrigin.name}" has been deleted.`,
        variant: "default"
      });

      setSelectedOrigin(null);
    } catch (error) {
      console.error('Error deleting origin:', error);
      toast({
        title: "Error",
        description: "Failed to delete origin. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAbilityBonusChange = (ability: string, value: string, isNewOrigin: boolean = false) => {
    const numValue = parseInt(value) || 0;

    if (isNewOrigin) {
      setNewOrigin(prev => ({
        ...prev,
        abilityBonuses: {
          ...prev.abilityBonuses,
          [ability]: numValue
        }
      }));
    } else if (selectedOrigin) {
      setSelectedOrigin(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          abilityBonuses: {
            ...prev.abilityBonuses,
            [ability]: numValue
          }
        };
      });
    }
  };

  if (isLoadingOrigins) {
    return (
      <AdminProtectedRoute>
        <div className="container mx-auto py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading origins data...</p>
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
          <Shield className="h-8 w-8 mr-3 text-blue-500" />
          <h1 className="text-3xl font-comic">Manage Origins</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Origins Management</CardTitle>
            <CardDescription>
              Add, edit, or remove character origins from the game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DatabaseStatusBanner isUsingFallbackData={isFallbackData} />

            <div className="flex justify-end items-center mb-4">
              <Dialog open={isAddingOrigin} onOpenChange={setIsAddingOrigin}>
                <DialogTrigger asChild>
                  <Button disabled={isFallbackData}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Origin
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Origin</DialogTitle>
                    <DialogDescription>
                      Create a new character origin for the game
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={newOrigin.name}
                        onChange={(e) => setNewOrigin(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Origin name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={newOrigin.description}
                        onChange={(e) => setNewOrigin(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Origin description"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Special Ability</label>
                      <Textarea
                        value={newOrigin.specialAbility || ''}
                        onChange={(e) => setNewOrigin(prev => ({ ...prev, specialAbility: e.target.value }))}
                        placeholder="Special ability description"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Image URL</label>
                      <Input
                        value={newOrigin.imageUrl || ''}
                        onChange={(e) => setNewOrigin(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="URL to origin image"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ability Bonuses</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].map((ability) => (
                          <div className="space-y-1" key={ability}>
                            <label className="text-xs capitalize">{ability}</label>
                            <Input
                              type="number"
                              value={newOrigin.abilityBonuses[ability]}
                              onChange={(e) => handleAbilityBonusChange(ability, e.target.value, true)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Origin Features</label>
                    {Array.isArray(newOrigin.originFeatures) && newOrigin.originFeatures.map((feature, index) => (
                      <div key={index} className="border p-3 rounded-lg space-y-2 bg-gray-900">
                        <Input
                          placeholder="Feature name"
                          value={feature.name}
                          onChange={(e) => {
                            const updated = [...newOrigin.originFeatures];
                            updated[index].name = e.target.value;
                            setNewOrigin(prev => ({ ...prev, originFeatures: updated }));
                          }}
                        />
                        <Textarea
                          placeholder="Feature description"
                          rows={2}
                          value={feature.description}
                          onChange={(e) => {
                            const updated = [...newOrigin.originFeatures];
                            updated[index].description = e.target.value;
                            setNewOrigin(prev => ({ ...prev, originFeatures: updated }));
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Unlocks at level..."
                          value={feature.level || ""}
                          onChange={(e) => {
                            const updated = [...newOrigin.originFeatures];
                            updated[index].level = parseInt(e.target.value) || 1;
                            setNewOrigin(prev => ({ ...prev, originFeatures: updated }));
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            const updated = newOrigin.originFeatures.filter((_, i) => i !== index);
                            setNewOrigin(prev => ({ ...prev, originFeatures: updated }));
                          }}
                        >
                          Remove Feature
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setNewOrigin(prev => ({
                          ...prev,
                          originFeatures: [
                            ...(prev.originFeatures || []),
                            { name: "", description: "", level: 1 }
                          ]
                        }));
                      }}
                    >
                      + Add Feature
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingOrigin(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddOrigin}
                      disabled={!newOrigin.name || !newOrigin.description}
                    >
                      Add Origin
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {origins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                        No origins found. Add a new one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    origins.map((origin) => (
                      <TableRow key={origin.id}>
                        <TableCell className="font-medium">{origin.name}</TableCell>
                        <TableCell className="flex space-x-2">
                          <Dialog open={isEditingOrigin && selectedOrigin?.id === origin.id} onOpenChange={(open) => {
                            setIsEditingOrigin(open);
                            if (!open) setSelectedOrigin(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSelectedOrigin({
                                  ...origin,
                                  abilityBonuses: {
                                    strength: 0,
                                    dexterity: 0,
                                    constitution: 0,
                                    intelligence: 0,
                                    wisdom: 0,
                                    charisma: 0,
                                    ...(origin.abilityBonuses || {})
                                  },
                                  originFeatures: Array.isArray(origin.originFeatures) ? origin.originFeatures : []
                                })}
                                disabled={isFallbackData}
                                title={isFallbackData ? "Editing is disabled when using sample data" : "Edit origin"}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Origin</DialogTitle>
                                <DialogDescription>
                                  Update the details for this character origin
                                </DialogDescription>
                              </DialogHeader>
                              {selectedOrigin && (
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input
                                      value={selectedOrigin.name}
                                      onChange={(e) => setSelectedOrigin(prev => prev ? { ...prev, name: e.target.value } : null)}
                                      placeholder="Origin name"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea
                                      value={selectedOrigin.description}
                                      onChange={(e) => setSelectedOrigin(prev => prev ? { ...prev, description: e.target.value } : null)}
                                      placeholder="Origin description"
                                      rows={3}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Special Ability</label>
                                    <Textarea
                                      value={selectedOrigin.specialAbility || ''}
                                      onChange={(e) => setSelectedOrigin(prev => prev ? { ...prev, specialAbility: e.target.value } : null)}
                                      placeholder="Special ability description"
                                      rows={2}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Image URL</label>
                                    <Input
                                      value={selectedOrigin.imageUrl || ''}
                                      onChange={(e) => setSelectedOrigin(prev => prev ? { ...prev, imageUrl: e.target.value } : null)}
                                      placeholder="URL to origin image"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Ability Bonuses</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      {["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"].map((ability) => (
                                        <div className="space-y-1" key={ability}>
                                          <label className="text-xs capitalize">{ability}</label>
                                          <Input
                                            type="number"
                                            value={selectedOrigin.abilityBonuses?.[ability] ?? 0}
                                            onChange={(e) => {
                                              const numValue = parseInt(e.target.value) || 0;
                                              setSelectedOrigin(prev => prev ? {
                                                ...prev,
                                                abilityBonuses: {
                                                  ...prev.abilityBonuses,
                                                  [ability]: numValue
                                                }
                                              } : null);
                                            }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Origin Features</label>
                                    {Array.isArray(selectedOrigin.originFeatures) && selectedOrigin.originFeatures.map((feature, index) => (
                                      <div key={index} className="border p-3 rounded-lg space-y-2 bg-gray-900">
                                        <Input
                                          placeholder="Feature name"
                                          value={feature.name}
                                          onChange={(e) => {
                                            const updated = [...selectedOrigin.originFeatures];
                                            updated[index].name = e.target.value;
                                            setSelectedOrigin(prev => prev ? { ...prev, originFeatures: updated } : null);
                                          }}
                                        />
                                        <Textarea
                                          placeholder="Feature description"
                                          rows={2}
                                          value={feature.description}
                                          onChange={(e) => {
                                            const updated = [...selectedOrigin.originFeatures];
                                            updated[index].description = e.target.value;
                                            setSelectedOrigin(prev => prev ? { ...prev, originFeatures: updated } : null);
                                          }}
                                        />
                                        <Input
                                          type="number"
                                          placeholder="Unlocks at level..."
                                          value={feature.level || ""}
                                          onChange={(e) => {
                                            const updated = [...selectedOrigin.originFeatures];
                                            updated[index].level = parseInt(e.target.value) || 1;
                                            setSelectedOrigin(prev => prev ? { ...prev, originFeatures: updated } : null);
                                          }}
                                        />
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-red-500 hover:text-red-700"
                                          onClick={() => {
                                            const updated = selectedOrigin.originFeatures.filter((_, i) => i !== index);
                                            setSelectedOrigin(prev => prev ? { ...prev, originFeatures: updated } : null);
                                          }}
                                        >
                                          Remove Feature
                                        </Button>
                                      </div>
                                    ))}
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedOrigin(prev => prev
                                          ? {
                                            ...prev,
                                            originFeatures: [
                                              ...(prev.originFeatures || []),
                                              { name: "", description: "", level: 1 }
                                            ]
                                          }
                                          : null
                                        );
                                      }}
                                    >
                                      + Add Feature
                                    </Button>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsEditingOrigin(false);
                                    setSelectedOrigin(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleUpdateOrigin}
                                  disabled={!selectedOrigin?.name || !selectedOrigin?.description}
                                >
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog open={isDeletingOrigin && selectedOrigin?.id === origin.id} onOpenChange={(open) => {
                            setIsDeletingOrigin(open);
                            if (!open) setSelectedOrigin(null);
                          }}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => setSelectedOrigin(origin)}
                                disabled={isFallbackData}
                                title={isFallbackData ? "Deleting is disabled when using sample data" : "Delete origin"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Origin</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the origin "{selectedOrigin?.name}"?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => {
                                  setIsDeletingOrigin(false);
                                  setSelectedOrigin(null);
                                }}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteOrigin}
                                  className="bg-red-500 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {origins.length} origins {isFallbackData ? 'in sample data' : 'in database'}
              </p>
              {isFallbackData && (
                <p className="text-xs text-orange-600 mt-1">
                  <AlertTriangle className="h-3 w-3 inline mr-1" />
                  Using sample data due to database connection issues
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/admin")}
            >
              Back to Admin Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminProtectedRoute>
  );
}