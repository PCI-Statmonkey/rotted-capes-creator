import { useState, useEffect } from "react";
import { useCharacter } from "@/context/CharacterContext";
import { useCharacterBuilder } from "@/lib/Stores/characterBuilder";
import useCachedGameContent from "@/hooks/useCachedGameContent";
import { Battery } from "lucide-react";
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

interface GoBagItem {
  name: string;
  batteryPowered?: boolean;
}

interface GoBag {
  name: string;
  description: string;
  items: GoBagItem[];
}

interface Item {
  name: string;
  description: string;
  ap: number;
  examples?: string[];
  ammoType?: string[];
  batteryPowered?: boolean;
}

// Go-Bags
const goBags: Record<GoBagType, GoBag> = {
  survivalist: {
    name: "Survivalist Go-Bag",
    description:
      "Focused on long-term survival with water purification and navigation tools.",
    items: [
      { name: "High Capacity Water Resistant Backpack" },
      { name: "Banged up Shake Flashlight" },
      { name: "Patched up bivouac Sack" },
      { name: "3 Liter Hand Powered UV Water Purifier (8,000 water treatments)" },
      { name: "EMT Medical Field First Aid kit (4 uses left)" },
      { name: "Compass OR GPS", batteryPowered: true },
      { name: "Mess Kit Ration (7 days worth)" },
      { name: "Flare gun and 4 flares" },
      { name: "Collapsible Fishing Rod" },
    ],
  },
  infiltrator: {
    name: "Infiltrator Go-Bag",
    description:
      "Tactical gear focused on stealth, observation, and combat operations.",
    items: [
      { name: "Water-resistant Tactical Ergo Pack" },
      { name: "Night scope and scope mount OR Laser sight and mount OR Pocket Lock Pick Set" },
      { name: "Water Resistant Night Vision Binoculars" },
      { name: "Tactical Holster Vest OR Tactical Sheath Utility Belt" },
      { name: "1 clip/magazine of ammo OR 2 Hand Grenades" },
      { name: "Climbing Kit" },
      { name: "Gas Mask" },
      { name: "2- Throat communicators with 1- 2-way radio/walkie-talkie", batteryPowered: true },
      { name: "Well-worn leather Tactical gloves" },
    ],
  },
  technician: {
    name: "Technician Go-Bag",
    description:
      "Essential tools for repairs, electrical work, and mechanical maintenance.",
    items: [
      { name: "Utility Belt" },
      { name: "Banged up Shake Flashlight" },
      { name: "2-way radio/walkie-talkie", batteryPowered: true },
      { name: "Solar Powered Jump Starter" },
      { name: "100-Piece Mechanics Tool Kit missing 25 pieces OR 100-Piece Home Essential Tool Kit missing 25 pieces" },
      { name: "Workman Gloves" },
      { name: "Multi-Tool" },
      { name: "Tool Belt" },
      { name: "Small solar power charger with battery", batteryPowered: true },
      { name: "Old phone with 32GB of movies, music and apps", batteryPowered: true },
    ],
  },
  medic: {
    name: "Medic Go-Bag",
    description:
      "Medical supplies and emergency response equipment for treating injuries.",
    items: [
      { name: "Water-resistant High Capacity Duffle" },
      { name: "Medical Pack - Tactical Response Pack" },
      { name: "Fast fold Litter" },
      { name: "Flare gun and 5 flares" },
      { name: "3- Emergency Survival Food Ration Packs" },
      { name: "1 Liter Hand Powered UV Water Purifier (8,000 water treatments)" },
      { name: "Climbers Kit" },
      { name: "4- 12-hour Light sticks" },
      { name: "Utility Folding knife" },
    ],
  },
  bystander: {
    name: "Bystander Go-Bag",
    description:
      "Basic survival essentials for someone caught unprepared.",
    items: [
      { name: "Water-resistant Backpack" },
      { name: "7- Emergency Survival Food Ration Packs" },
      { name: "3 Liter Hand Powered UV Water Purifier (8,000 water treatments)" },
      { name: "Compass OR GPS", batteryPowered: true },
      { name: "Standard First Aid Kit" },
      { name: "Bivouac Sack" },
      { name: "2- 12-hour Light sticks" },
      { name: "Climbers Kit" },
      { name: "Multi-Tool" },
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
  const { selectedSkillSets, startingSkills, selectedSkills } = useCharacterBuilder();
  const { data: skillSets } = useCachedGameContent<any>('skill-sets');

  const [currentTab, setCurrentTab] = useState("ranged");
  const [selectedGoBag, setSelectedGoBag] = useState<GoBagType | "">("");
  const [rangedWeapons, setRangedWeapons] = useState<Item[]>([]);
  const [firearms, setFirearms] = useState<Item[]>([]);
  const [archaicWeapons, setArchaicWeapons] = useState<Item[]>([]);
  const [meleeWeapons, setMeleeWeapons] = useState<Item[]>([]);
  const [otherWeapons, setOtherWeapons] = useState<Item[]>([]);
  const [armors, setArmors] = useState<Item[]>([]);
  const [gearItems, setGearItems] = useState<Record<string, Item[]>>({});
  const [purchased, setPurchased] = useState<Record<string, number>>({});
  const [freeRangedWeapon, setFreeRangedWeapon] = useState<string>("");
  const [freeMeleeWeapon, setFreeMeleeWeapon] = useState<string>("");
  const [selectedMeleeExamples, setSelectedMeleeExamples] = useState<Record<string, string>>({});
  const [selectedAmmoTypes, setSelectedAmmoTypes] = useState<Record<string, string>>({});

  const handleGoBagChange = (type: GoBagType | "") => {
    if (!type) {
      // remove any existing go-bag
      const indices: number[] = [];
      character.gear.forEach((item, idx) => {
        if (item.starting && (item.name.startsWith("Go-Bag:") || item.description.includes("Go-Bag"))) {
          indices.push(idx);
        }
      });
      indices
        .sort((a, b) => b - a)
        .forEach((i) => removeGearItem(i));
      setSelectedGoBag("");
      return;
    }

    // clear previous bag and items
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
      addGearItem({
        name: it.name,
        description: `Part of the ${goBags[type].name}`,
        starting: true,
        batteryPowered: it.batteryPowered,
      })
    );
    setSelectedGoBag(type);
  };

  const handleRangedSelect = (name: string) => {
    // remove old selection
    if (freeRangedWeapon) {
      const idx = character.gear.findIndex(
        (g) => g.description === freeRangedWeapon && g.starting
      );
      if (idx !== -1) removeGearItem(idx);
    }

    if (!name) {
      setFreeRangedWeapon("");
      return;
    }

    const isFirearm = firearms.some((f) => f.name === name);
    const item = (isFirearm ? firearms : archaicWeapons).find((i) => i.name === name);
    if (!item) return;

    const ammo = isFirearm
      ? selectedAmmoTypes[name] || item.ammoType?.[0] || "varies"
      : undefined;
    if (isFirearm) {
      setSelectedAmmoTypes((prev) => ({
        ...prev,
        [name]: ammo!,
      }));
    }

    const displayName = isFirearm ? `${name} (${ammo})` : name;
    addGearItem({
      name: displayName,
      description: name,
      starting: true,
      batteryPowered: item.batteryPowered,
    });
    setFreeRangedWeapon(name);
  };

  const handleMeleeSelect = (name: string) => {
    // remove old selection
    if (freeMeleeWeapon) {
      const idx = character.gear.findIndex(
        (g) => g.description === freeMeleeWeapon && g.starting
      );
      if (idx !== -1) removeGearItem(idx);
    }

    if (!name) {
      setFreeMeleeWeapon("");
      return;
    }

    const item = meleeWeapons.find((i) => i.name === name);
    if (!item) return;

    const example =
      selectedMeleeExamples[name] || item.examples?.[0] || name;
    setSelectedMeleeExamples((prev) => ({
      ...prev,
      [name]: example,
    }));

    addGearItem({
      name: example,
      description: name,
      starting: true,
      batteryPowered: item.batteryPowered,
    });
    setFreeMeleeWeapon(name);
  };

  const handleMeleeExampleChange = (name: string, example: string) => {
    setSelectedMeleeExamples((prev) => ({ ...prev, [name]: example }));
    const idx = character.gear.findIndex((g) => g.description === name);
    if (idx !== -1) {
      const starting = character.gear[idx].starting;
      const item = meleeWeapons.find((m) => m.name === name);
      removeGearItem(idx);
      addGearItem({
        name: example,
        description: name,
        starting,
        ap: starting ? undefined : item?.ap,
        batteryPowered: item?.batteryPowered,
      });
    }
  };

  useEffect(() => {
    async function loadGear() {
      try {
        const all = await getGameContent('gear');
        const mapItem = (it: any): Item => ({
          name: it.name,
          description: it.description ?? '',
          ap: it.ap ?? it.costAP ?? 0,
          examples: it.examples ?? [],
          batteryPowered: it.batteryPowered ?? false,
        });
        const firearmsList = all
          .filter((g: any) => g.category === 'firearms')
          .map((it: any) => ({ ...mapItem(it), ammoType: it.ammo_type ?? [] }));
        setFirearms(firearmsList);

        const archaic = all
          .filter((g: any) => g.category === 'archaicWeapons')
          .map(mapItem);
        setArchaicWeapons(archaic);

        setRangedWeapons([...firearmsList, ...archaic]);

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

        setSelectedAmmoTypes(
          firearmsList.reduce<Record<string, string>>((acc, f) => {
            acc[f.name] = f.ammoType && f.ammoType.length > 0 ? f.ammoType[0] : 'varies';
            return acc;
          }, {})
        );

        setOtherWeapons(
          all.filter((g: any) => g.category === 'otherModernWeapons').map(mapItem)
        );

        setArmors(all.filter((g: any) => g.category === 'armor').map(mapItem));

        const gearMap: Record<string, Item[]> = {};
        equipmentCategories.forEach((cat) => {
          gearMap[cat] = all
            .filter((g: any) => g.category === cat)
            .map(mapItem);
        });
        setGearItems(gearMap);
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

  // Helper to check if a skill is trained, falling back to builder state
  const hasTrainedSkill = (name: string) => {
    const lower = name.toLowerCase();
    if (character.skills.some((s) => s.name.toLowerCase() === lower && s.trained)) {
      return true;
    }

    const setSkills = selectedSkillSets.flatMap((setEntry) => {
      const setName = typeof setEntry === 'string' ? setEntry : setEntry.name;
      const found = skillSets.find((s) => s.name === setName);
      return (
        found?.skills?.map((sk: any) => (typeof sk === 'string' ? sk : sk.name)) || []
      );
    });

    const builderSkills = [
      ...startingSkills,
      ...selectedSkills.map((s) => s.name),
      ...setSkills,
    ];

    return builderSkills.map((s) => s.toLowerCase()).includes(lower);
  };

  // Determine starting AP based on trained skills
  const calculateBaseAp = () => {
    const scavengeEntry = character.skills.find(
      (s) => s.name.toLowerCase() === 'scavenge' && s.trained
    );
    const urbanEntry = character.skills.find(
      (s) => s.name.toLowerCase() === 'urban survival' && s.trained
    );

    const scavenge = hasTrainedSkill('scavenge');
    const urban = hasTrainedSkill('urban survival');

    const scavengeExpert = scavengeEntry && scavengeEntry.ranks >= 6;
    const urbanExpert = urbanEntry && urbanEntry.ranks >= 6;

    if ((scavenge && urban) || scavengeExpert || urbanExpert) return 6;
    if (scavenge || urban) return 3;
    return 0;
  };

  const baseAp = calculateBaseAp();
  const bonusAp = calculateBonusAp();
  const spentAp = Object.values(purchased).reduce((a, b) => a + b, 0);
  const remainingAp = baseAp + bonusAp - spentAp;

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
      addGearItem({ name: item.name, description: item.description, ap: item.ap, batteryPowered: item.batteryPowered });
      setPurchased({ ...purchased, [name]: item.ap });
    }
  };

  const toggleRanged = (name: string, isFirearm = false) => {
    const collection = isFirearm ? firearms : archaicWeapons;
    const item = collection.find((i) => i.name === name);
    if (!item) return;

    if (isFirearm && !selectedAmmoTypes[name]) {
      setSelectedAmmoTypes((prev) => ({
        ...prev,
        [name]: item.ammoType?.[0] || "varies",
      }));
    }

    const displayName = isFirearm
      ? `${name} (${selectedAmmoTypes[name] || "varies"})`
      : name;

    if (purchased[name]) {
      const idx = character.gear.findIndex(
        (g) => g.description === name && !g.starting
      );
      if (idx !== -1) removeGearItem(idx);
      const newP = { ...purchased };
      delete newP[name];
      setPurchased(newP);
    } else if (remainingAp >= item.ap) {
      addGearItem({
        name: displayName,
        description: name,
        ap: item.ap,
        batteryPowered: item.batteryPowered,
      });
      setPurchased({ ...purchased, [name]: item.ap });
    }
  };

  const handleAmmoChange = (name: string, ammo: string) => {
    setSelectedAmmoTypes((prev) => ({ ...prev, [name]: ammo }));
    const idx = character.gear.findIndex((g) => g.description === name);
    if (idx !== -1) {
      const starting = character.gear[idx].starting;
      const isFirearm = firearms.some((f) => f.name === name);
      const item = (isFirearm ? firearms : archaicWeapons).find(
        (i) => i.name === name
      );
      if (item) {
        removeGearItem(idx);
        addGearItem({
          name: `${name} (${ammo})`,
          description: name,
          starting,
          ap: starting ? undefined : item.ap,
          batteryPowered: item.batteryPowered,
        });
      }
    }
  };

  const toggleMelee = (name: string) => {
    const item = meleeWeapons.find((i) => i.name === name);
    if (!item) return;
    const example = selectedMeleeExamples[name] || item.examples?.[0] || name;

    if (purchased[name]) {
      const idx = character.gear.findIndex(
        (g) => g.description === name && !g.starting
      );
      if (idx !== -1) removeGearItem(idx);
      const newP = { ...purchased };
      delete newP[name];
      setPurchased(newP);
    } else if (remainingAp >= item.ap) {
      setSelectedMeleeExamples((prev) => ({
        ...prev,
        [name]: example,
      }));
      addGearItem({
        name: example,
        description: name,
        ap: item.ap,
        batteryPowered: item.batteryPowered,
      });
      setPurchased({ ...purchased, [name]: item.ap });
    }
  };

  const inventoryItems = character.gear;
  const hasBatteryItems = inventoryItems.some((it) => it.batteryPowered);

  const selectedFirearm = firearms.find((f) => f.name === freeRangedWeapon);
  const selectedMelee = meleeWeapons.find((m) => m.name === freeMeleeWeapon);

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
      {hasBatteryItems && (
        <p className="text-xs text-yellow-400 mb-2 flex items-center">
          <Battery className="w-4 h-4 mr-1" /> Battery-powered items may deplete.
        </p>
      )}
      <p className="text-xs text-gray-300 mb-4">
        You may select one ranged weapon and one melee weapon for free along with a Go-Bag.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-white text-sm mb-1 block">Go-Bag</label>
          <Select value={selectedGoBag} onValueChange={(val) => handleGoBagChange(val as GoBagType | "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a Go-Bag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {Object.entries(goBags).map(([key, bag]) => (
                <SelectItem key={key} value={key}>
                  {bag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedGoBag && (
            <div className="mt-2 text-xs text-gray-300 font-comic-light">
              <p className="mb-1">{goBags[selectedGoBag].description}</p>
              <ul className="list-disc pl-4">
                {goBags[selectedGoBag].items.map((it) => (
                  <li key={it.name}>
                    {it.name}
                    {it.batteryPowered && (
                      <Battery className="inline w-4 h-4 text-yellow-400 ml-1" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label className="text-white text-sm mb-1 block">Ranged Weapon</label>
          <Select value={freeRangedWeapon} onValueChange={handleRangedSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a ranged weapon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {rangedWeapons.map((w) => (
                <SelectItem key={w.name} value={w.name}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedFirearm && selectedFirearm.ammoType && selectedFirearm.ammoType.length > 0 && (
            <div className="mt-2">
              <Select
                value={selectedAmmoTypes[freeRangedWeapon]}
                onValueChange={(val) => handleAmmoChange(freeRangedWeapon, val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedFirearm.ammoType.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div>
          <label className="text-white text-sm mb-1 block">Melee Weapon</label>
          <Select value={freeMeleeWeapon} onValueChange={handleMeleeSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a melee weapon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {meleeWeapons.map((m) => (
                <SelectItem key={m.name} value={m.name}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedMelee && selectedMelee.examples && selectedMelee.examples.length > 0 && (
            <div className="mt-2">
              <Select
                value={selectedMeleeExamples[freeMeleeWeapon]}
                onValueChange={(val) => handleMeleeExampleChange(freeMeleeWeapon, val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedMelee.examples.map((ex) => (
                    <SelectItem key={ex} value={ex}>
                      {ex}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="mb-4 flex flex-wrap gap-2">
          <TabsTrigger value="ranged">Ranged Weapons</TabsTrigger>
          <TabsTrigger value="melee">Melee Weapons</TabsTrigger>
          <TabsTrigger value="other">Other Weapons</TabsTrigger>
          <TabsTrigger value="armor">Armor</TabsTrigger>
          <TabsTrigger value="gear">Gear</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        {/* Ranged Weapons */}
        <TabsContent value="ranged">
          <h3 className="text-white text-md mb-2">Firearms</h3>
          {firearms.map((w) => (
            <div key={w.name} className="flex items-center space-x-2 text-white mb-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  disabled={freeRangedWeapon === w.name}
                  checked={freeRangedWeapon === w.name || !!purchased[w.name]}
                  onChange={() => toggleRanged(w.name, true)}
                />
                <span>
                  {w.name} ({w.ap} AP)
                  {w.batteryPowered && (
                    <Battery className="inline w-4 h-4 text-yellow-400 ml-1" />
                  )}
                </span>
              </label>
              {(freeRangedWeapon === w.name || !!purchased[w.name]) && w.ammoType && w.ammoType.length > 0 && (
                <Select
                  value={selectedAmmoTypes[w.name]}
                  onValueChange={(val) => handleAmmoChange(w.name, val)}
                >
                  <SelectTrigger className="bg-gray-700 w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {w.ammoType.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}

          <h3 className="text-white text-md mt-4 mb-2">Archaic Weapons</h3>
          {archaicWeapons.map((w) => (
            <label key={w.name} className="flex items-start space-x-2 text-white cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5"
                disabled={freeRangedWeapon === w.name}
                checked={freeRangedWeapon === w.name || !!purchased[w.name]}
                onChange={() => toggleRanged(w.name)}
              />
              <span>
                {w.name} ({w.ap} AP)
                {w.batteryPowered && (
                  <Battery className="inline w-4 h-4 text-yellow-400 ml-1" />
                )}
              </span>
            </label>
          ))}
        </TabsContent>

        {/* Melee Weapons */}
        <TabsContent value="melee">
          <h3 className="text-white text-md mb-2">Melee Weapons</h3>
          {meleeWeapons.map((m) => (
            <div key={m.name} className="flex items-center space-x-2 text-white mb-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  disabled={freeMeleeWeapon === m.name}
                  checked={freeMeleeWeapon === m.name || !!purchased[m.name]}
                  onChange={() => toggleMelee(m.name)}
                />
                <span>
                  {m.name} ({m.ap} AP)
                  {m.batteryPowered && (
                    <Battery className="inline w-4 h-4 text-yellow-400 ml-1" />
                  )}
                </span>
              </label>
              {(freeMeleeWeapon === m.name || !!purchased[m.name]) && m.examples && m.examples.length > 0 && (
                <Select
                  value={selectedMeleeExamples[m.name]}
                  onValueChange={(val) => handleMeleeExampleChange(m.name, val)}
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
            <label
              key={w.name}
              className="flex items-start space-x-2 text-white cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={!!purchased[w.name]}
                onChange={() => togglePurchase(otherWeapons, w.name)}
              />
              <span>
                {w.name} ({w.ap} AP)
                {w.batteryPowered && (
                  <Battery className="inline w-4 h-4 text-yellow-400 ml-1" />
                )}
              </span>
            </label>
          ))}
        </TabsContent>

        {/* Armor */}
        <TabsContent value="armor">
          <h3 className="text-white text-md mb-2">Armor</h3>
          {armors.map((a) => (
            <label
              key={a.name}
              className="flex items-start space-x-2 text-white cursor-pointer"
            >
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={!!purchased[a.name]}
                onChange={() => togglePurchase(armors, a.name)}
              />
              <span>
                {a.name} ({a.ap} AP)
                {a.batteryPowered && (
                  <Battery className="inline w-4 h-4 text-yellow-400 ml-1" />
                )}
              </span>
            </label>
          ))}
        </TabsContent>

        {/* Gear */}
        <TabsContent value="gear">
          <h3 className="text-white text-md mb-2">Gear</h3>
          {equipmentCategories.map((cat) => (
            <div key={cat} className="mb-4">
              <h4 className="text-white text-sm font-semibold capitalize mb-1">
                {cat.replace(/([A-Z])/g, ' $1')}
              </h4>
              {gearItems[cat]?.map((g) => (
                <label
                  key={g.name}
                  className="flex items-start space-x-2 text-white cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="w-5 h-5"
                    checked={!!purchased[g.name]}
                    onChange={() => togglePurchase(gearItems[cat], g.name)}
                  />
                  <span>
                    {g.name} ({g.ap} AP)
                    {g.batteryPowered && (
                      <Battery className="inline w-4 h-4 text-yellow-400 ml-1" />
                    )}
                  </span>
                </label>
              ))}
            </div>
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
                    {item.batteryPowered && (
                      <Battery className="inline w-4 h-4 text-yellow-400 ml-1" />
                    )}
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

