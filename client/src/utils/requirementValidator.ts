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

  const andSameValueMatch = str.match(
    /^([a-z]+)\s+and\s+([a-z]+)\s+of\s+(\d+)\+?$/i
  );
  if (
    andSameValueMatch &&
    isAbility(andSameValueMatch[1]) &&
    isAbility(andSameValueMatch[2])
  ) {
    const value = parseInt(andSameValueMatch[3], 10);
    return {
      type: "compound",
      operator: "and",
      requirements: [
        { type: "ability", name: cap(andSameValueMatch[1]), value },
        { type: "ability", name: cap(andSameValueMatch[2]), value },
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

  if (lower.startsWith("skill set:")) {
    return { type: "skillSet", name: str.split(":")[1].trim() };
  }

  if (lower.startsWith("edge:")) {
    return { type: "edge", name: str.split(":")[1].trim() };
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

    // Check for "cannot have" or "cannot possess" requirements (including weaknesses)
    const cannotHaveMatch = part.match(/^(?:can\s*not|cannot)\s+(?:have|possess)\s+(?:the\s+)?(.+?)(?:\s+weakness)?$/i);
    if (cannotHaveMatch) {
      requirements.push({
        type: 'cannot_have',
        name: cannotHaveMatch[1].trim()
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

export function formatPrerequisite(req: any): string {
  if (typeof req !== "object") return String(req);

  switch (req.type) {
    case "ability":
      return `${req.name} ${req.value}`;
    case "feat":
      return `Feat: ${req.name}`;
    case "skill":
    case "startingSkill":
      return req.name;
    case "skillSet":
      return `Skill Set: ${req.name}`;
    case "edge":
      return `Edge: ${req.name}`;
    case "skillFocus":
      return `${req.name} skill focus${req.count && req.count > 1 ? ` ×${req.count}` : ""}`;
    case "compound":
      return req.requirements
        .map((r: any) => formatPrerequisite(r))
        .join(` ${req.operator} `);
    case "maneuverPrereq":
    case "approval":
    case "cannot_have":
    case "usage":
    case "power":
      return req.name;
    default:
      return req.name ?? "";
  }
}
// Requirement types that shouldn't block selection
const SOFT_REQUIREMENTS = new Set(['approval']);

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
    selectedFeats = [],
    maneuverRequirements = []
  } = character;

  // Combine all skill names from starting, selected, and skill sets
  const selectedSetNames: string[] = Array.from(
    new Set(
      (selectedSkillSets || []).map((s: any) =>
        typeof s === 'string' ? s : s.name
      )
    )
  );

  const edgesFromSets: string[] = (selectedSkillSets || [])
    .flatMap((s: any) =>
      typeof s === 'object' && Array.isArray(s.edges)
        ? s.edges.map((e: string) => normalizeName(e))
        : []
    );

  const normalizeSkill = (s: any) =>
    typeof s === 'string' ? normalizeName(s) : normalizeName(s?.name);

  const allSkills = new Set([
    ...selectedSkills.map((s: any) => normalizeName(s.name)),
    ...startingSkills.map((s: any) => normalizeName(s)),
    // skill sets no longer grant discrete skills
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
    // Soft requirements never block selection
    if (SOFT_REQUIREMENTS.has(req.type)) return true;
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

      case 'skillSet':
        return selectedSetNames
          .map((n) => normalizeName(n))
          .includes(normalizeName(String(req.name)));

      case 'edge':
        return edgesFromSets.includes(normalizeName(String(req.name)));

      case 'skillFocus':
        return allSkills.has(req.name.toLowerCase());

      case 'maneuverPrereq': {
        if (Array.isArray(maneuverRequirements) && maneuverRequirements.length > 0) {
          const parsed = maneuverRequirements.flatMap((r: any) =>
            typeof r === 'string' ? parsePrerequisite(r) : [r]
          );
          return parsed.every((r) => evaluate(r));
        }
        const maneuvers = character.maneuvers || [];
        return maneuvers
          .map((m: any) =>
            typeof m === 'string' ? normalizeName(m) : normalizeName(m.name)
          )
          .includes(normalizeName(req.name));
      }

      case 'approval':
        return Boolean(character.editorApproved);

      case 'cannot_have': {
        const norm = (val: string) => normalizeName(val).replace(/\s+/g, '');
        const cannot = norm(req.name);
        const hasFeat = ownedFeats.map((f: any) => norm(f)).includes(cannot);
        const hasSkill = Array.from(allSkills).some((s: string) => norm(s) === cannot);
        const hasPower = (character.powers || [])
          .map((p: any) => norm(typeof p === 'string' ? p : p.name))
          .includes(cannot);
        const hasWeakness = (character.complications || [])
          .some((w: any) => {
            const wName = typeof w === 'string' ? w : w.name || w.type;
            return norm(wName) === cannot;
          });
        return !(hasFeat || hasSkill || hasPower || hasWeakness);
      }

      case 'usage':
        const usageCounts = character.usageCounts || {};
        return (
          (usageCounts[normalizeName(req.name)] || 0) >= (req.count || 0)
        );

      case 'power':
        const reqPower = normalizeName(req.name).replace(/\bpower\b/, '').trim();
        return (character.powers || [])
          .map((p: any) =>
            typeof p === 'string' ? normalizeName(p) : normalizeName(p.name)
          )
          .some((p: string) => reqPower.includes(p) || p.includes(reqPower));

      default:
        return true;
    }
  };

  return parsedPrereqs.every(evaluate);
};

export const getMissingPrereqs = (feat: any, character: any) => {
  const missing = { hard: [] as any[], soft: [] as any[] };

  const {
    abilityScores = {},
    selectedSkills = [],
    startingSkills = [],
    selectedSkillSets = [],
    skillSets = [],
    selectedFeats = [],
    maneuverRequirements = []
  } = character;

  const selectedSetNames: string[] = Array.from(
    new Set(
      (selectedSkillSets || []).map((s: any) =>
        typeof s === 'string' ? s : s.name
      )
    )
  );

  const edgesFromSets: string[] = (selectedSkillSets || [])
    .flatMap((s: any) =>
      typeof s === 'object' && Array.isArray(s.edges)
        ? s.edges.map((e: string) => normalizeName(e))
        : []
    );

  const normalizeSkill = (s: any) =>
    typeof s === 'string' ? normalizeName(s) : normalizeName(s?.name);

  const allSkills = new Set([
    ...selectedSkills.map((s: any) => normalizeName(s.name)),
    ...startingSkills.map((s: any) => normalizeName(s)),
    // skill sets no longer grant discrete skills
  ]);

  const ownedFeats = selectedFeats.map((f: any) => f.name);

  if (!feat) return missing;

  const prereqList = Array.isArray(feat.prerequisites)
    ? feat.prerequisites
    : feat.prerequisites
    ? [feat.prerequisites]
    : [];

  if (prereqList.length === 0) return missing;

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

      case 'skillSet':
        return selectedSetNames
          .map((n) => normalizeName(n))
          .includes(normalizeName(String(req.name)));

      case 'edge':
        return edgesFromSets.includes(normalizeName(String(req.name)));

      case 'skillFocus':
        return allSkills.has(req.name.toLowerCase());

      case 'maneuverPrereq': {
        if (Array.isArray(maneuverRequirements) && maneuverRequirements.length > 0) {
          const parsed = maneuverRequirements.flatMap((r: any) =>
            typeof r === 'string' ? parsePrerequisite(r) : [r]
          );
          return parsed.every((r) => evaluate(r));
        }
        const maneuvers = character.maneuvers || [];
        return maneuvers
          .map((m: any) =>
            typeof m === 'string' ? normalizeName(m) : normalizeName(m.name)
          )
          .includes(normalizeName(req.name));
      }

      case 'approval':
        return Boolean(character.editorApproved);

      case 'cannot_have': {
        const norm = (val: string) => normalizeName(val).replace(/\s+/g, '');
        const cannot = norm(req.name);
        const hasFeat = ownedFeats.map((f: any) => norm(f)).includes(cannot);
        const hasSkill = Array.from(allSkills).some((s: string) => norm(s) === cannot);
        const hasPower = (character.powers || [])
          .map((p: any) => norm(typeof p === 'string' ? p : p.name))
          .includes(cannot);
        const hasWeakness = (character.complications || [])
          .some((w: any) => {
            const wName = typeof w === 'string' ? w : w.name || w.type;
            return norm(wName) === cannot;
          });
        return !(hasFeat || hasSkill || hasPower || hasWeakness);
      }

      case 'usage':
        const usageCounts = character.usageCounts || {};
        return (
          (usageCounts[normalizeName(req.name)] || 0) >= (req.count || 0)
        );

      case 'power':
        const reqPower = normalizeName(req.name).replace(/\bpower\b/, '').trim();
        return (character.powers || [])
          .map((p: any) =>
            typeof p === 'string' ? normalizeName(p) : normalizeName(p.name)
          )
          .some((p: string) => reqPower.includes(p) || p.includes(reqPower));

      default:
        return true;
    }
  };

  const collectMissing = (req: any) => {
    if (req.type === 'compound') {
      if (req.operator === 'or') {
        if (!req.requirements.some((r: any) => evaluate(r))) {
          const allSoft = req.requirements.every((r: any) => SOFT_REQUIREMENTS.has(r.type));
          (allSoft ? missing.soft : missing.hard).push(req);
        }
      } else {
        req.requirements.forEach((r: any) => collectMissing(r));
      }
      return;
    }
    if (!evaluate(req)) {
      (SOFT_REQUIREMENTS.has(req.type) ? missing.soft : missing.hard).push(req);
    }
  };

  parsedPrereqs.forEach((req: any) => collectMissing(req));

  return missing;
};
