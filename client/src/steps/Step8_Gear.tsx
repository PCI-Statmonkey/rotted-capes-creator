import { useState, useEffect } from "react";
import { useCharacter } from "@/context/CharacterContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Types
type GoBagType = "survivalist" | "infiltrator" | "technician" | "medic" | "bystander";

interface GoBag {
  name: string;
  description: string;
  items: string[];
}

interface Item {
  name: string;
  description: string;
  ap: number;
}

// Go-Bags
const goBags: Record<GoBagType, GoBag> = {
  survivalist: {
    name: "Survivalist Go-Bag",
    description:
      "Focused on long-term survival with water purification and navigation tools.",
    items: [
      "High Capacity Water Resistant Backpack",
      "Banged up Shake Flashlight",
      "Patched up bivouac Sack",
    ],
  },
  infiltrator: {
    name: "Infiltrator Go-Bag",
    description: "Tactical gear focused on stealth and observation.",
    items: [
      "Water-resistant Tactical Ergo Pack",
      "Night Vision Binoculars",
      "Tactical Holster Vest",
    ],
  },
  technician: {
    name: "Technician Go-Bag",
    description: "Essential tools for repairs and maintenance.",
    items: [
      "Utility Belt",
      "Solar Powered Jump Starter",
      "Multi-Tool",
    ],
  },
  medic: {
    name: "Medic Go-Bag",
    description: "Medical supplies and emergency response equipment.",
    items: [
      "Medical Pack - Tactical Response Pack",
      "Fast fold Litter",
      "Utility Folding knife",
    ],
  },
  bystander: {
    name: "Bystander Go-Bag",
    description: "Basic survival essentials for someone caught unprepared.",
    items: [
      "Water-resistant Backpack",
      "Standard First Aid Kit",
      "Multi-Tool",
    ],
  },
};

// Weapons
const weapons: Item[] = [
  { name: "Revolver", description: "6-round revolver", ap: 1 },
  { name: "Bolt-Action Rifle", description: "5-round rifle", ap: 1 },
  { name: "Baseball Bat", description: "Improvised club", ap: 0 },
];

// Armor
const armors: Item[] = [
  { name: "Tactical Body Armor", description: "Modern ballistic armor", ap: 2 },
  { name: "Reinforced Clothing", description: "Light protective clothing", ap: 1 },
  { name: "Ballistic Vest", description: "Kevlar vest", ap: 1 },
];

// Misc gear
const gear: Item[] = [
  { name: "First Aid Kit", description: "Basic medical supplies", ap: 1 },
  { name: "Flashlight", description: "Durable flashlight", ap: 1 },
  { name: "Rope", description: "50ft nylon rope", ap: 1 },
];

// Bonus AP from feats
const bonusApFeats = [
  { name: "Scavenger", apBonus: 2 },
  { name: "Lucky Find", apBonus: 1 },
  { name: "Well Equipped", apBonus: 3 },
];

