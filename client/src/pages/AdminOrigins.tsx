import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Shield, PlusCircle, Pencil, Trash2, ArrowLeft } from "lucide-react";

type Origin = {
  id: number;
  name: string;
  description: string;
  abilityBonuses: any;
  specialAbility: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type NewOrigin = Omit<Origin, 'id' | 'createdAt' | 'updatedAt'>;

export default function AdminOrigins() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { currentUser, isAdmin, isLoading } = useAuth();
  const [hasDirectAccess, setHasDirectAccess] = useState(false);
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [isLoadingOrigins, setIsLoadingOrigins] = useState(true);
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
    imageUrl: ''
  });
  const [isAddingOrigin, setIsAddingOrigin] = useState(false);
  const [isEditingOrigin, setIsEditingOrigin] = useState(false);
  const [isDeletingOrigin, setIsDeletingOrigin] = useState(false);
  
  // Check for special Opera admin access
  useEffect(() => {
    const directAccess = localStorage.getItem('isAdmin') === 'true';
    setHasDirectAccess(directAccess);
  }, []);
  
  // Redirect if not logged in or not admin
  useEffect(() => {
    // Skip all checks if user has direct admin access or localStorage admin
    if (hasDirectAccess || localStorage.getItem('isAdmin') === 'true') {
      return;
    }
    
    if (!currentUser && !isLoading) {
      navigate("/");
      toast({
        title: "Login Required",
        description: "Please login to access this page.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentUser && !isAdmin && !isLoading) {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
    }
  }, [currentUser, isAdmin, isLoading, navigate, toast, hasDirectAccess]);
  
  // Fetch origins data
  useEffect(() => {
    const isLocalAdmin = localStorage.getItem('isAdmin') === 'true';
    if ((currentUser && isAdmin) || hasDirectAccess || isLocalAdmin) {
      fetchOrigins();
    }
  }, [currentUser, isAdmin, hasDirectAccess]);

  const fetchOrigins = async () => {
    setIsLoadingOrigins(true);
    try {
      const response = await fetch('/api/game-content/origins');
      if (!response.ok) {
        throw new Error('Failed to fetch origins');
      }
      const data = await response.json();
      setOrigins(data);
    } catch (error) {
      console.error('Error fetching origins:', error);
      toast({
        title: "Error",
        description: "Failed to load origins data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingOrigins(false);
    }
  };

  const handleAddOrigin = async () => {
    try {
      const response = await fetch('/api/game-content/origins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrigin),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add origin');
      }
      
      const addedOrigin = await response.json();
      setOrigins(prev => [...prev, addedOrigin]);
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
        imageUrl: ''
      });
      
      toast({
        title: "Success",
        description: `Origin "${addedOrigin.name}" has been added.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error adding origin:', error);
      toast({
        title: "Error",
        description: "Failed to add new origin. Please try again.",
        variant: "destructive"
      });
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
          imageUrl: selectedOrigin.imageUrl
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update origin');
      }
      
      const updatedOrigin = await response.json();
      setOrigins(prev => prev.map(origin => 
        origin.id === updatedOrigin.id ? updatedOrigin : origin
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

  // Handle ability bonus input change
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

  if (isLoading || isLoadingOrigins) {
    // Show loading state
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading origins data...</p>
      </div>
    );
  }

  // Only render content if user is admin or has direct access
  if (!isAdmin && !hasDirectAccess && localStorage.getItem('isAdmin') !== 'true' && !isLoading) {
    return null;
  }

  return (
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
          <div className="flex justify-end mb-4">
            <Dialog open={isAddingOrigin} onOpenChange={setIsAddingOrigin}>
              <DialogTrigger asChild>
                <Button>
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
                      onChange={(e) => setNewOrigin(prev => ({...prev, name: e.target.value}))}
                      placeholder="Origin name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      value={newOrigin.description} 
                      onChange={(e) => setNewOrigin(prev => ({...prev, description: e.target.value}))}
                      placeholder="Origin description"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Special Ability</label>
                    <Textarea 
                      value={newOrigin.specialAbility || ''} 
                      onChange={(e) => setNewOrigin(prev => ({...prev, specialAbility: e.target.value}))}
                      placeholder="Special ability description"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Image URL</label>
                    <Input 
                      value={newOrigin.imageUrl || ''} 
                      onChange={(e) => setNewOrigin(prev => ({...prev, imageUrl: e.target.value}))}
                      placeholder="URL to origin image"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ability Bonuses</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs">Strength</label>
                        <Input 
                          type="number" 
                          value={newOrigin.abilityBonuses.strength} 
                          onChange={(e) => handleAbilityBonusChange('strength', e.target.value, true)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs">Dexterity</label>
                        <Input 
                          type="number" 
                          value={newOrigin.abilityBonuses.dexterity} 
                          onChange={(e) => handleAbilityBonusChange('dexterity', e.target.value, true)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs">Constitution</label>
                        <Input 
                          type="number" 
                          value={newOrigin.abilityBonuses.constitution} 
                          onChange={(e) => handleAbilityBonusChange('constitution', e.target.value, true)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs">Intelligence</label>
                        <Input 
                          type="number" 
                          value={newOrigin.abilityBonuses.intelligence} 
                          onChange={(e) => handleAbilityBonusChange('intelligence', e.target.value, true)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs">Wisdom</label>
                        <Input 
                          type="number" 
                          value={newOrigin.abilityBonuses.wisdom} 
                          onChange={(e) => handleAbilityBonusChange('wisdom', e.target.value, true)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs">Charisma</label>
                        <Input 
                          type="number" 
                          value={newOrigin.abilityBonuses.charisma} 
                          onChange={(e) => handleAbilityBonusChange('charisma', e.target.value, true)}
                        />
                      </div>
                    </div>
                  </div>
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
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {origins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      No origins found. Add a new one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  origins.map((origin) => (
                    <TableRow key={origin.id}>
                      <TableCell className="font-medium">{origin.name}</TableCell>
                      <TableCell className="max-w-[500px] truncate">{origin.description}</TableCell>
                      <TableCell className="flex space-x-2">
                        <Dialog open={isEditingOrigin && selectedOrigin?.id === origin.id} onOpenChange={(open) => {
                          setIsEditingOrigin(open);
                          if (!open) setSelectedOrigin(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => setSelectedOrigin(origin)}
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
                                    onChange={(e) => setSelectedOrigin(prev => ({...prev!, name: e.target.value}))}
                                    placeholder="Origin name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Description</label>
                                  <Textarea 
                                    value={selectedOrigin.description} 
                                    onChange={(e) => setSelectedOrigin(prev => ({...prev!, description: e.target.value}))}
                                    placeholder="Origin description"
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Special Ability</label>
                                  <Textarea 
                                    value={selectedOrigin.specialAbility || ''} 
                                    onChange={(e) => setSelectedOrigin(prev => ({...prev!, specialAbility: e.target.value}))}
                                    placeholder="Special ability description"
                                    rows={2}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Image URL</label>
                                  <Input 
                                    value={selectedOrigin.imageUrl || ''} 
                                    onChange={(e) => setSelectedOrigin(prev => ({...prev!, imageUrl: e.target.value}))}
                                    placeholder="URL to origin image"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Ability Bonuses</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <label className="text-xs">Strength</label>
                                      <Input 
                                        type="number" 
                                        value={selectedOrigin.abilityBonuses.strength} 
                                        onChange={(e) => handleAbilityBonusChange('strength', e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-xs">Dexterity</label>
                                      <Input 
                                        type="number" 
                                        value={selectedOrigin.abilityBonuses.dexterity} 
                                        onChange={(e) => handleAbilityBonusChange('dexterity', e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-xs">Constitution</label>
                                      <Input 
                                        type="number" 
                                        value={selectedOrigin.abilityBonuses.constitution} 
                                        onChange={(e) => handleAbilityBonusChange('constitution', e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-xs">Intelligence</label>
                                      <Input 
                                        type="number" 
                                        value={selectedOrigin.abilityBonuses.intelligence} 
                                        onChange={(e) => handleAbilityBonusChange('intelligence', e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-xs">Wisdom</label>
                                      <Input 
                                        type="number" 
                                        value={selectedOrigin.abilityBonuses.wisdom} 
                                        onChange={(e) => handleAbilityBonusChange('wisdom', e.target.value)}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-xs">Charisma</label>
                                      <Input 
                                        type="number" 
                                        value={selectedOrigin.abilityBonuses.charisma} 
                                        onChange={(e) => handleAbilityBonusChange('charisma', e.target.value)}
                                      />
                                    </div>
                                  </div>
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
          <p className="text-sm text-muted-foreground">
            {origins.length} origins in database
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin")}
          >
            Back to Admin Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}