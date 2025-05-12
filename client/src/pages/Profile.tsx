import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserCharacters, saveAnalyticsEvent } from "@/lib/firebase";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { 
  FileEdit,
  Download,
  Plus, 
  Trash2, 
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { currentUser } = useAuth();
  const [characters, setCharacters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteCharacterId, setDeleteCharacterId] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser && !isLoading) {
      navigate("/");
      toast({
        title: "Login Required",
        description: "Please login to view your profile and saved characters.",
        variant: "destructive"
      });
    }
  }, [currentUser, isLoading, navigate, toast]);

  // Fetch user's characters
  useEffect(() => {
    async function fetchCharacters() {
      if (currentUser) {
        try {
          setIsLoading(true);
          const userCharacters = await getUserCharacters(currentUser.uid);
          setCharacters(userCharacters);
          
          // Log analytics event
          saveAnalyticsEvent('profile_view', {
            userId: currentUser.uid,
            characterCount: userCharacters.length
          }, currentUser.uid);
        } catch (error) {
          console.error("Error fetching characters:", error);
          toast({
            title: "Error",
            description: "Failed to load your characters. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    fetchCharacters();
  }, [currentUser, toast]);

  const handleDeleteCharacter = async () => {
    if (!deleteCharacterId) return;
    
    try {
      // Will implement delete functionality with firebase
      toast({
        title: "Character Deleted",
        description: "Your character has been deleted successfully."
      });
      
      // Update the local state
      setCharacters(characters.filter(char => char.id !== deleteCharacterId));
      setDeleteCharacterId(null);
      
      // Log analytics event
      if (currentUser) {
        saveAnalyticsEvent('character_deleted', {
          userId: currentUser.uid,
          characterId: deleteCharacterId
        }, currentUser.uid);
      }
    } catch (error) {
      console.error("Error deleting character:", error);
      toast({
        title: "Error",
        description: "Failed to delete character. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!currentUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8 text-center">
          <h1 className="font-comic text-4xl text-accent mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            {currentUser.displayName || currentUser.email}
          </p>
        </div>

        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="characters" className="font-comic">
              My Characters
            </TabsTrigger>
            <TabsTrigger value="account" className="font-comic">
              Account Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="characters">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-comic text-2xl">Saved Characters</h2>
              <Button 
                className="bg-accent hover:bg-red-700" 
                onClick={() => navigate("/creator")}
              >
                <Plus className="mr-2 h-4 w-4" /> New Character
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
              </div>
            ) : characters.length === 0 ? (
              <Card className="bg-panel halftone-bg comic-border">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-comic text-xl mb-2">No Characters Found</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't created any characters yet. Start by creating your first superhero!
                  </p>
                  <Button 
                    className="bg-accent hover:bg-red-700" 
                    onClick={() => navigate("/creator")}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Create Character
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map((character) => (
                  <Card key={character.id} className="bg-panel halftone-bg comic-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-comic text-xl text-accent flex justify-between items-center">
                        <span>{character.name || "Unnamed Character"}</span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-gray-400 hover:text-red-500"
                              onClick={() => setDeleteCharacterId(character.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-panel border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="font-comic text-xl">Delete Character?</DialogTitle>
                            </DialogHeader>
                            <p className="py-4">
                              Are you sure you want to delete this character? This action cannot be undone.
                            </p>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button 
                                variant="destructive"
                                onClick={handleDeleteCharacter}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardTitle>
                      <div className="text-sm text-gray-400">
                        {character.origin} • {character.archetype || "No Archetype"}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center border border-gray-700 rounded-lg py-1">
                          <div className="text-xs text-gray-400">STR</div>
                          <div className="font-medium">{character.data?.abilities?.strength?.value || "-"}</div>
                        </div>
                        <div className="text-center border border-gray-700 rounded-lg py-1">
                          <div className="text-xs text-gray-400">DEX</div>
                          <div className="font-medium">{character.data?.abilities?.dexterity?.value || "-"}</div>
                        </div>
                        <div className="text-center border border-gray-700 rounded-lg py-1">
                          <div className="text-xs text-gray-400">CON</div>
                          <div className="font-medium">{character.data?.abilities?.constitution?.value || "-"}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button 
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
                          onClick={() => navigate(`/creator?edit=${character.id}`)}
                        >
                          <FileEdit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <Button className="flex-1 bg-accent hover:bg-red-700 text-white">
                          <Download className="mr-2 h-4 w-4" /> PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="account">
            <Card className="bg-panel halftone-bg comic-border">
              <CardHeader>
                <CardTitle className="font-comic text-xl">Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Email</h3>
                    <p>{currentUser.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Display Name</h3>
                    <p>{currentUser.displayName || "Not set"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Account Created</h3>
                    <p>{currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : "Unknown"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}