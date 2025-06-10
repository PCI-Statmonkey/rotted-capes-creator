// Safely lowercase and trim strings
export function normalizeName(name: string | undefined): string {
  return name?.toLowerCase().trim() || "";
}

// Parse a single prerequisite string into a structured object
export function parsePrerequisiteString(str: string) {
  const lower = normalizeName(str);

  if (lower.includes("trained")) {
    return { type: "skill", name: str.replace(/trained/i, "").trim() };
  }

  const abilityMatch = str.match(/^([a-z]+)\s+(\d+)\+?$/i);
  if (abilityMatch) {
    return {
      type: "ability",
      name: abilityMatch[1][0].toUpperCase() + abilityMatch[1].slice(1),
      value: parseInt(abilityMatch[2], 10),
    };
  }

  if (lower.startsWith("feat:")) {
    return { type: "feat", name: str.split(":")[1].trim() };
  }

  return { type: "unknown", value: str };
}

// Parse a prerequisite string into structured requirements
export const parsePrerequisite = (prereqString: string) => {
  const requirements = [] as any[];

  // Split by comma and clean up each part
  const parts = prereqString.split(',').map((part: string) => part.trim());

  for (const part of parts) {
    const basic = parsePrerequisiteString(part);
    if (basic.type !== 'unknown') {
      requirements.push(basic);
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
    if (normalizeName(part).includes('as per maneuver')) {
      requirements.push({
        type: 'maneuverPrereq',
        name: 'As per maneuver'
      });
      continue;
    }

    // Check for "Editor-in-Chief approval" or similar
    if (normalizeName(part).includes('editor') || normalizeName(part).includes('approval')) {
      requirements.push({
        type: 'approval',
        name: part
      });
      continue;
    }

    // Check for "Cannot have" requirements
    if (normalizeName(part).startsWith('cannot have')) {
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
    if (normalizeName(part).includes('power')) {
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
  if (!feat) return true;

  const prereqList = Array.isArray(feat.prerequisites)
    ? feat.prerequisites
    : feat.prerequisites
    ? [feat.prerequisites]
    : [];

  if (prereqList.length === 0) return true;

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
    typeof s === 'string' ? normalizeName(s) : normalizeName(s?.name);

  const allSkills = new Set([
    ...selectedSkills.map((s: any) => normalizeName(s.name)),
    ...startingSkills.map((s: any) => normalizeName(s)),
    ...skillsFromSets.map((s: any) => normalizeSkill(s))
  ]);

  const ownedFeats = selectedFeats.map((f: any) => f.name);

  // Parse all prerequisites
  const parsedPrereqs = prereqList.flatMap((prereqString: any) => {
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
  const missing = [] as any[];

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
    typeof s === 'string' ? normalizeName(s) : normalizeName(s?.name);

  const allSkills = new Set([
    ...selectedSkills.map((s: any) => normalizeName(s.name)),
    ...startingSkills.map((s: any) => normalizeName(s)),
    ...skillsFromSets.map((s: any) => normalizeSkill(s))
  ]);

  const ownedFeats = selectedFeats.map((f: any) => f.name);

  if (!feat) return [];

  const prereqList = Array.isArray(feat.prerequisites)
    ? feat.prerequisites
    : feat.prerequisites
    ? [feat.prerequisites]
    : [];

  if (prereqList.length === 0) return [];

  // Parse all prerequisites
  const parsedPrereqs = prereqList.flatMap((prereqString: any) => {
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
          missing.push(req);
        }
        break;
      }
        break;
      
      case 'skill':
        if (!allSkills.has(req.name.toLowerCase())) {
        missing.push(req);
        }
        break;
      
      case 'startingSkill':
        if (!startingSkills.includes(req.name)) {
          missing.push(req);
        }
        break;
      
      case 'feat':
        if (!ownedFeats.includes(req.name)) {
          missing.push(req);
        }
        break;
      
      case 'skillFocus':
        if (!allSkills.has(req.name.toLowerCase())) {
        missing.push(req);
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
        missing.push(req);
        break;

      case 'power':
        missing.push(req);
        break;
    }
  }

  return missing;
};
