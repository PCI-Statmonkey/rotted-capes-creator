// Parse a prerequisite string into structured requirements
const parsePrerequisite = (prereqString: string) => {
  const requirements = [];

  // Split by comma and clean up each part
  const parts = prereqString.split(',').map((part: string) => part.trim());
  
  for (const part of parts) {
    // Check for ability score requirements (e.g., "Dexterity 12+", "Wisdom 13+")
    const abilityMatch = part.match(/^(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s+(\d+)\+?$/i);
    if (abilityMatch) {
      requirements.push({
        type: 'ability',
        name: abilityMatch[1],
        value: parseInt(abilityMatch[2])
      });
      continue;
    }
    
    // Check for skill requirements ending with "trained"
    const skillMatch = part.match(/^(.+?)\s+trained$/i);
    if (skillMatch) {
      requirements.push({
        type: 'skill',
        name: skillMatch[1].trim()
      });
      continue;
    }
    
    // Check for specific skill focus requirements (e.g., "Engineering skill focus ×3")
    const skillFocusMatch = part.match(/^(.+?)\s+skill\s+focus(?:\s+×(\d+))?$/i);
    if (skillFocusMatch) {
      const skillName = skillFocusMatch[1].trim();
      const count = skillFocusMatch[2] ? parseInt(skillFocusMatch[2]) : 1;
      requirements.push({
        type: 'skillFocus',
        name: skillName,
        count: count
      });
      continue;
    }
    
    // Check for "As per maneuver" (special case for Learn Maneuver)
    if (part.toLowerCase().includes('as per maneuver')) {
      // This is a special case - we'll handle it separately
      requirements.push({
        type: 'maneuverPrereq',
        name: 'As per maneuver'
      });
      continue;
    }
    
    // Check for "Editor-in-Chief approval" or similar
    if (part.toLowerCase().includes('editor') || part.toLowerCase().includes('approval')) {
      requirements.push({
        type: 'approval',
        name: part
      });
      continue;
    }
    
    // Check for "Cannot have" requirements
    if (part.toLowerCase().startsWith('cannot have')) {
      requirements.push({
        type: 'cannot_have',
        name: part.replace(/^cannot have\s+/i, '').trim()
      });
      continue;
    }
    
    // Check for "Used the [something] 10 times"
    const usageMatch = part.match(/^Used the (.+?) (\d+) times$/i);
    if (usageMatch) {
      requirements.push({
        type: 'usage',
        name: usageMatch[1],
        count: parseInt(usageMatch[2])
      });
      continue;
    }
    
    // Check for power requirements
    if (part.toLowerCase().includes('power')) {
      requirements.push({
        type: 'power',
        name: part
      });
      continue;
    }
    
    // Default: treat as feat name requirement
    requirements.push({
      type: 'feat',
      name: part
    });
  }
  
  return requirements;
};

export const meetsPrerequisites = (feat: any, character: any) => {
  if (!feat || !feat.prerequisites || feat.prerequisites.length === 0) return true;

  const {
    abilityScores = {},
    selectedSkills = [],
    startingSkills = [],
    selectedSkillSets = [],
    skillSets = [],
    selectedFeats = []
  } = character;

  // Combine all skill names from starting, selected, and skill sets
  const skillsFromSets = skillSets
    .filter((set: any) => selectedSkillSets.includes(set.name))
    .flatMap((set: any) => set.skills);

  const normalizeSkill = (s: any) =>
    typeof s === 'string' ? s.toLowerCase() : s?.name?.toLowerCase();

  const allSkills = new Set([
    ...selectedSkills.map((s: any) => s.name.toLowerCase()),
    ...startingSkills.map((s: any) => s.toLowerCase()),
    ...skillsFromSets.map((s: any) => normalizeSkill(s))
  ]);

  const ownedFeats = selectedFeats.map((f: any) => f.name);

  // Parse all prerequisites
  const parsedPrereqs = feat.prerequisites.flatMap((prereqString: any) => {
    if (typeof prereqString === 'string') {
      return parsePrerequisite(prereqString);
    }
    return [prereqString]; // Already an object
  });

  return parsedPrereqs.every((req: any) => {
    switch (req.type) {
      case 'ability': {
        const abilityMap: Record<string, string> = {
          str: 'strength',
          dex: 'dexterity',
          con: 'constitution',
          int: 'intelligence',
          wis: 'wisdom',
          cha: 'charisma',
        };
        const normalized = Object.fromEntries(
          Object.entries(abilityScores).map(([k, v]) => {
            const lower = k.toLowerCase();
            const name = abilityMap[lower] || lower;
            return [name, v];
          })
        );
        return (normalized[req.name.toLowerCase()] || 0) >= req.value;
      }
      
      case 'skill':
        return allSkills.has(req.name.toLowerCase());
      
      case 'startingSkill':
        return startingSkills.includes(req.name);
      
      case 'feat':
        return ownedFeats.includes(req.name);
      
      case 'skillFocus':
        return allSkills.has(req.name.toLowerCase());
      
      case 'maneuverPrereq':
        // Special handling for "Learn Maneuver" - always return true for now
        // You might want to implement actual maneuver prerequisite checking
        return true;
      
      case 'approval':
        // Editor approval requirements - might want to add a flag for this
        return true;
      
      case 'cannot_have':
        // Check that they don't have the specified thing
        // This is complex and depends on what they "cannot have"
        return true; // For now, assume they don't have it
      
      case 'usage':
        // Usage requirements - you'd need to track usage counts
        return true; // For now, assume they meet usage requirements
      
      case 'power':
        // Power requirements - you'd need to track powers
        return true; // For now, assume they meet power requirements
      
      default:
        return true;
    }
  });
};

export const getMissingPrereqs = (feat: any, character: any) => {
  const missing = [];

  const {
    abilityScores = {},
    selectedSkills = [],
    startingSkills = [],
    selectedSkillSets = [],
    skillSets = [],
    selectedFeats = []
  } = character;

  const skillsFromSets = skillSets
    .filter((set: any) => selectedSkillSets.includes(set.name))
    .flatMap((set: any) => set.skills);

  const normalizeSkill = (s: any) =>
    typeof s === 'string' ? s.toLowerCase() : s?.name?.toLowerCase();

  const allSkills = new Set([
    ...selectedSkills.map((s: any) => s.name.toLowerCase()),
    ...startingSkills.map((s: any) => s.toLowerCase()),
    ...skillsFromSets.map((s: any) => normalizeSkill(s))
  ]);

  const ownedFeats = selectedFeats.map((f: any) => f.name);

  if (!feat.prerequisites || feat.prerequisites.length === 0) return [];

  // Parse all prerequisites
  const parsedPrereqs = feat.prerequisites.flatMap((prereqString: any) => {
    if (typeof prereqString === 'string') {
      return parsePrerequisite(prereqString);
    }
    return [prereqString]; // Already an object
  });

  for (const req of parsedPrereqs as any[]) {
    switch (req.type) {
      case 'ability': {
        const abilityMap: Record<string, string> = {
          str: 'strength',
          dex: 'dexterity',
          con: 'constitution',
          int: 'intelligence',
          wis: 'wisdom',
          cha: 'charisma',
        };
        const normalized = Object.fromEntries(
          Object.entries(abilityScores).map(([k, v]) => {
            const lower = k.toLowerCase();
            const name = abilityMap[lower] || lower;
            return [name, v];
          })
        );
        if ((normalized[req.name.toLowerCase()] || 0) < req.value) {
          missing.push(`${req.name} ${req.value}+`);
        }
        break;
      }
        break;
      
      case 'skill':
        if (!allSkills.has(req.name.toLowerCase())) {
        missing.push(`${req.name} trained`);
        }
        break;
      
      case 'startingSkill':
        if (!startingSkills.includes(req.name)) {
          missing.push(`${req.name} (starting skill)`);
        }
        break;
      
      case 'feat':
        if (!ownedFeats.includes(req.name)) {
          missing.push(`Feat: ${req.name}`);
        }
        break;
      
      case 'skillFocus':
        if (!allSkills.has(req.name.toLowerCase())) {
        missing.push(`${req.name} skill focus`);
        }
        break;
      
      case 'maneuverPrereq':
        // Don't add to missing for now
        break;
      
      case 'approval':
        // Don't add to missing for now
        break;
      
      case 'cannot_have':
        // This would require checking if they DO have something they shouldn't
        break;
      
      case 'usage':
        missing.push(`Used ${req.name} ${req.count} times`);
        break;
      
      case 'power':
        missing.push(req.name);
        break;
    }
  }

  return missing;
};
