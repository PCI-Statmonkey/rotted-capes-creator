import React, { useState, useEffect } from 'react';
import { useCharacter } from '@/context/CharacterContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Trash2, Plus, PackageCheck, ShieldX } from 'lucide-react';

// Define Go-Bag types
type GoBagType = 'survivalist' | 'infiltrator' | 'technician' | 'medic' | 'bystander';

// Define weapon categories
type WeaponCategory = 'handgun' | 'rifle' | 'shotgun' | 'archaic' | 'melee' | 'thrown' | 'special';

// Define Go-Bag contents
interface GoBag {
  name: string;
  description: string;
  items: string[];
}

// Define weapon item
interface WeaponItem {
  name: string;
  category: WeaponCategory;
  description: string;
  damage?: string;
  range?: string;
  ap: number; // Acquisition Points cost
}

// Define Equipment item
interface EquipmentItem {
  name: string;
  description: string;
  ap: number; // Acquisition Points cost
}

// Go-Bag definitions
const goBags: Record<GoBagType, GoBag> = {
  survivalist: {
    name: "Survivalist Go-Bag",
    description: "Focused on long-term survival with water purification and navigation tools.",
    items: [
      "High Capacity Water Resistant Backpack",
      "Banged up Shake Flashlight",
      "Patched up bivouac Sack",
      "3 Liter Hand Powered UV Water Purifier (8,000 water treatments)",
      "EMT Medical Field First Aid kit (4 uses left)",
      "Compass OR GPS",
      "Mess Kit Ration (7 days worth)",
      "Flare gun and 4 flares",
      "Collapsible Fishing Rod"
    ]
  },
  infiltrator: {
    name: "Infiltrator Go-Bag",
    description: "Tactical gear focused on stealth, observation, and combat operations.",
    items: [
      "Water-resistant Tactical Ergo Pack",
      "Night scope and scope mount OR Laser sight and mount OR Pocket Lock Pick Set",
      "Water Resistant Night Vision Binoculars",
      "Tactical Holster Vest OR Tactical Sheath Utility Belt",
      "1 clip/magazine of ammo OR 2 Hand Grenades",
      "Climbing Kit",
      "Gas Mask",
      "2- Throat communicators with 1- 2-way radio/walkie-talkie",
      "Well-worn leather Tactical gloves"
    ]
  },
  technician: {
    name: "Technician Go-Bag",
    description: "Essential tools for repairs, electrical work, and mechanical maintenance.",
    items: [
      "Utility Belt",
      "Banged up Shake Flashlight",
      "2-way radio/walkie-talkie",
      "Solar Powered Jump Starter",
      "100-Piece Mechanics Tool Kit missing 25 pieces OR 100-Piece Home Essential Tool Kit missing 25 pieces",
      "Workman Gloves",
      "Multi-Tool",
      "Tool Belt",
      "Small solar power charger with battery",
      "Old phone with 32GB of movies, music and apps"
    ]
  },
  medic: {
    name: "Medic Go-Bag",
    description: "Medical supplies and emergency response equipment for treating injuries.",
    items: [
      "Water-resistant High Capacity Duffle",
      "Medical Pack - Tactical Response Pack",
      "Fast fold Litter",
      "Flare gun and 5 flares",
      "3- Emergency Survival Food Ration Packs",
      "1 Liter Hand Powered UV Water Purifier (8,000 water treatments)",
      "Climbers Kit",
      "4- 12-hour Light sticks",
      "Utility Folding knife"
    ]
  },
  bystander: {
    name: "Bystander Go-Bag",
    description: "Basic survival essentials for someone caught unprepared.",
    items: [
      "Water-resistant Backpack",
      "7- Emergency Survival Food Ration Packs",
      "3 Liter Hand Powered UV Water Purifier (8,000 water treatments)",
      "Compass OR GPS",
      "Standard First Aid Kit",
      "Bivouac Sack",
      "2- 12-hour Light sticks",
      "Climbers Kit",
      "Multi-Tool"
    ]
  }
};

