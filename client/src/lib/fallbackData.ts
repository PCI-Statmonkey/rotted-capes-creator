/**
 * Fallback sample data for when database connections fail
 * This provides demo content for admin pages while making it clear that it's sample data only
 */

// Sample Origins data
export const sampleOrigins = [
  {
    id: 0,
    name: "Alien",
    description: "You are not of this world. Whether you hail from a distant planet, are a member of an extraterrestrial species that has lived among humans for generations, or were transformed through unknown cosmic means, your physiology and manner mark you as something other than human.",
    abilityBonuses: { strength: 2, constitution: 2, charisma: -1, dexterity: 0, intelligence: 0, wisdom: 0 },
    specialAbility: "Alien Physiology: You can survive in environments that would be harmful to humans, such as toxic atmospheres or extreme temperatures.",
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 1,
    name: "Experiment",
    description: "You were either born in a laboratory or subjected to procedures that fundamentally altered your physical makeup. This process granted you enhanced capabilities but may have left physical or psychological scars.",
    abilityBonuses: { strength: 2, dexterity: 1, wisdom: -1, constitution: 0, intelligence: 0, charisma: 0 },
    specialAbility: "Enhanced Metabolism: Your body processes toxins and disease efficiently. You gain advantage on saves against poison and disease.",
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Augmented",
    description: "You've enhanced your natural abilities through cybernetics, genetic modification, or magical alteration. These enhancements define your capabilities and possibly your appearance.",
    abilityBonuses: { intelligence: 2, dexterity: 1, charisma: -1, strength: 0, constitution: 0, wisdom: 0 },
    specialAbility: "Integrated Systems: You can interface directly with technology, allowing you to control and access electronic systems with a thought.",
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Archetypes data
export const sampleArchetypes = [
  {
    id: 0,
    name: "Bruiser",
    description: "You're a force to be reckoned with, known for your physical prowess and intimidating presence. Whether trained in martial arts or just naturally tough, you excel at close-quarters combat and can withstand significant punishment.",
    specialAbility: "Intimidating Presence: You can use your strength score for Intimidation checks.",
    keyAbilities: { primary: "Strength", secondary: "Constitution" },
    trainedSkill: "Athletics",
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 1,
    name: "Speedster",
    description: "You move with incredible speed and agility, outpacing normal human capabilities. Your reflexes are lightning-fast, and you can perform feats of dexterity that seem impossible to others.",
    specialAbility: "Rapid Movement: You can move an additional 30 feet as part of your movement action.",
    keyAbilities: { primary: "Dexterity", secondary: "Constitution" },
    trainedSkill: "Acrobatics",
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Mastermind",
    description: "Your intellect is your greatest weapon. You analyze situations, predict outcomes, and develop complex strategies with ease. Your enhanced mental capabilities allow you to solve problems others find impossible.",
    specialAbility: "Tactical Analysis: Once per day, you can grant a +2 bonus to an ally's attack roll or skill check by analyzing the situation and providing guidance.",
    keyAbilities: { primary: "Intelligence", secondary: "Wisdom" },
    trainedSkill: "Investigation",
    imageUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];


// Sample Feats data
export const sampleFeats = [
  {
    id: 0,
    name: "Power Attack",
    description: "You can sacrifice accuracy for power in your melee attacks.",
    benefits: "When making a melee attack, you can take a -2 penalty to your attack roll to add +4 to your damage roll.",
    prerequisites: { strength: 13 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 1,
    name: "Defensive Combat",
    description: "You've learned techniques to protect yourself in combat.",
    benefits: "You gain a +2 bonus to your Armor Class when fighting defensively.",
    prerequisites: { dexterity: 13 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Quick Reflexes",
    description: "Your reactions are faster than normal.",
    benefits: "You gain a +2 bonus to initiative checks and can perform an additional reaction each round.",
    prerequisites: { dexterity: 15 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Skill Sets data
export const sampleSkillSets = [
  {
    id: 0,
    name: "Former Delta Force Operative",
    description:
      "Elite military training adapted to the apocalypse, from close-quarters battle to survival tactics.",
    edges: ["Breaching Specialist", "Tactical Awareness"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 1,
    name: "Corporate Power Broker",
    description:
      "You knew how to pull strings and move resources in the boardroom; now those skills keep enclaves alive.",
    edges: ["Boardroom Shark", "Financial Leverage"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Urban Explorer",
    description:
      "Navigating rooftops, tunnels, and ruins was your hobby; now it's how you keep ahead of the dead.",
    edges: ["Parkour Pro", "Knows Every Back Alley"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Powers data
export const samplePowers = [
  {
    id: 0,
    name: "Energy Blast",
    description: "You can project destructive energy from your hands or eyes.",
    hasDamageType: true,
    hasTarget: true,
    skillCompatible: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 1,
    name: "Super Strength",
    description: "Your physical strength far exceeds human limits.",
    hasDamageType: false,
    hasTarget: false,
    skillCompatible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Telekinesis",
    description: "You can move objects with your mind.",
    hasDamageType: false,
    hasTarget: true,
    skillCompatible: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Power Sets data
export const samplePowerSets = [
  {
    id: 0,
    name: "Energy Controller",
    powers: ["Energy Blast", "Energy Shield", "Energy Absorption"],
    requiredArchetypes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 1,
    name: "Physical Powerhouse",
    powers: ["Super Strength", "Enhanced Durability", "Leaping"],
    requiredArchetypes: ["Bruiser"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Psychic",
    powers: ["Telepathy", "Telekinesis", "Mind Control"],
    requiredArchetypes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Gear data
export const sampleGear = [
  {
    id: 0,
    name: "Auto-Pistol",
    description: "Standard automatic handgun.",
    category: "firearms",
    ap: 2,
    ammo_type: ["light"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 1,
    name: "Revolver",
    description: "Reliable wheel gun.",
    category: "firearms",
    ap: 1,
    ammo_type: ["medium"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 2,
    name: "Semi-Auto",
    description: "Semi-automatic pistol.",
    category: "firearms",
    ap: 2,
    ammo_type: ["medium"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 3,
    name: "Heavy Revolver",
    description: "Large caliber revolver.",
    category: "firearms",
    ap: 2,
    ammo_type: ["heavy"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 4,
    name: "Heavy Semi-Auto",
    description: "High-powered semi-automatic handgun.",
    category: "firearms",
    ap: 4,
    ammo_type: ["heavy"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 5,
    name: "Hunting Rifle",
    description: "Standard hunting rifle.",
    category: "firearms",
    ap: 1,
    ammo_type: ["heavy"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 6,
    name: "Double Barrel Rifle",
    description: "Two-shot break-action rifle.",
    category: "firearms",
    ap: 2,
    ammo_type: ["medium"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 7,
    name: "Sniper Rifle",
    description: "Long-range precision rifle.",
    category: "firearms",
    ap: 4,
    ammo_type: ["heavy"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 8,
    name: "Assault Rifle",
    description: "Military style rifle.",
    category: "firearms",
    ap: 3,
    ammo_type: ["medium"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 9,
    name: "Light Machine Gun",
    description: "Portable squad automatic weapon.",
    category: "firearms",
    ap: 3,
    ammo_type: ["medium"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 10,
    name: "Heavy Machine Gun",
    description: "Crew served machine gun.",
    category: "firearms",
    ap: 4,
    ammo_type: ["heavy"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 11,
    name: "Double Barrel Shotgun",
    description: "Two-barrel shotgun.",
    category: "firearms",
    ap: 2,
    ammo_type: ["shells"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 12,
    name: "Hunting/Tactical Shotgun",
    description: "Pump or tactical shotgun.",
    category: "firearms",
    ap: 1,
    ammo_type: ["shells"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 13,
    name: "Assault Shotgun",
    description: "Automatic shotgun.",
    category: "firearms",
    ap: 3,
    ammo_type: ["shells"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 14,
    name: "Bow/Crossbow",
    description: "Simple ranged weapon.",
    category: "archaicWeapons",
    ap: 1,
    ammo_type: ["archaic"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 15,
    name: "Composite Bow",
    description: "Advanced bow design.",
    category: "archaicWeapons",
    ap: 2,
    ammo_type: ["archaic"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 16,
    name: "d4 Melee Weapon",
    description: "Light melee implements.",
    category: "meleeWeapons",
    ap: 1,
    examples: [
      "Pick/Screwdriver",
      "Hunting Knife",
      "Glass Shard",
      "Shuriken",
      "Throwing Knives",
    ],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 17,
    name: "d6 Melee Weapon",
    description: "One-handed melee weapons.",
    category: "meleeWeapons",
    ap: 1,
    examples: [
      "Lead Pipe",
      "Hammer",
      "Hatchet",
      "Ka-Bar",
      "WW2 Trench Knife",
      "Replica Katana",
    ],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 18,
    name: "d8 Melee Weapon",
    description: "Sturdy melee weapons.",
    category: "meleeWeapons",
    ap: 1,
    examples: [
      "Bat",
      "Fire Extinguisher",
      "Ninja-To",
      "Machete",
      "Police Baton",
      "Short Sword",
      "Shovel",
      "Spear",
      "2x4",
      "Authentic Katana",
    ],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 19,
    name: "d10 Melee Weapon",
    description: "Two-handed melee weapons.",
    category: "meleeWeapons",
    ap: 2,
    examples: [
      "Claymore",
      "Circular Saw",
      "Fireman's Axe",
      "Authentic Katana wielded with both hands",
    ],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 20,
    name: "d12 Melee Weapon",
    description: "Massive melee weapon.",
    category: "meleeWeapons",
    ap: 2,
    examples: ["Chainsaw (Running)"],
    tags: [],
    batteryPowered: false,
  },
  {
    id: 22,
    name: "Ballistic Vest",
    description: "Standard Kevlar vest offering solid ballistic protection.",
    category: "armor",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 23,
    name: "Flashlight",
    description: "Illuminates dark areas.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 24,
    name: "Binoculars",
    description: "Helpful for scouting.",
    category: "optics",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 25,
    name: "Holster",
    description: "Carries a sidearm.",
    category: "tacticalAccessory",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 26,
    name: "Red Dot Sight",
    description: "Improves aim with a glowing dot.",
    category: "tacticalSight",
    ap: 1,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 27,
    name: "Tactical Body Armor",
    description: "Full tactical suit with ballistic plates and padding.",
    category: "armor",
    ap: 3,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 28,
    name: "Reinforced Clothing",
    description: "Durable everyday wear with protective lining.",
    category: "armor",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 29,
    name: "Boiled Leather Armor",
    description: "Molded leather plates hardened for protection.",
    category: "armor",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 30,
    name: "Chain Mail",
    description: "Linked metal rings for solid melee defense.",
    category: "armor",
    ap: 3,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 31,
    name: "Heavy Clothing",
    description: "Layered clothing or sports pads offering minor defense.",
    category: "armor",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 32,
    name: "Riot Shield",
    description: "Large shield designed to deflect attacks.",
    category: "armor",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 33,
    name: "Shield",
    description: "Basic protective shield.",
    category: "armor",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 34,
    name: "Standard First Aid Kit",
    description: "Basic medical supplies for treating injuries.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 35,
    name: "EMT Medical Field Kit",
    description: "Advanced medical kit for emergency situations.",
    category: "equipment",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 36,
    name: "Backpack",
    description: "Simple pack for carrying gear.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 37,
    name: "Climbing Kit",
    description: "Ropes and pitons for scaling obstacles.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 38,
    name: "Gas Mask",
    description: "Protects against airborne hazards.",
    category: "equipment",
    ap: 2,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 39,
    name: "Rope (Hemp) 30'",
    description: "Sturdy hemp rope 30 feet long.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 40,
    name: "Multi-Tool",
    description: "Compact tool with multiple functions.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 41,
    name: "Batteryless Shake Flashlight",
    description: "Hand-powered flashlight that never needs batteries.",
    category: "equipment",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 42,
    name: "Tactical Rail System",
    description: "Mounting system for weapon accessories.",
    category: "tacticalAccessory",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 43,
    name: "Tactical Flashlight",
    description: "Weapon-mounted flashlight for low light engagements.",
    category: "tacticalAccessory",
    ap: 1,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 44,
    name: "Tactical Laser Sight",
    description: "Laser sight that improves close range accuracy.",
    category: "tacticalSight",
    ap: 1,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 45,
    name: "Silencer",
    description: "Suppressor for light and medium firearms.",
    category: "tacticalAccessory",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 46,
    name: "Standard Hunting Scope",
    description: "Basic optical scope for rifles.",
    category: "tacticalSight",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 47,
    name: "Tactical Sniper Scope",
    description: "Long-range scope with advanced optics.",
    category: "tacticalSight",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 48,
    name: "Night Vision Sight",
    description: "Scope granting night vision capability.",
    category: "tacticalSight",
    ap: 2,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 49,
    name: "Night Vision Goggles (Simple)",
    description: "Basic night vision goggles.",
    category: "optics",
    ap: 1,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 50,
    name: "Night Vision Goggles (Tactical)",
    description: "Advanced night vision goggles with superior clarity.",
    category: "optics",
    ap: 2,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 51,
    name: "Grenade Launcher",
    description: "Shoulder-fired launcher for grenades.",
    category: "otherModernWeapons",
    ap: 4,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 52,
    name: "Flare Gun",
    description: "Signal pistol firing bright flares.",
    category: "otherModernWeapons",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 53,
    name: "Flamethrower",
    description: "Projects a stream of ignited fuel.",
    category: "otherModernWeapons",
    ap: 4,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 54,
    name: "Stun Gun/Taser",
    description: "Delivers an incapacitating electric shock.",
    category: "otherModernWeapons",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 55,
    name: "Molotov Cocktail",
    description: "Improvised incendiary explosive.",
    category: "otherModernWeapons",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 56,
    name: "Fragmentation Grenade",
    description: "Explosive that scatters shrapnel.",
    category: "otherModernWeapons",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 57,
    name: "Flashbang Grenade",
    description: "Produces a blinding flash and deafening bang.",
    category: "otherModernWeapons",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 58,
    name: "Concussion Grenade",
    description: "Creates a powerful shockwave on detonation.",
    category: "otherModernWeapons",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 59,
    name: "Incendiary Grenade",
    description: "Grenade that spreads fire on detonation.",
    category: "otherModernWeapons",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 60,
    name: "Tear-Gas Grenade",
    description: "Grenade dispersing irritant gas.",
    category: "otherModernWeapons",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 61,
    name: "Knock-Out Gas Grenade",
    description: "Releases sleep-inducing gas.",
    category: "otherModernWeapons",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 62,
    name: "Poison Gas Grenade",
    description: "Filled with lethal chemical agents.",
    category: "otherModernWeapons",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 63,
    name: "Smoke Grenade",
    description: "Creates a thick smoke screen.",
    category: "otherModernWeapons",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 64,
    name: "Night Vision Binoculars",
    description: "Enhanced binoculars with night vision capability.",
    category: "optics",
    ap: 2,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 65,
    name: "Bivouac Sack",
    description: "Lightweight one-person sleeping shelter.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 66,
    name: "Canteen",
    description: "Container for carrying drinking water.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 67,
    name: "Compass",
    description: "Basic magnetic compass for navigation.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 68,
    name: "Duct Tape",
    description: "Strong adhesive tape useful for quick repairs.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 69,
    name: "Field Kit",
    description: "Basic set of supplies for working in the field.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 70,
    name: "Fire Extinguisher",
    description: "Portable device for putting out small fires.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 71,
    name: "Firearm Maintenance Kit",
    description: "Tools and oils for cleaning and repairing firearms.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 72,
    name: "Flashlight",
    description: "Standard battery-powered flashlight.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 73,
    name: "Flint and Striker",
    description: "Sparking tool for starting fires without matches.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 74,
    name: "Grappling Hook",
    description: "Hook for climbing when attached to a rope.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 75,
    name: "Handheld GPS (Civilian)",
    description: "Basic GPS unit for general navigation.",
    category: "equipment",
    ap: 2,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 76,
    name: "Handheld GPS (Military)",
    description: "Rugged GPS unit with advanced features.",
    category: "equipment",
    ap: 3,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 77,
    name: "Walkie-Talkie",
    description: "Portable two-way radio for short-range communication.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 78,
    name: "Lantern (Solar/Battery/Gas)",
    description: "Multi-power lantern for illuminating campsites.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 79,
    name: "Lock Picks",
    description: "Tools for opening locks without keys.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 80,
    name: "Maps",
    description: "Paper maps covering local regions.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 81,
    name: "Rope (Kevlar) 30'",
    description: "Durable 30-foot length of Kevlar rope.",
    category: "equipment",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 82,
    name: "Rope (Nylon) 30'",
    description: "Strong 30-foot length of nylon rope.",
    category: "equipment",
    ap: 3,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 83,
    name: "Rucksack",
    description: "Heavy-duty pack for carrying large loads.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 84,
    name: "Sleeping Bag",
    description: "Insulated roll for sleeping outdoors.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 85,
    name: "Solar/Crank Radio",
    description: "Radio powered by solar panel or hand crank.",
    category: "equipment",
    ap: 2,
    tags: [],
    batteryPowered: true,
  },
  {
    id: 86,
    name: "Tent",
    description: "Portable shelter for camping.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 87,
    name: "Tool Kit (Partial)",
    description: "Incomplete kit of basic tools.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 88,
    name: "Tool Kit (Complete)",
    description: "Full kit containing a wide range of tools.",
    category: "equipment",
    ap: 2,
    tags: [],
    batteryPowered: false,
  },
  {
    id: 89,
    name: "Water Filtration Kit",
    description: "Filters contaminants from drinking water.",
    category: "equipment",
    ap: 1,
    tags: [],
    batteryPowered: false,
  },
];

// Sample Power Modifiers data
export const samplePowerModifiers = [
  {
    id: 0,
    name: "Increased Range",
    description: "Extends the range of your power.",
    type: "Enhancement",
    bonus: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 1,
    name: "Increased Damage",
    description: "Augments the damage output of your power.",
    type: "Enhancement",
    bonus: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Limited Uses",
    description: "Restricts how often you can use your power.",
    type: "Limitation",
    bonus: -2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Sample Analytics data
export const sampleAnalytics = {
  characterCreations: {
    total: 152,
    completed: 98,
    abandoned: 54,
    byMonth: [
      { month: 'Jan', count: 12 },
      { month: 'Feb', count: 18 },
      { month: 'Mar', count: 22 },
      { month: 'Apr', count: 35 },
      { month: 'May', count: 65 }
    ]
  },
  popularChoices: {
    origins: [
      { name: 'Alien', count: 42 },
      { name: 'Experiment', count: 38 },
      { name: 'Augmented', count: 35 },
      { name: 'Mutant', count: 24 },
      { name: 'Supernatural', count: 13 }
    ],
    archetypes: [
      { name: 'Bruiser', count: 45 },
      { name: 'Speedster', count: 36 },
      { name: 'Mastermind', count: 28 },
      { name: 'Defender', count: 23 },
      { name: 'Blaster', count: 20 }
    ],
    powerSets: [
      { name: 'Energy Controller', count: 38 },
      { name: 'Physical Powerhouse', count: 35 },
      { name: 'Psychic', count: 29 },
      { name: 'Elemental', count: 27 },
      { name: 'Gadgeteer', count: 23 }
    ]
  }
};

/**
 * Gets the appropriate sample data based on the content type
 * @param contentType The type of game content to retrieve
 * @returns The corresponding sample data array
 */
export const getSampleData = (contentType: string): any[] => {
  switch (contentType) {
    case 'origins':
      return sampleOrigins;
    case 'archetypes':
      return sampleArchetypes;
    case 'skills':
    case 'skillSets':
    case 'skill-sets':
      return sampleSkillSets;
    case 'feats':
      return sampleFeats;
    case 'powers':
      return samplePowers;
    case 'powerSets':
    case 'power-sets':
      return samplePowerSets;
    case 'gear':
      return sampleGear;
    case 'powerModifiers':
    case 'power-modifiers':
      return samplePowerModifiers;
    default:
      return [];
  }
};

/**
 * Gets a specific sample item by ID
 * @param contentType The type of game content to retrieve
 * @param id The ID of the item to retrieve
 * @returns The matching item or undefined
 */
export const getSampleItemById = (contentType: string, id: number): any => {
  const data = getSampleData(contentType);
  return data.find(item => item.id === id);
};