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

  const isAbility = (name: string) =>
    [
      "str",
      "strength",
      "dex",
      "dexterity",
      "con",
      "constitution",
      "int",
      "intelligence",
      "wis",
      "wisdom",
      "cha",
      "charisma",
    ].includes(normalizeName(name));

  const cap = (n: string) => n[0].toUpperCase() + n.slice(1);

  // Handle patterns like "Str/Dex 13" or "Str or Dex 13"
  const orSameValueMatch = str.match(
    /^([a-z]+)\s*(?:\/|or)\s*([a-z]+)\s+(\d+)\+?$/i
  );
  if (
    orSameValueMatch &&
    isAbility(orSameValueMatch[1]) &&
    isAbility(orSameValueMatch[2])
  ) {
    const value = parseInt(orSameValueMatch[3], 10);
    return {
      type: "compound",
      operator: "or",
      requirements: [
        { type: "ability", name: cap(orSameValueMatch[1]), value },
        { type: "ability", name: cap(orSameValueMatch[2]), value },
      ],
    };
  }

  // General ability parsing - can include multiple abilities with values
  const abilityRegex = /(str|dex|con|int|wis|cha|strength|dexterity|constitution|intelligence|wisdom|charisma)\s*(\d+)\+?/gi;
  const abilityMatches: RegExpExecArray[] = [];
  let abilityMatch;
  while ((abilityMatch = abilityRegex.exec(str)) !== null) {
    abilityMatches.push(abilityMatch);
  }
  if (abilityMatches.length > 0) {
    const abilities = abilityMatches.map((m) => ({
      type: "ability",
      name: cap(m[1]),
      value: parseInt(m[2], 10),
    }));
    if (abilities.length > 1) {
      return {
        type: "compound",
        operator: lower.includes(" or ") ? "or" : "and",
        requirements: abilities,
      };
    }
    return abilities[0];
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

export const meetsPrerequisites = (
  feat: any,
  character: any,
  maneuverRequirements: any[] = []
) => {
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

  const evaluate = (req: any): boolean => {
    switch (req.type) {
      case 'compound':
        return req.operator === 'or'
          ? req.requirements.some((r: any) => evaluate(r))
          : req.requirements.every((r: any) => evaluate(r));

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
        const abilityName = abilityMap[req.name.toLowerCase()] || req.name.toLowerCase();
        return (normalized[abilityName] || 0) >= req.value;
      }

      case 'skill':
        return allSkills.has(req.name.toLowerCase());

      case 'startingSkill':
        return startingSkills.includes(req.name);

      case 'feat':
        return ownedFeats.includes(req.name);

      case 'skillFocus':
        return allSkills.has(req.name.toLowerCase());

      case 'maneuverPrereq': {
        if (!maneuverRequirements || maneuverRequirements.length === 0) {
          return true;
        }
        const reqs = Array.isArray(maneuverRequirements)
          ? maneuverRequirements
          : [maneuverRequirements];
        const parsed = reqs.flatMap((p: any) =>
          typeof p === 'string' ? parsePrerequisite(p) : [p]
        );
        return parsed.every((r: any) => evaluate(r));
      }

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
  };

  return parsedPrereqs.every(evaluate);
};

export const getMissingPrereqs = (
  feat: any,
  character: any,
  maneuverRequirements: any[] = []
) => {
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

  const evaluate = (req: any): boolean => {
    switch (req.type) {
      case 'compound':
        return req.operator === 'or'
          ? req.requirements.some((r: any) => evaluate(r))
          : req.requirements.every((r: any) => evaluate(r));

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
        const abilityName = abilityMap[req.name.toLowerCase()] || req.name.toLowerCase();
        return (normalized[abilityName] || 0) >= req.value;
      }

      case 'skill':
        return allSkills.has(req.name.toLowerCase());

      case 'startingSkill':
        return startingSkills.includes(req.name);

      case 'feat':
        return ownedFeats.includes(req.name);

      case 'skillFocus':
        return allSkills.has(req.name.toLowerCase());

      case 'maneuverPrereq': {
        if (!maneuverRequirements || maneuverRequirements.length === 0) {
          return true;
        }
        const reqs = Array.isArray(maneuverRequirements)
          ? maneuverRequirements
          : [maneuverRequirements];
        const parsed = reqs.flatMap((p: any) =>
          typeof p === 'string' ? parsePrerequisite(p) : [p]
        );
        return parsed.every((r: any) => evaluate(r));
      }

      case 'approval':
        return true;

      case 'cannot_have':
        return true;

      case 'usage':
        return false;

      case 'power':
        return false;

      default:
        return true;
    }
  };

  const collectMissing = (req: any) => {
    if (req.type === 'compound') {
      if (req.operator === 'or') {
        if (!req.requirements.some((r: any) => evaluate(r))) {
          missing.push(req);
        }
      } else {
        req.requirements.forEach((r: any) => collectMissing(r));
      }
      return;
    }
    if (req.type === 'maneuverPrereq') {
      if (maneuverRequirements && maneuverRequirements.length > 0) {
        const reqs = Array.isArray(maneuverRequirements)
          ? maneuverRequirements
          : [maneuverRequirements];
        const parsed = reqs.flatMap((p: any) =>
          typeof p === 'string' ? parsePrerequisite(p) : [p]
        );
        parsed.forEach((r: any) => collectMissing(r));
      }
      return;
    }
    if (!evaluate(req)) {
      missing.push(req);
    }
  };

  parsedPrereqs.forEach((req: any) => collectMissing(req));

  return missing;
};
