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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getGameContent } from "@/lib/api";

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
  examples?: string[];
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
      "3 Liter Hand Powered UV Water Purifier (8,000 water treatments)",
      "EMT Medical Field First Aid kit (4 uses left)",
      "Compass OR GPS",
      "Mess Kit Ration (7 days worth)",
      "Flare gun and 4 flares",
      "Collapsible Fishing Rod",
    ],
  },
  infiltrator: {
    name: "Infiltrator Go-Bag",
    description:
      "Tactical gear focused on stealth, observation, and combat operations.",
    items: [
      "Water-resistant Tactical Ergo Pack",
      "Night scope and scope mount OR Laser sight and mount OR Pocket Lock Pick Set",
      "Water Resistant Night Vision Binoculars",
      "Tactical Holster Vest OR Tactical Sheath Utility Belt",
      "1 clip/magazine of ammo OR 2 Hand Grenades",
      "Climbing Kit",
      "Gas Mask",
      "2- Throat communicators with 1- 2-way radio/walkie-talkie",
      "Well-worn leather Tactical gloves",
    ],
  },
  technician: {
    name: "Technician Go-Bag",
    description:
      "Essential tools for repairs, electrical work, and mechanical maintenance.",
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
      "Old phone with 32GB of movies, music and apps",
    ],
  },
  medic: {
    name: "Medic Go-Bag",
    description:
      "Medical supplies and emergency response equipment for treating injuries.",
    items: [
      "Water-resistant High Capacity Duffle",
      "Medical Pack - Tactical Response Pack",
      "Fast fold Litter",
      "Flare gun and 5 flares",
      "3- Emergency Survival Food Ration Packs",
      "1 Liter Hand Powered UV Water Purifier (8,000 water treatments)",
      "Climbers Kit",
      "4- 12-hour Light sticks",
      "Utility Folding knife",
    ],
  },
  bystander: {
    name: "Bystander Go-Bag",
    description:
      "Basic survival essentials for someone caught unprepared.",
    items: [
      "Water-resistant Backpack",
      "7- Emergency Survival Food Ration Packs",
      "3 Liter Hand Powered UV Water Purifier (8,000 water treatments)",
      "Compass OR GPS",
      "Standard First Aid Kit",
      "Bivouac Sack",
      "2- 12-hour Light sticks",
      "Climbers Kit",
      "Multi-Tool",
    ],
  },
};

// Loaded gear lists

const equipmentCategories = [
  "equipment",
  "optics",
  "tacticalAccessory",
  "tacticalSight",
];


// Bonus AP from feats based on the TTRPG rules
const bonusApFeats = [
  // Start each issue with 6 AP worth of gear
  { name: "Exceptional Scavenger", apBonus: 6 },
  // Start each issue with 4 AP worth of equipment
  { name: "I've Done Alright for Myself", apBonus: 4 },
];

