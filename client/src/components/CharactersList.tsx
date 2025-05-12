import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getUserCharacters, deleteCharacterFromFirebase } from '../lib/firebase';
import { apiRequest } from '../lib/queryClient';
import { trackEvent } from '../lib/analytics';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import CharacterPdfButton from './CharacterPdfButton';

/**
 * Component to display a list of saved characters with management options
 */
export default function CharactersList() {
  const [location, navigate] = useLocation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Fetch characters from both Firebase and database
  const { data: characters, isLoading, error } = useQuery({
    queryKey: ['characters'],
    queryFn: async () => {
      if (!currentUser) return [];
      
      // Get characters from database via API
      try {
        const dbCharacters = await apiRequest(`/api/characters?userId=${currentUser.uid}`);
        
        // Get characters from Firebase
        const firebaseCharacters = await getUserCharacters(currentUser.uid);
        
        // Combine and deduplicate (prioritizing db versions if they exist)
        const allCharacters = [...dbCharacters];
        
        // Add Firebase-only characters
        firebaseCharacters.forEach(fbChar => {
          if (!dbCharacters.some(dbChar => dbChar.firebaseId === fbChar.id)) {
            allCharacters.push({
              ...fbChar.data,
              id: null, // No database ID yet
              firebaseId: fbChar.id,
              storageType: 'firebase'
            });
          }
        });
        
        return allCharacters;
      } catch (error) {
        console.error('Error fetching characters:', error);
        return [];
      }
    },
    enabled: !!currentUser
  });
  
  // Delete character mutation
  const deleteMutation = useMutation({
    mutationFn: async (characterId: string | number) => {
      // If it's a string, assume it's a Firebase ID
      if (typeof characterId === 'string') {
        await deleteCharacterFromFirebase(characterId);
      } else {
        // Otherwise, it's a database ID
        await apiRequest(`/api/characters/${characterId}`, {
          method: 'DELETE'
        });
      }
    },
    onSuccess: () => {
      // Invalidate characters query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      
      toast({
        title: 'Character Deleted',
        description: 'The character has been successfully deleted.',
        variant: 'default'
      });
      
      // Track deletion in analytics
      trackEvent('character_deleted');
    },
    onError: (error) => {
      console.error('Error deleting character:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the character. Please try again.',
        variant: 'destructive'
      });
    }
  });
  
  // Handle character deletion
  const handleDeleteCharacter = (character: any) => {
    // Determine how to delete based on storage type
    if (character.firebaseId) {
      deleteMutation.mutate(character.firebaseId);
    } else if (character.id) {
      deleteMutation.mutate(character.id);
    }
  };
  
  // Handle character view
  const handleViewCharacter = (character: any) => {
    setSelectedCharacter(character);
    setIsDialogOpen(true);
  };
  
  // Handle character edit
  const handleEditCharacter = (character: any) => {
    // Track edit action in analytics
    trackEvent('character_edit_started');
    
    // Navigate to character editor with the character ID
    if (character.id) {
      navigate(`/creator/${character.id}`);
    } else if (character.firebaseId) {
      navigate(`/creator?firebaseId=${character.firebaseId}`);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        <p>Error loading characters. Please try again.</p>
      </div>
    );
  }
  
  // Render empty state
  if (!characters || characters.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-semibold mb-2">No Characters Found</h3>
        <p className="text-gray-500 mb-4">You haven't created any characters yet.</p>
        <Button onClick={() => navigate('/creator')}>Create a Character</Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {characters.map((character: any) => (
          <Card key={character.id || character.firebaseId} className="overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800">
              <CardTitle>{character.name}</CardTitle>
              <CardDescription>
                {character.concept || 'No concept provided'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-2">
                <span className="font-semibold">Origin:</span> {character.origin || 'Unknown'}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Archetype:</span> {character.archetype || 'Unknown'}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Last updated: {formatDate(character.updatedAt)}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2 border-t bg-gray-50 dark:bg-gray-800 p-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleViewCharacter(character)}
              >
                <Eye size={16} className="mr-1" /> View
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleEditCharacter(character)}
              >
                <Pencil size={16} className="mr-1" /> Edit
              </Button>
              
              <CharacterPdfButton 
                character={character.data || character} 
                variant="ghost" 
                label="PDF" 
              />
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} className="mr-1" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete {character.name}. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteCharacter(character)}
                      className="bg-red-500 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {selectedCharacter && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCharacter.name}</DialogTitle>
              <DialogDescription>
                {selectedCharacter.secretIdentity && `Secret Identity: ${selectedCharacter.secretIdentity}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Character Info</h3>
                <p><span className="font-medium">Concept:</span> {selectedCharacter.concept}</p>
                <p><span className="font-medium">Origin:</span> {selectedCharacter.origin}</p>
                <p><span className="font-medium">Archetype:</span> {selectedCharacter.archetype}</p>
                <p><span className="font-medium">Gender:</span> {selectedCharacter.gender}</p>
                <p><span className="font-medium">Age:</span> {selectedCharacter.age}</p>
                <p><span className="font-medium">Height:</span> {selectedCharacter.height}</p>
                <p><span className="font-medium">Weight:</span> {selectedCharacter.weight}</p>
                
                <h3 className="text-lg font-semibold mt-4 mb-2">Combat Stats</h3>
                <div className="grid grid-cols-2 gap-2">
                  <p><span className="font-medium">Defense:</span> {selectedCharacter.defense}</p>
                  <p><span className="font-medium">Toughness:</span> {selectedCharacter.toughness}</p>
                  <p><span className="font-medium">Fortitude:</span> {selectedCharacter.fortitude}</p>
                  <p><span className="font-medium">Reflex:</span> {selectedCharacter.reflex}</p>
                  <p><span className="font-medium">Willpower:</span> {selectedCharacter.willpower}</p>
                  <p><span className="font-medium">Initiative:</span> {selectedCharacter.initiative}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Abilities</h3>
                {selectedCharacter.abilities && (
                  <div className="grid grid-cols-2 gap-2">
                    <p><span className="font-medium">STR:</span> {selectedCharacter.abilities.strength.value} ({selectedCharacter.abilities.strength.modifier >= 0 ? '+' : ''}{selectedCharacter.abilities.strength.modifier})</p>
                    <p><span className="font-medium">DEX:</span> {selectedCharacter.abilities.dexterity.value} ({selectedCharacter.abilities.dexterity.modifier >= 0 ? '+' : ''}{selectedCharacter.abilities.dexterity.modifier})</p>
                    <p><span className="font-medium">CON:</span> {selectedCharacter.abilities.constitution.value} ({selectedCharacter.abilities.constitution.modifier >= 0 ? '+' : ''}{selectedCharacter.abilities.constitution.modifier})</p>
                    <p><span className="font-medium">INT:</span> {selectedCharacter.abilities.intelligence.value} ({selectedCharacter.abilities.intelligence.modifier >= 0 ? '+' : ''}{selectedCharacter.abilities.intelligence.modifier})</p>
                    <p><span className="font-medium">WIS:</span> {selectedCharacter.abilities.wisdom.value} ({selectedCharacter.abilities.wisdom.modifier >= 0 ? '+' : ''}{selectedCharacter.abilities.wisdom.modifier})</p>
                    <p><span className="font-medium">CHA:</span> {selectedCharacter.abilities.charisma.value} ({selectedCharacter.abilities.charisma.modifier >= 0 ? '+' : ''}{selectedCharacter.abilities.charisma.modifier})</p>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold mt-4 mb-2">Skills</h3>
                {selectedCharacter.skills && selectedCharacter.skills.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {selectedCharacter.skills.map((skill: any, index: number) => (
                      <li key={index}>
                        <span className="font-medium">{skill.name}</span> ({skill.ability}): {skill.ranks} ranks
                        {skill.trained && ' (Trained)'}
                        {skill.specialization && ` - Specialization: ${skill.specialization}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No skills added.</p>
                )}
              </div>
            </div>
            
            <div className="mt-2">
              <h3 className="text-lg font-semibold mb-2">Powers</h3>
              {selectedCharacter.powers && selectedCharacter.powers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {selectedCharacter.powers.map((power: any, index: number) => (
                    <div key={index} className="border p-3 rounded-md">
                      <h4 className="font-semibold">{power.name} (Rank {power.rank}, Cost {power.cost})</h4>
                      <p className="text-sm mt-1">{power.description}</p>
                      
                      {power.perks && power.perks.length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">Perks:</span>
                          <ul className="list-disc pl-5 text-sm">
                            {power.perks.map((perk: string, i: number) => (
                              <li key={i}>{perk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {power.flaws && power.flaws.length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium text-sm">Flaws:</span>
                          <ul className="list-disc pl-5 text-sm">
                            {power.flaws.map((flaw: string, i: number) => (
                              <li key={i}>{flaw}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No powers added.</p>
              )}
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Complications</h3>
              {selectedCharacter.complications && selectedCharacter.complications.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {selectedCharacter.complications.map((comp: any, index: number) => (
                    <div key={index} className="border p-3 rounded-md">
                      <h4 className="font-semibold">{comp.name}</h4>
                      <p className="text-sm mt-1">{comp.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No complications added.</p>
              )}
            </div>
            
            <DialogFooter className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => handleEditCharacter(selectedCharacter)}>
                <Pencil size={16} className="mr-2" /> Edit Character
              </Button>
              <CharacterPdfButton 
                character={selectedCharacter.data || selectedCharacter} 
                label="Download PDF" 
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}