export default function Step8_Gear() {
  const { character, addGearItem, removeGearItem } = useCharacter();

  const [currentTab, setCurrentTab] = useState("starting");
  const [selectedGoBag, setSelectedGoBag] = useState<GoBagType | "">("");
  const [startingWeapons, setStartingWeapons] = useState<string[]>([]);
  const [purchased, setPurchased] = useState<Record<string, number>>({});

  const calculateBonusAp = () => {
    return character.feats.reduce((acc, feat) => {
      const match = bonusApFeats.find((b) => b.name === feat.name);
      return acc + (match ? match.apBonus : 0);
    }, 0);
  };

  const baseAp = 5;
  const bonusAp = calculateBonusAp();
  const spentAp = Object.values(purchased).reduce((a, b) => a + b, 0);
  const remainingAp = baseAp + bonusAp - spentAp;

  // -------- Starting Gear Handling --------
  const toggleGoBag = (type: GoBagType) => {
    if (selectedGoBag === type) {
      // remove existing go-bag items
      const itemsToRemove = character.gear.filter((g) => g.starting && g.name.includes(goBags[type].name));
      itemsToRemove.forEach((_, idx) => removeGearItem(idx));
      setSelectedGoBag("");
    } else {
      // clear previous
      character.gear.forEach((item, idx) => {
        if (item.starting && item.name.includes("Go-Bag:")) removeGearItem(idx);
      });
      // add new bag
      addGearItem({ name: `Go-Bag: ${goBags[type].name}`, description: goBags[type].description, starting: true });
      goBags[type].items.forEach((it) => addGearItem({ name: it, description: `Part of the ${goBags[type].name}`, starting: true }));
      setSelectedGoBag(type);
    }
  };

  const toggleStartingWeapon = (name: string) => {
    const exists = startingWeapons.includes(name);
    if (exists) {
      const index = character.gear.findIndex((g) => g.starting && g.name === name);
      if (index !== -1) removeGearItem(index);
      setStartingWeapons(startingWeapons.filter((w) => w !== name));
    } else {
      const weapon = weapons.find((w) => w.name === name);
      if (weapon) {
        addGearItem({ name: weapon.name, description: weapon.description, starting: true });
        setStartingWeapons([...startingWeapons, name]);
      }
    }
  };

  // -------- Purchase Handling --------
  const togglePurchase = (collection: Item[], name: string) => {
    const item = collection.find((i) => i.name === name);
    if (!item) return;

    if (purchased[name]) {
      const index = character.gear.findIndex((g) => g.name === name && !g.starting);
      if (index !== -1) removeGearItem(index);
      const newP = { ...purchased };
      delete newP[name];
      setPurchased(newP);
    } else if (remainingAp >= item.ap) {
      addGearItem({ name: item.name, description: item.description, ap: item.ap });
      setPurchased({ ...purchased, [name]: item.ap });
    }
  };

  const inventoryItems = character.gear;

  const handleRemoveInventory = (index: number) => {
    const item = inventoryItems[index];
    removeGearItem(index);
    if (item && item.ap) {
      const newP = { ...purchased };
      delete newP[item.name];
      setPurchased(newP);
    }
    if (item && item.starting) {
      if (item.name.startsWith("Go-Bag:")) {
        setSelectedGoBag("");
      } else {
        setStartingWeapons((prev) => prev.filter((w) => w !== item.name));
      }
    }
  };

  return (
    <div className="bg-panel p-6 rounded-2xl comic-border halftone-bg">
      <h2 className="text-2xl font-display text-red-500 mb-4">Step 8: Gear</h2>
      <div className="text-sm text-white mb-2">
        Points Remaining: <span className="text-accent font-bold">{remainingAp}</span>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="starting">Starting Gear</TabsTrigger>
          <TabsTrigger value="weapons">Weapons</TabsTrigger>
          <TabsTrigger value="armor">Armor</TabsTrigger>
          <TabsTrigger value="gear">Gear</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        {/* Starting Gear */}
        <TabsContent value="starting">
          <h3 className="text-white text-md mb-2">Go-Bags</h3>
          {Object.entries(goBags).map(([key, bag]) => (
            <label key={key} className="flex items-start space-x-2 text-white">
              <input
                type="checkbox"
                checked={selectedGoBag === key}
                onChange={() => toggleGoBag(key as GoBagType)}
              />
              <span>{bag.name}</span>
            </label>
          ))}
          {selectedGoBag && (
            <div className="mt-2 bg-gray-700 p-3 rounded text-sm text-white">
              <p className="mb-1 font-semibold">{goBags[selectedGoBag].name}</p>
              <p>{goBags[selectedGoBag].description}</p>
            </div>
          )}

          <h3 className="text-white text-md mt-4 mb-2">Starting Weapons</h3>
          {weapons.map((w) => (
            <label key={w.name} className="flex items-start space-x-2 text-white">
              <input
                type="checkbox"
                checked={startingWeapons.includes(w.name)}
                onChange={() => toggleStartingWeapon(w.name)}
              />
              <span>
                {w.name} <span className="text-gray-400">- {w.description}</span>
              </span>
            </label>
          ))}
        </TabsContent>

        {/* Weapons */}
        <TabsContent value="weapons">
          <h3 className="text-white text-md mb-2">Weapons</h3>
          {weapons.map((w) => (
            <label key={w.name} className="flex items-start space-x-2 text-white">
              <input
                type="checkbox"
                checked={!!purchased[w.name]}
                onChange={() => togglePurchase(weapons, w.name)}
              />
              <span>
                {w.name} ({w.ap} AP) <span className="text-gray-400">- {w.description}</span>
              </span>
            </label>
          ))}
        </TabsContent>

        {/* Armor */}
        <TabsContent value="armor">
          <h3 className="text-white text-md mb-2">Armor</h3>
          {armors.map((a) => (
            <label key={a.name} className="flex items-start space-x-2 text-white">
              <input
                type="checkbox"
                checked={!!purchased[a.name]}
                onChange={() => togglePurchase(armors, a.name)}
              />
              <span>
                {a.name} ({a.ap} AP) <span className="text-gray-400">- {a.description}</span>
              </span>
            </label>
          ))}
        </TabsContent>

        {/* Gear */}
        <TabsContent value="gear">
          <h3 className="text-white text-md mb-2">Gear</h3>
          {gear.map((g) => (
            <label key={g.name} className="flex items-start space-x-2 text-white">
              <input
                type="checkbox"
                checked={!!purchased[g.name]}
                onChange={() => togglePurchase(gear, g.name)}
              />
              <span>
                {g.name} ({g.ap} AP) <span className="text-gray-400">- {g.description}</span>
              </span>
            </label>
          ))}
        </TabsContent>

        {/* Inventory */}
        <TabsContent value="inventory">
          <h3 className="text-white text-md mb-2">Inventory</h3>
          {inventoryItems.length === 0 ? (
            <p className="text-gray-400">No items selected</p>
          ) : (
            <div className="space-y-2">
              {inventoryItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border text-white flex justify-between ${item.starting ? "bg-gray-700" : "bg-gray-800"}`}
                >
                  <span>
                    {item.name}
                    {item.ap ? (
                      <Badge variant="secondary" className="ml-2 text-xs">{item.ap} AP</Badge>
                    ) : null}
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => handleRemoveInventory(idx)}>
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