export default function Step8_Gear() {
  const { character, addGearItem, removeGearItem } = useCharacter();

  const [currentTab, setCurrentTab] = useState("goBag");
  const [selectedGoBag, setSelectedGoBag] = useState<GoBagType | "">("");
  const [hoveredGoBag, setHoveredGoBag] = useState<GoBagType | "">("");
  const [rangedWeapons, setRangedWeapons] = useState<Item[]>([]);
  const [meleeWeapons, setMeleeWeapons] = useState<Item[]>([]);
  const [otherWeapons, setOtherWeapons] = useState<Item[]>([]);
  const [armors, setArmors] = useState<Item[]>([]);
  const [gearItems, setGearItems] = useState<Item[]>([]);
  const [purchased, setPurchased] = useState<Record<string, number>>({});
  const [freeRangedWeapon, setFreeRangedWeapon] = useState<string>("");
  const [freeMeleeWeapon, setFreeMeleeWeapon] = useState<string>("");
  const [selectedMeleeExamples, setSelectedMeleeExamples] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadGear() {
      try {
        const all = await getGameContent('gear');
        const mapItem = (it: any): Item => ({
          name: it.name,
          description: it.description ?? '',
          ap: it.ap ?? it.costAP ?? 0,
          examples: it.examples ?? [],
        });
        const ranged = all
          .filter((g: any) => ['firearms', 'archaicWeapons'].includes(g.category))
          .map(mapItem);
        setRangedWeapons(ranged);

        const melee = all
          .filter((g: any) => g.category === 'meleeWeapons')
          .map(mapItem);
        setMeleeWeapons(melee);
        setSelectedMeleeExamples(
          melee.reduce<Record<string, string>>((acc, m) => {
            acc[m.name] = m.examples && m.examples.length > 0 ? m.examples[0] : m.name;
            return acc;
          }, {})
        );

        setOtherWeapons(
          all.filter((g: any) => g.category === 'otherModernWeapons').map(mapItem)
        );

        setArmors(all.filter((g: any) => g.category === 'armor').map(mapItem));
        setGearItems(
          all
            .filter((g: any) => equipmentCategories.includes(g.category))
            .map(mapItem)
        );
      } catch (e) {
        console.error('Failed to load gear', e);
      }
    }
    loadGear();
  }, []);

  const calculateBonusAp = () => {
    return character.feats.reduce((acc, feat) => {
      const match = bonusApFeats.find((b) => b.name === feat.name);
      return acc + (match ? match.apBonus : 0);
    }, 0);
  };

  // Determine starting AP based on trained skills
  const calculateBaseAp = () => {
    const hasScavenge = character.skills.some(
      (s) => s.name.toLowerCase() === "scavenge" && (s.trained || s.ranks > 0)
    );
    const hasUrban = character.skills.some(
      (s) => s.name.toLowerCase() === "urban survival" && (s.trained || s.ranks > 0)
    );
    if (hasScavenge && hasUrban) return 6;
    if (hasScavenge || hasUrban) return 3;
    return 0;
  };

  const baseAp = calculateBaseAp();
  const bonusAp = calculateBonusAp();
  const spentAp = Object.values(purchased).reduce((a, b) => a + b, 0);
  const remainingAp = baseAp + bonusAp - spentAp;

  // -------- Starting Gear Handling --------
  const toggleGoBag = (type: GoBagType) => {
    if (selectedGoBag === type) {
      // remove existing go-bag items
      const indices: number[] = [];
      character.gear.forEach((g, idx) => {
        if (
          g.starting &&
          (g.name === `Go-Bag: ${goBags[type].name}` || g.description.includes(goBags[type].name))
        ) {
          indices.push(idx);
        }
      });
      indices
        .sort((a, b) => b - a)
        .forEach((i) => removeGearItem(i));
      setSelectedGoBag("");
    } else {
      // clear previous bag and its items
      const indices: number[] = [];
      character.gear.forEach((item, idx) => {
        if (item.starting && item.name.startsWith("Go-Bag:")) indices.push(idx);
        if (item.starting && item.description.includes("Go-Bag")) indices.push(idx);
      });
      Array.from(new Set(indices))
        .sort((a, b) => b - a)
        .forEach((i) => removeGearItem(i));

      // add new bag
      addGearItem({
        name: `Go-Bag: ${goBags[type].name}`,
        description: goBags[type].description,
        starting: true,
      });
      goBags[type].items.forEach((it) =>
        addGearItem({ name: it, description: `Part of the ${goBags[type].name}`, starting: true })
      );
      setSelectedGoBag(type);
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

  const toggleRanged = (name: string) => {
    const item = rangedWeapons.find((i) => i.name === name);
    if (!item) return;

    if (freeRangedWeapon === name) {
      const idx = character.gear.findIndex((g) => g.description === name && g.starting);
      if (idx !== -1) removeGearItem(idx);
      setFreeRangedWeapon("");
    } else if (purchased[name]) {
      const idx = character.gear.findIndex((g) => g.description === name && !g.starting);
      if (idx !== -1) removeGearItem(idx);
      const newP = { ...purchased };
      delete newP[name];
      setPurchased(newP);
    } else if (!freeRangedWeapon) {
      addGearItem({ name: name, description: name, starting: true });
      setFreeRangedWeapon(name);
    } else if (remainingAp >= item.ap) {
      addGearItem({ name: name, description: name, ap: item.ap });
      setPurchased({ ...purchased, [name]: item.ap });
    }
  };

  const toggleMelee = (name: string) => {
    const item = meleeWeapons.find((i) => i.name === name);
    if (!item) return;
    const example = selectedMeleeExamples[name] || name;

    if (freeMeleeWeapon === name) {
      const idx = character.gear.findIndex((g) => g.description === name && g.starting);
      if (idx !== -1) removeGearItem(idx);
      setFreeMeleeWeapon("");
    } else if (purchased[name]) {
      const idx = character.gear.findIndex((g) => g.description === name && !g.starting);
      if (idx !== -1) removeGearItem(idx);
      const newP = { ...purchased };
      delete newP[name];
      setPurchased(newP);
    } else if (!freeMeleeWeapon) {
      addGearItem({ name: example, description: name, starting: true });
      setFreeMeleeWeapon(name);
    } else if (remainingAp >= item.ap) {
      addGearItem({ name: example, description: name, ap: item.ap });
      setPurchased({ ...purchased, [name]: item.ap });
    }
  };

  const inventoryItems = character.gear;

  const handleRemoveInventory = (index: number) => {
    const item = inventoryItems[index];
    removeGearItem(index);
    if (item && item.ap) {
      let key = item.name;
      if (
        item.description &&
        (meleeWeapons.find((m) => m.name === item.description) ||
          rangedWeapons.find((r) => r.name === item.description))
      ) {
        key = item.description;
      }
      const newP = { ...purchased };
      delete newP[key];
      setPurchased(newP);
    }
    if (item && item.starting) {
      if (item.name.startsWith("Go-Bag:")) {
        setSelectedGoBag("");
      }
      if (item.description && meleeWeapons.find((m) => m.name === item.description)) {
        if (freeMeleeWeapon === item.description) setFreeMeleeWeapon("");
      }
      if (item.description && rangedWeapons.find((r) => r.name === item.description)) {
        if (freeRangedWeapon === item.description) setFreeRangedWeapon("");
      }
    }
  };

  return (
    <div className="bg-panel p-6 rounded-2xl comic-border halftone-bg font-comic-light">
      <h2 className="text-2xl font-display text-red-500 mb-4">Step 8: Gear</h2>
      <div className="text-sm text-white mb-2">
        Points Remaining: <span className="text-accent font-bold">{remainingAp}</span>
      </div>
      <p className="text-xs text-gray-300 mb-4">
        You may select one ranged weapon and one melee weapon for free along with a Go-Bag.
      </p>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="mb-4 flex flex-wrap gap-2">
          <TabsTrigger value="goBag">Go-Bag</TabsTrigger>
          <TabsTrigger value="ranged">Ranged Weapons</TabsTrigger>
          <TabsTrigger value="melee">Melee Weapons</TabsTrigger>
          <TabsTrigger value="other">Other Weapons</TabsTrigger>
          <TabsTrigger value="armor">Armor</TabsTrigger>
          <TabsTrigger value="gear">Gear</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        {/* Go-Bag */}
        <TabsContent value="goBag">
          <div className="flex gap-4">
            <div className="w-1/2 space-y-2">
              <h3 className="text-white text-md mb-2">Go-Bags</h3>
              {Object.entries(goBags).map(([key, bag]) => (
                <label
                  key={key}
                  className="flex items-start space-x-2 text-white"
                  onMouseEnter={() => setHoveredGoBag(key as GoBagType)}
                  onMouseLeave={() => setHoveredGoBag("")}
                >
                  <input
                    type="checkbox"
                    checked={selectedGoBag === key}
                    onChange={() => toggleGoBag(key as GoBagType)}
                  />
                  <span className="text-lg font-semibold">{bag.name}</span>
                </label>
              ))}
            </div>
            <div className="w-1/2">
              {hoveredGoBag && (
                <div className="bg-gray-700 p-3 rounded text-sm text-white">
                  <p className="mb-1 font-semibold">{goBags[hoveredGoBag].name}</p>
                  <p className="font-comic-light text-gray-300 mb-2">
                    {goBags[hoveredGoBag].description}
                  </p>
                  <ul className="list-disc pl-4 text-gray-300 font-comic-light">
                    {goBags[hoveredGoBag].items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

        </TabsContent>

        {/* Ranged Weapons */}
        <TabsContent value="ranged">
          <h3 className="text-white text-md mb-2">Ranged Weapons</h3>
          {rangedWeapons.map((w) => (
            <label key={w.name} className="flex items-start space-x-2 text-white">
              <input
                type="checkbox"
                checked={freeRangedWeapon === w.name || !!purchased[w.name]}
                onChange={() => toggleRanged(w.name)}
              />
              <span>
                {w.name} ({w.ap} AP)
              </span>
            </label>
          ))}
        </TabsContent>

        {/* Melee Weapons */}
        <TabsContent value="melee">
          <h3 className="text-white text-md mb-2">Melee Weapons</h3>
          {meleeWeapons.map((m) => (
            <div key={m.name} className="flex items-center space-x-2 text-white mb-1">
              <input
                type="checkbox"
                checked={freeMeleeWeapon === m.name || !!purchased[m.name]}
                onChange={() => toggleMelee(m.name)}
              />
              <span>
                {m.name} ({m.ap} AP)
              </span>
              {m.examples && m.examples.length > 0 && (
                <Select
                  value={selectedMeleeExamples[m.name]}
                  onValueChange={(val) =>
                    setSelectedMeleeExamples((prev) => ({ ...prev, [m.name]: val }))
                  }
                >
                  <SelectTrigger className="bg-gray-700 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {m.examples.map((ex) => (
                      <SelectItem key={ex} value={ex}>
                        {ex}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </TabsContent>

        {/* Other Weapons */}
        <TabsContent value="other">
          <h3 className="text-white text-md mb-2">Other Weapons</h3>
          {otherWeapons.map((w) => (
            <label key={w.name} className="flex items-start space-x-2 text-white">
              <input
                type="checkbox"
                checked={!!purchased[w.name]}
                onChange={() => togglePurchase(otherWeapons, w.name)}
              />
              <span>
                {w.name} ({w.ap} AP)
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
                {a.name} ({a.ap} AP)
              </span>
            </label>
          ))}
        </TabsContent>

        {/* Gear */}
        <TabsContent value="gear">
          <h3 className="text-white text-md mb-2">Gear</h3>
          {gearItems.map((g) => (
            <label key={g.name} className="flex items-start space-x-2 text-white">
              <input
                type="checkbox"
                checked={!!purchased[g.name]}
                onChange={() => togglePurchase(gearItems, g.name)}
              />
              <span>
                {g.name} ({g.ap} AP)
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