// Common weapons list (simplified)
const weapons: WeaponItem[] = [
  { name: "Revolver", category: "handgun", description: "6-round revolver (Medium)", damage: "1d8 ballistic", range: "8 areas", ap: 1 },
  { name: "Semi-Auto Pistol", category: "handgun", description: "15-round magazine (Medium)", damage: "1d8 ballistic", range: "8 areas", ap: 1 },
  { name: "Bolt-Action Rifle", category: "rifle", description: "5-round capacity (Assault)", damage: "1d10 ballistic", range: "10 areas", ap: 1 },
  { name: "Hunting Rifle", category: "rifle", description: "6-round capacity (Medium)", damage: "1d8 ballistic", range: "8 areas", ap: 1 },
  { name: "Double Barrel Shotgun", category: "shotgun", description: "2-round capacity (Various loads)", damage: "2d6 ballistic (both barrels)", range: "6 areas", ap: 1 },
  { name: "Baseball Bat", category: "melee", description: "Improvised bludgeoning weapon", damage: "1d6 bludgeoning", ap: 0 },
  { name: "Machete", category: "melee", description: "Heavy cutting blade", damage: "1d8 slashing", ap: 1 },
  { name: "Bow", category: "archaic", description: "Traditional bow with arrows", damage: "1d6 piercing", range: "6 areas", ap: 1 },
  { name: "Crossbow", category: "archaic", description: "Modern crossbow with bolts", damage: "1d10 piercing", range: "11 areas", ap: 1 }
];

// Common equipment list (simplified)
const equipment: EquipmentItem[] = [
  { name: "First Aid Kit", description: "Basic medical supplies (10 uses)", ap: 1 },
  { name: "Backpack", description: "Standard backpack for carrying gear", ap: 1 },
  { name: "Binoculars", description: "Standard binoculars for observation", ap: 1 },
  { name: "Flashlight", description: "Durable LED flashlight with batteries", ap: 1 },
  { name: "Rope (50ft)", description: "Strong nylon rope", ap: 1 },
  { name: "Multi-tool", description: "All-purpose tool with various attachments", ap: 1 },
  { name: "Water Filter", description: "Portable water filtration system", ap: 2 },
  { name: "Camping Tent", description: "2-person camping tent", ap: 2 },
  { name: "Gas Mask", description: "Protects against airborne toxins", ap: 2 },
  { name: "Radio", description: "Two-way radio communication device", ap: 2 }
];

