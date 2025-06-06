export const meetsPrerequisites = (feat, character) => {
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
    .filter((set) => selectedSkillSets.includes(set.name))
    .flatMap((set) => set.skills);

  const allSkills = new Set([
    ...selectedSkills.map((s) => s.name),
    ...startingSkills,
    ...skillsFromSets
  ]);

  const ownedFeats = selectedFeats.map(f => f.name);

  return feat.prerequisites.every((req) => {
    if (typeof req === 'string') return ownedFeats.includes(req); // for feats-as-requirements
    if (req.type === 'ability') return (abilityScores[req.name] || 0) >= req.value;
    if (req.type === 'skill') return allSkills.has(req.name);
    if (req.type === 'startingSkill') return startingSkills.includes(req.name);
    if (req.type === 'feat') return ownedFeats.includes(req.name);
    return true;
  });
};

export const getMissingPrereqs = (feat, character) => {
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
    .filter((set) => selectedSkillSets.includes(set.name))
    .flatMap((set) => set.skills);

  const allSkills = new Set([
    ...selectedSkills.map((s) => s.name),
    ...startingSkills,
    ...skillsFromSets
  ]);

  const ownedFeats = selectedFeats.map(f => f.name);

  if (!feat.prerequisites || feat.prerequisites.length === 0) return [];

  for (const req of feat.prerequisites) {
    if (typeof req === 'string') {
      if (!ownedFeats.includes(req)) missing.push(req);
    } else if (req.type === 'ability' && (abilityScores[req.name] || 0) < req.value) {
      missing.push(req);
    } else if (req.type === 'skill' && !allSkills.has(req.name)) {
      missing.push(req);
    } else if (req.type === 'startingSkill' && !startingSkills.includes(req.name)) {
      missing.push(req);
    } else if (req.type === 'feat' && !ownedFeats.includes(req.name)) {
      missing.push(req);
    }
  }

  return missing;
};
