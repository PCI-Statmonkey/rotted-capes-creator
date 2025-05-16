import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { getGameContent, createGameContent, updateGameContent, deleteGameContent, usingFallbackData } from "@/lib/api";
import { DatabaseStatusBanner } from "@/components/DatabaseStatusBanner";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Swords, PlusCircle, Pencil, Trash2, ArrowLeft } from "lucide-react";

type Archetype = {
  id: number;
  name: string;
  description: string;
  specialAbility: string;
  keyAbilities: any;
  trainedSkill: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type NewArchetype = Omit<Archetype, 'id' | 'createdAt' | 'updatedAt'>;

export default function AdminArchetypes() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [archetypes, setArchetypes] = useState<Archetype[]>([]);
  const [isLoadingArchetypes, setIsLoadingArchetypes] = useState(true);
  const [isFallbackData, setIsFallbackData] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [newArchetype, setNewArchetype] = useState<NewArchetype>({
    name: '',
    description: '',
    specialAbility: '',
    keyAbilities: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false
    },
    trainedSkill: '',
    imageUrl: ''
  });
  const [isAddingArchetype, setIsAddingArchetype] = useState(false);
  const [isEditingArchetype, setIsEditingArchetype] = useState(false);
  const [isDeletingArchetype, setIsDeletingArchetype] = useState(false);
  
  // Fetch archetypes data
  useEffect(() => {
    fetchArchetypes();
  }, []);

  const fetchArchetypes = async () => {
    setIsLoadingArchetypes(true);
    setIsFallbackData(false);
    
    try {
      // Using our API utility which handles fallback data internally
      const data = await getGameContent('archetypes');
      setArchetypes(data);
      
      // Check if we're using fallback data
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
      console.error('Error fetching archetypes:', error);
      toast({
        title: "Error",
        description: "Failed to load archetypes data. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingArchetypes(false);
    }
  };

  const handleAddArchetype = async () => {
    // Prevent adding when using fallback data
    if (isFallbackData) {
      toast({
        title: "Database Unavailable",
        description: "Can't add new archetypes while using sample data. Please try again when the database connection is restored.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const addedArchetype = await createGameContent('archetypes', newArchetype);
      
      setArchetypes(prev => [...prev, addedArchetype]);
      setIsAddingArchetype(false);
      setNewArchetype({
        name: '',
        description: '',
        specialAbility: '',
        keyAbilities: {
          strength: false,
          dexterity: false,
          constitution: false,
          intelligence: false,
          wisdom: false,
          charisma: false
        },
        trainedSkill: '',
        imageUrl: ''
      });
      
      toast({
        title: "Success",
        description: `Archetype "${addedArchetype.name}" has been added.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error adding archetype:', error);
      toast({
        title: "Error",
        description: "Failed to add new archetype. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateArchetype = async () => {
    if (!selectedArchetype) return;
    
    // Prevent updating when using fallback data
    if (isFallbackData) {
      toast({
        title: "Database Unavailable",
        description: "Can't update archetypes while using sample data. Please try again when the database connection is restored.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const updateData = {
        name: selectedArchetype.name,
        description: selectedArchetype.description,
        specialAbility: selectedArchetype.specialAbility,
        keyAbilities: selectedArchetype.keyAbilities,
        trainedSkill: selectedArchetype.trainedSkill,
        imageUrl: selectedArchetype.imageUrl
      };
      
      const updatedArchetype = await updateGameContent('archetypes', selectedArchetype.id, updateData);
      
      setArchetypes(prev => prev.map(archetype => 
        archetype.id === updatedArchetype.id ? updatedArchetype : archetype
      ));
      setIsEditingArchetype(false);
      setSelectedArchetype(null);
      
      toast({
        title: "Success",
        description: `Archetype "${updatedArchetype.name}" has been updated.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating archetype:', error);
      toast({
        title: "Error",
        description: "Failed to update archetype. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteArchetype = async () => {
    if (!selectedArchetype) return;
    
    try {
      const response = await fetch(`/api/game-content/archetypes/${selectedArchetype.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete archetype');
      }
      
      setArchetypes(prev => prev.filter(archetype => archetype.id !== selectedArchetype.id));
      setIsDeletingArchetype(false);
      
      toast({
        title: "Success",
        description: `Archetype "${selectedArchetype.name}" has been deleted.`,
        variant: "default"
      });
      
      setSelectedArchetype(null);
    } catch (error) {
      console.error('Error deleting archetype:', error);
      toast({
        title: "Error",
        description: "Failed to delete archetype. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle key ability checkbox change
  const handleKeyAbilityChange = (ability: string, checked: boolean, isNewArchetype: boolean = false) => {
    if (isNewArchetype) {
      setNewArchetype(prev => ({
        ...prev,
        keyAbilities: {
          ...prev.keyAbilities,
          [ability]: checked
        }
      }));
    } else if (selectedArchetype) {
      setSelectedArchetype(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          keyAbilities: {
            ...prev.keyAbilities,
            [ability]: checked
          }
        };
      });
    }
  };

  if (isLoadingArchetypes) {
    // Show loading state
    return (
      <AdminProtectedRoute>
        <div className="container mx-auto py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading archetypes data...</p>
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
          <Swords className="h-8 w-8 mr-3 text-red-500" />
          <h1 className="text-3xl font-comic">Manage Archetypes</h1>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Archetypes Management</CardTitle>
            <CardDescription>
              Add, edit, or remove character archetypes from the game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Dialog open={isAddingArchetype} onOpenChange={setIsAddingArchetype}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Archetype
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Archetype</DialogTitle>
                    <DialogDescription>
                      Create a new character archetype for the game
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input 
                        value={newArchetype.name} 
                        onChange={(e) => setNewArchetype(prev => ({...prev, name: e.target.value}))}
                        placeholder="Archetype name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea 
                        value={newArchetype.description} 
                        onChange={(e) => setNewArchetype(prev => ({...prev, description: e.target.value}))}
                        placeholder="Archetype description"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Special Ability</label>
                      <Textarea 
                        value={newArchetype.specialAbility} 
                        onChange={(e) => setNewArchetype(prev => ({...prev, specialAbility: e.target.value}))}
                        placeholder="Special ability description"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Trained Skill</label>
                      <Input 
                        value={newArchetype.trainedSkill} 
                        onChange={(e) => setNewArchetype(prev => ({...prev, trainedSkill: e.target.value}))}
                        placeholder="Trained skill name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Image URL</label>
                      <Input 
                        value={newArchetype.imageUrl || ''} 
                        onChange={(e) => setNewArchetype(prev => ({...prev, imageUrl: e.target.value}))}
                        placeholder="URL to archetype image"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Key Abilities</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="new-strength"
                            checked={newArchetype.keyAbilities.strength} 
                            onChange={(e) => handleKeyAbilityChange('strength', e.target.checked, true)}
                            className="w-4 h-4"
                          />
                          <label htmlFor="new-strength" className="text-sm">Strength</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="new-dexterity"
                            checked={newArchetype.keyAbilities.dexterity} 
                            onChange={(e) => handleKeyAbilityChange('dexterity', e.target.checked, true)}
                            className="w-4 h-4"
                          />
                          <label htmlFor="new-dexterity" className="text-sm">Dexterity</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="new-constitution"
                            checked={newArchetype.keyAbilities.constitution} 
                            onChange={(e) => handleKeyAbilityChange('constitution', e.target.checked, true)}
                            className="w-4 h-4"
                          />
                          <label htmlFor="new-constitution" className="text-sm">Constitution</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="new-intelligence"
                            checked={newArchetype.keyAbilities.intelligence} 
                            onChange={(e) => handleKeyAbilityChange('intelligence', e.target.checked, true)}
                            className="w-4 h-4"
                          />
                          <label htmlFor="new-intelligence" className="text-sm">Intelligence</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="new-wisdom"
                            checked={newArchetype.keyAbilities.wisdom} 
                            onChange={(e) => handleKeyAbilityChange('wisdom', e.target.checked, true)}
                            className="w-4 h-4"
                          />
                          <label htmlFor="new-wisdom" className="text-sm">Wisdom</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            id="new-charisma"
                            checked={newArchetype.keyAbilities.charisma} 
                            onChange={(e) => handleKeyAbilityChange('charisma', e.target.checked, true)}
                            className="w-4 h-4"
                          />
                          <label htmlFor="new-charisma" className="text-sm">Charisma</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingArchetype(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddArchetype}
                      disabled={!newArchetype.name || !newArchetype.description || !newArchetype.specialAbility}
                    >
                      Add Archetype
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
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archetypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        No archetypes found. Add a new one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    archetypes.map((archetype) => (
                      <TableRow key={archetype.id}>
                        <TableCell className="font-medium">{archetype.name}</TableCell>
                        <TableCell className="max-w-[500px] truncate">{archetype.description}</TableCell>
                        <TableCell className="flex space-x-2">
                          <Dialog open={isEditingArchetype && selectedArchetype?.id === archetype.id} onOpenChange={(open) => {
                            if (open) {
                              setSelectedArchetype(archetype);
                            }
                            setIsEditingArchetype(open);
                            if (!open) {
                              setSelectedArchetype(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Archetype</DialogTitle>
                                <DialogDescription>
                                  Update the archetype details
                                </DialogDescription>
                              </DialogHeader>
                              {selectedArchetype && (
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input 
                                      value={selectedArchetype.name} 
                                      onChange={(e) => setSelectedArchetype(prev => prev ? {...prev, name: e.target.value} : prev)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea 
                                      value={selectedArchetype.description} 
                                      onChange={(e) => setSelectedArchetype(prev => prev ? {...prev, description: e.target.value} : prev)}
                                      rows={3}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Special Ability</label>
                                    <Textarea 
                                      value={selectedArchetype.specialAbility} 
                                      onChange={(e) => setSelectedArchetype(prev => prev ? {...prev, specialAbility: e.target.value} : prev)}
                                      rows={2}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Trained Skill</label>
                                    <Input 
                                      value={selectedArchetype.trainedSkill} 
                                      onChange={(e) => setSelectedArchetype(prev => prev ? {...prev, trainedSkill: e.target.value} : prev)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Image URL</label>
                                    <Input 
                                      value={selectedArchetype.imageUrl || ''} 
                                      onChange={(e) => setSelectedArchetype(prev => prev ? {...prev, imageUrl: e.target.value} : prev)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Key Abilities</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex items-center space-x-2">
                                        <input 
                                          type="checkbox" 
                                          id="edit-strength"
                                          checked={selectedArchetype.keyAbilities?.strength || false} 
                                          onChange={(e) => handleKeyAbilityChange('strength', e.target.checked)}
                                          className="w-4 h-4"
                                        />
                                        <label htmlFor="edit-strength" className="text-sm">Strength</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input 
                                          type="checkbox" 
                                          id="edit-dexterity"
                                          checked={selectedArchetype.keyAbilities?.dexterity || false} 
                                          onChange={(e) => handleKeyAbilityChange('dexterity', e.target.checked)}
                                          className="w-4 h-4"
                                        />
                                        <label htmlFor="edit-dexterity" className="text-sm">Dexterity</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input 
                                          type="checkbox" 
                                          id="edit-constitution"
                                          checked={selectedArchetype.keyAbilities?.constitution || false} 
                                          onChange={(e) => handleKeyAbilityChange('constitution', e.target.checked)}
                                          className="w-4 h-4"
                                        />
                                        <label htmlFor="edit-constitution" className="text-sm">Constitution</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input 
                                          type="checkbox" 
                                          id="edit-intelligence"
                                          checked={selectedArchetype.keyAbilities?.intelligence || false} 
                                          onChange={(e) => handleKeyAbilityChange('intelligence', e.target.checked)}
                                          className="w-4 h-4"
                                        />
                                        <label htmlFor="edit-intelligence" className="text-sm">Intelligence</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input 
                                          type="checkbox" 
                                          id="edit-wisdom"
                                          checked={selectedArchetype.keyAbilities?.wisdom || false} 
                                          onChange={(e) => handleKeyAbilityChange('wisdom', e.target.checked)}
                                          className="w-4 h-4"
                                        />
                                        <label htmlFor="edit-wisdom" className="text-sm">Wisdom</label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input 
                                          type="checkbox" 
                                          id="edit-charisma"
                                          checked={selectedArchetype.keyAbilities?.charisma || false} 
                                          onChange={(e) => handleKeyAbilityChange('charisma', e.target.checked)}
                                          className="w-4 h-4"
                                        />
                                        <label htmlFor="edit-charisma" className="text-sm">Charisma</label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setIsEditingArchetype(false);
                                    setSelectedArchetype(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleUpdateArchetype}
                                  disabled={!selectedArchetype?.name || !selectedArchetype?.description || !selectedArchetype?.specialAbility}
                                >
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog open={isDeletingArchetype && selectedArchetype?.id === archetype.id} onOpenChange={(open) => {
                            if (open) {
                              setSelectedArchetype(archetype);
                            }
                            setIsDeletingArchetype(open);
                            if (!open) {
                              setSelectedArchetype(null);
                            }
                          }}>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the archetype
                                  "{archetype.name}" and remove it from the database.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteArchetype}>
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
        </Card>
      </div>
    </AdminProtectedRoute>
  );
}