export default function Step8_Gear() {
  const { character, addGearItem, removeGearItem } = useCharacter();
  const [selectedGoBag, setSelectedGoBag] = useState<GoBagType | ''>('');
  const [newCustomGear, setNewCustomGear] = useState({ name: '', description: '' });
  const [acquisitionPoints, setAcquisitionPoints] = useState(5); // Default 5 AP
  const [expandedAccordion, setExpandedAccordion] = useState<string[]>(['go-bag']);

  // Store weapon and equipment associations to track AP costs
  const [itemApCosts, setItemApCosts] = useState<Record<string, number>>({});
  
  // Calculate bonus AP from feats
  const calculateBonusApFromFeats = (): number => {
    // Look for feats that grant bonus AP
    const bonusApFeats = [
      { name: "Scavenger", apBonus: 2 },
      { name: "Lucky Find", apBonus: 1 },
      { name: "Well Equipped", apBonus: 3 }
    ];
    
    let bonusAp = 0;
    character.feats.forEach(feat => {
      const matchingFeat = bonusApFeats.find(f => f.name === feat.name);
      if (matchingFeat) {
        bonusAp += matchingFeat.apBonus;
      }
    });
    
    return bonusAp;
  };
  
  // Update acquisition points whenever character's gear or feats change
  useEffect(() => {
    // Calculate used AP based on tracked item costs
    const usedPoints = Object.values(itemApCosts).reduce((total, cost) => total + cost, 0);
    
    // Base AP is 5, plus any bonus from feats
    const baseAp = 5;
    const bonusAp = calculateBonusApFromFeats();
    
    // Set remaining AP
    setAcquisitionPoints(baseAp + bonusAp - usedPoints);
  }, [character.gear, character.feats, itemApCosts]);

  const handleGoBagSelect = (value: string) => {
    if (value in goBags) {
      setSelectedGoBag(value as GoBagType);
      
      // Clear any existing go-bag items
      const existingGoBagItems = character.gear.filter(item => 
        item.name.includes("Go-Bag:") || goBags[value as GoBagType].items.includes(item.name)
      );
      
      existingGoBagItems.forEach((_, index) => {
        removeGearItem(index);
      });
      
      // Add the selected go-bag as a main item
      addGearItem({
        name: `Go-Bag: ${goBags[value as GoBagType].name}`,
        description: goBags[value as GoBagType].description
      });
      
      // Add each item in the go-bag
      goBags[value as GoBagType].items.forEach(item => {
        addGearItem({
          name: item,
          description: `Part of the ${goBags[value as GoBagType].name}`
        });
      });
      
      toast({
        title: "Go-Bag Selected",
        description: `The ${goBags[value as GoBagType].name} has been added to your inventory.`,
      });
    }
  };

  const handleAddWeapon = (weapon: WeaponItem) => {
    if (acquisitionPoints >= weapon.ap) {
      // Create a unique ID for this item to track its AP cost
      const itemId = `weapon_${weapon.name}_${Date.now()}`;
      
      // Add the gear item
      addGearItem({
        name: weapon.name,
        description: `${weapon.description}${weapon.damage ? ` | Damage: ${weapon.damage}` : ''}${weapon.range ? ` | Range: ${weapon.range}` : ''}`
      });
      
      // Track this item's AP cost
      setItemApCosts(prev => ({
        ...prev,
        [itemId]: weapon.ap
      }));
      
      toast({
        title: "Weapon Added",
        description: `${weapon.name} has been added to your inventory.`,
      });
    } else {
      toast({
        title: "Not Enough Points",
        description: "You don't have enough acquisition points for this weapon.",
        variant: "destructive"
      });
    }
  };

  const handleAddEquipment = (equip: EquipmentItem) => {
    if (acquisitionPoints >= equip.ap) {
      // Create a unique ID for this item to track its AP cost
      const itemId = `equipment_${equip.name}_${Date.now()}`;
      
      // Add the gear item
      addGearItem({
        name: equip.name,
        description: equip.description
      });
      
      // Track this item's AP cost
      setItemApCosts(prev => ({
        ...prev,
        [itemId]: equip.ap
      }));
      
      toast({
        title: "Equipment Added",
        description: `${equip.name} has been added to your inventory.`,
      });
    } else {
      toast({
        title: "Not Enough Points",
        description: "You don't have enough acquisition points for this equipment.",
        variant: "destructive"
      });
    }
  };

  const handleAddCustomGear = () => {
    if (newCustomGear.name && newCustomGear.description) {
      addGearItem({
        name: newCustomGear.name,
        description: newCustomGear.description
      });
      
      setNewCustomGear({ name: '', description: '' });
      
      toast({
        title: "Custom Gear Added",
        description: `${newCustomGear.name} has been added to your inventory.`,
      });
    } else {
      toast({
        title: "Invalid Input",
        description: "Both name and description are required for custom gear.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveGearItem = (index: number) => {
    // Get the item before it's removed
    const item = character.gear[index];
    
    // Check if it's a Go-Bag main entry
    if (item.name.includes("Go-Bag:")) {
      // Find all related go-bag items and remove them
      const goBagType = item.name.split(":")[1].trim();
      
      // Create a list of indices to remove, in reverse order to avoid indexing issues
      const indicesToRemove: number[] = [];
      character.gear.forEach((gearItem, i) => {
        if (gearItem.name.includes("Go-Bag:") || 
            gearItem.description.includes(`Part of the ${goBagType}`)) {
          indicesToRemove.push(i);
        }
      });
      
      // Remove in reverse order to maintain correct indices
      indicesToRemove.sort((a, b) => b - a).forEach(i => {
        removeGearItem(i);
      });
      
      setSelectedGoBag('');
      toast({
        title: "Go-Bag Removed",
        description: "Your Go-Bag and all its contents have been removed.",
      });
      return;
    }
    
    // Find matching AP costs for this item to refund points
    const weaponMatch = weapons.find(w => w.name === item.name);
    const equipMatch = equipment.find(e => e.name === item.name);
    
    // Remove the single item
    removeGearItem(index);
    
    // Find the key in itemApCosts for this item and remove it
    // We're looking for any entries that match this item's name
    const matchingKeys = Object.keys(itemApCosts).filter(key => {
      return (
        (key.startsWith('weapon_') && key.includes(item.name)) || 
        (key.startsWith('equipment_') && key.includes(item.name))
      );
    });
    
    if (matchingKeys.length > 0) {
      // Only remove the first matching key since we're removing one item at a time
      const keyToRemove = matchingKeys[0];
      
      // Create a new AP costs object without this key
      const newApCosts = {...itemApCosts};
      delete newApCosts[keyToRemove];
      
      // Update the AP costs state
      setItemApCosts(newApCosts);
      
      // Inform the user that AP was refunded
      let apRefunded = 0;
      if (weaponMatch) apRefunded = weaponMatch.ap;
      if (equipMatch) apRefunded = equipMatch.ap;
      
      toast({
        title: "Item Removed",
        description: `${item.name} has been removed from your inventory.`,
      });
    } else {
      toast({
        title: "Item Removed",
        description: `${item.name} has been removed from your inventory.`,
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Gear & Equipment</h1>
      
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Acquisition Points</h2>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {acquisitionPoints} AP Remaining
          </Badge>
        </div>
        <p className="text-gray-300 mb-2">
          Use your acquisition points to obtain weapons and equipment. 
          Each character starts with 5 AP and one Go-Bag of choice.
        </p>
        
        {/* AP Bonus from Feats Section */}
        {calculateBonusApFromFeats() > 0 && (
          <div className="mt-3 bg-blue-900/30 p-3 rounded-md">
            <h3 className="text-sm font-semibold text-blue-300 mb-1">Feat Bonuses</h3>
            <div className="space-y-1">
              {character.feats.map((feat, idx) => {
                const bonusFeat = [
                  { name: "Scavenger", apBonus: 2 },
                  { name: "Lucky Find", apBonus: 1 },
                  { name: "Well Equipped", apBonus: 3 }
                ].find(f => f.name === feat.name);
                
                if (bonusFeat) {
                  return (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{bonusFeat.name}</span>
                      <span className="text-green-400">+{bonusFeat.apBonus} AP</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Gear Selection */}
        <div className="col-span-1 md:col-span-2">
          <Accordion 
            type="multiple" 
            value={expandedAccordion} 
            onValueChange={setExpandedAccordion}
            className="mb-6"
          >
            <AccordionItem value="go-bag">
              <AccordionTrigger className="text-lg font-semibold">
                Select a Go-Bag
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-gray-300 mb-4">
                    All heroes start with one of the following go-bags. Items provided within these packs 
                    are commonly mismatched and pretty run down and can exhibit unexpected malfunctions.
                  </p>
                  
                  <Select value={selectedGoBag} onValueChange={handleGoBagSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a Go-Bag type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="survivalist">Survivalist Go-Bag</SelectItem>
                      <SelectItem value="infiltrator">Infiltrator Go-Bag</SelectItem>
                      <SelectItem value="technician">Technician Go-Bag</SelectItem>
                      <SelectItem value="medic">Medic Go-Bag</SelectItem>
                      <SelectItem value="bystander">Bystander Go-Bag</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {selectedGoBag && (
                    <div className="bg-gray-700 p-3 rounded-md mt-3">
                      <h3 className="font-medium mb-2">{goBags[selectedGoBag].name}</h3>
                      <p className="text-gray-300 text-sm mb-2">{goBags[selectedGoBag].description}</p>
                      <h4 className="text-sm font-medium mb-1">Contents:</h4>
                      <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                        {goBags[selectedGoBag].items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="weapons">
              <AccordionTrigger className="text-lg font-semibold">
                Weapons
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-gray-300 mb-4">
                    After Z-Day, practically everyone is armed. Spend AP to acquire weapons for your character.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {weapons.map((weapon, index) => (
                      <Card key={index} className="bg-gray-700 border-gray-600">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex justify-between">
                            <span>{weapon.name}</span>
                            <Badge>{weapon.ap} AP</Badge>
                          </CardTitle>
                          <CardDescription className="text-gray-300">
                            {weapon.category.charAt(0).toUpperCase() + weapon.category.slice(1)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-3 text-sm">
                          <p>{weapon.description}</p>
                          {weapon.damage && <p className="text-amber-400">Damage: {weapon.damage}</p>}
                          {weapon.range && <p className="text-blue-400">Range: {weapon.range}</p>}
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleAddWeapon(weapon)}
                            disabled={acquisitionPoints < weapon.ap}
                          >
                            Add Weapon
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="equipment">
              <AccordionTrigger className="text-lg font-semibold">
                Equipment
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-gray-300 mb-4">
                    In gritty post-apocalyptic settings, equipment often becomes more valuable than weapons.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {equipment.map((equip, index) => (
                      <Card key={index} className="bg-gray-700 border-gray-600">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base flex justify-between">
                            <span>{equip.name}</span>
                            <Badge>{equip.ap} AP</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3 text-sm">
                          <p>{equip.description}</p>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleAddEquipment(equip)}
                            disabled={acquisitionPoints < equip.ap}
                          >
                            Add Equipment
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="custom">
              <AccordionTrigger className="text-lg font-semibold">
                Custom Gear
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-gray-300 mb-4">
                    Add custom gear or equipment that's not listed in the standard options.
                  </p>
                  
                  <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Item Name</label>
                      <Input 
                        value={newCustomGear.name}
                        onChange={e => setNewCustomGear({...newCustomGear, name: e.target.value})}
                        placeholder="Enter item name"
                        className="bg-gray-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-1">Description</label>
                      <Textarea 
                        value={newCustomGear.description}
                        onChange={e => setNewCustomGear({...newCustomGear, description: e.target.value})}
                        placeholder="Describe the item, including any special properties..."
                        className="bg-gray-600"
                        rows={3}
                      />
                    </div>
                    
                    <Button 
                      variant="secondary"
                      onClick={handleAddCustomGear}
                      disabled={!newCustomGear.name || !newCustomGear.description}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Custom Item
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        {/* Right Column - Current Inventory */}
        <div className="col-span-1">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Inventory</h2>
              <Badge variant="secondary">
                {character.gear.length} Items
              </Badge>
            </div>
            
            {character.gear.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <PackageCheck className="h-12 w-12 mb-2" />
                <p>No items in your inventory yet</p>
                <p className="text-sm mt-1">Select a Go-Bag to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {character.gear.map((item, index) => (
                  <div 
                    key={index} 
                    className={`bg-gray-700 p-3 rounded-md ${item.name.includes('Go-Bag:') ? 'border-l-4 border-blue-500' : ''}`}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.name}</h3>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-gray-400 hover:text-red-400"
                        onClick={() => handleRemoveGearItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Important Notes</h2>
        <div className="space-y-2 text-gray-300">
          <p>
            <span className="font-medium text-amber-400">Batteries:</span> Many survival gear items utilize batteries that may run out at inopportune moments.
          </p>
          <p>
            <span className="font-medium text-amber-400">Malfunctions:</span> Equipment sometimes stops working when needed most, especially in high-stress situations.
          </p>
          <p>
            <span className="font-medium text-amber-400">Ammunition:</span> Firearms use ammunition that isn't specifically tracked. When you roll a 1 on a d20 attack roll, you run out of ammunition.
          </p>
        </div>
      </div>
    </div>
  );
}