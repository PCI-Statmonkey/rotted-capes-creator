// Step5_Feats.tsx
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useCharacterBuilder } from "@/lib/Stores/characterBuilder";
import ManeuverDropdown from "@/components/ManeuverDropdown";
import FeatCard from "@/components/FeatCard";
import { meetsPrerequisites, getMissingPrereqs } from "@/utils/requirementValidator";
import useCachedGameContent from "@/hooks/useCachedGameContent";
import { useCharacter } from "@/context/CharacterContext";

// Basic starting skills list
const Step5_Feats = () => {
  // Destructure character builder state
  const {
    abilityScores = {},
    startingSkills,
    selectedSkills,
    selectedFeats,
    selectedSkillSets,
    selectedManeuvers,
    startingManeuver,
    skillsTab,
    setSkillsTab,
  } = useCharacterBuilder();
  const { character, setCurrentStep, setCurrentSubStep } = useCharacter();
  const archetype = character.archetype;

  // --- Local state for working selections ---
  const [workingStartingSkills, setWorkingStartingSkills] = useState<string[]>([]);
  const [workingSelectedSkills, setWorkingSelectedSkills] = useState<{ name: string; focuses: string[] }[]>([]);
  // Store selected feats with an optional input for feats like 'Skill Focus' or 'Learn Maneuver'
  const [workingSelectedFeats, setWorkingSelectedFeats] = useState<{ name: string; input?: string }[]>([]);
  const [workingSelectedSkillSets, setWorkingSelectedSkillSets] = useState<string[]>([]);
  // Maneuvers are stored separately, indexed to correspond with 'Learn Maneuver' feats
  const [workingSelectedManeuvers, setWorkingSelectedManeuvers] = useState<string[]>([]);
  const [workingStartingManeuver, setWorkingStartingManeuver] = useState<string>("");

  // --- Data loaded from JSON and API ---
  const { data: skills } = useCachedGameContent<any>('skills');
  const { data: feats } = useCachedGameContent<any>('feats');
  const { data: skillSets } = useCachedGameContent<any>('skill-sets');
  const { data: maneuvers } = useCachedGameContent<any>('maneuvers');

  // Deduplicate feats by name to avoid rendering duplicates
  const uniqueFeats = useMemo(() => {
    const map = new Map<string, any>();
    (feats ?? []).forEach((f: any) => {
      if (!map.has(f.name)) map.set(f.name, f);
    });
    return Array.from(map.values());
  }, [feats]);

  const featTypes = useMemo(
    () => Array.from(new Set((feats ?? []).map((f: any) => f.type))).sort(),
    [feats]
  );
  const [typeFilter, setTypeFilter] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (featTypes.length && Object.keys(typeFilter).length === 0) {
      const initial: Record<string, boolean> = {};
      featTypes.forEach((t) => {
        initial[t] = true;
      });
      setTypeFilter(initial);
    }
  }, [featTypes, typeFilter]);

  const skillsFromSets = useMemo(() => {
    return workingSelectedSkillSets.flatMap((setName) => {
      const found = skillSets.find((s) => s.name === setName);
      return (
        found?.skills?.map((s: any) => (typeof s === "string" ? s : s.name)) || []
      );
    });
  }, [workingSelectedSkillSets, skillSets]);

  // Count how many times each skill is granted for free via starting skills or skill sets
  const skillCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    workingStartingSkills.forEach((s) => {
      counts[s] = (counts[s] || 0) + 1;
    });
    workingSelectedSkillSets.forEach((setName) => {
      const found = skillSets.find((s) => s.name === setName);
      found?.skills?.forEach((sk: any) => {
        const name = typeof sk === "string" ? sk : sk.name;
        counts[name] = (counts[name] || 0) + 1;
      });
    });
    return counts;
  }, [workingStartingSkills, workingSelectedSkillSets, skillSets]);

  const [availablePoints, setAvailablePoints] = useState(20); // Initial points

  // Destructure character builder setters to persist selections
  const {
    setStartingSkills,
    setSelectedSkills,
    setSelectedFeats,
    setSelectedSkillSets,
    setSelectedManeuvers,
    setStartingManeuver,
    setCurrentStep: builderSetCurrentStep,
  } = useCharacterBuilder();

  // --- Data Fetching & Initialization ---
  // Data is fetched and cached via useCachedGameContent hook
  useEffect(() => {
    if (startingSkills) setWorkingStartingSkills(startingSkills);
    if (selectedSkills)
      setWorkingSelectedSkills(
        selectedSkills.map((s: any) => ({
          name: s.name,
          focuses: s.focuses || (s.focus ? [s.focus] : []),
        }))
      );
    if (selectedFeats) setWorkingSelectedFeats(selectedFeats as any);
    if (selectedSkillSets) setWorkingSelectedSkillSets(selectedSkillSets);
    if (selectedManeuvers) setWorkingSelectedManeuvers(selectedManeuvers);
    if (startingManeuver) setWorkingStartingManeuver(startingManeuver);
  }, []);

  // Auto select feats granted by skill sets or archetype
  useEffect(() => {
    if (!skillSets || !feats) return;

    const archetypeFreeMap: Record<string, string[]> = {
      Infiltrator: ["Stealthy"],
      Heavy: ["Toughness"],
      Brawler: ["Martial Arts"],
    };

    setWorkingSelectedFeats((prev) => {
      let updated = prev.filter((f) => {
        if (f.free && f.source?.startsWith("Skill Set: ")) {
          const setName = f.source.replace("Skill Set: ", "");
          return workingSelectedSkillSets.includes(setName);
        }
        if (f.free && f.source?.startsWith("Archetype: ")) {
          const arch = f.source.replace("Archetype: ", "");
          return arch === archetype;
        }
        return true;
      });

      const existing = updated.map((f) => f.name);

      workingSelectedSkillSets.forEach((setName) => {
        const set = skillSets.find((s) => s.name === setName);
        set?.feats?.forEach((name: string) => {
          if (!existing.includes(name)) {
            existing.push(name);
            updated.push({ name, input: "", source: `Skill Set: ${setName}`, free: true });
          }
        });
      });

      (archetypeFreeMap[archetype] || []).forEach((name) => {
        if (!existing.includes(name)) {
          existing.push(name);
          updated.push({ name, input: "", source: `Archetype: ${archetype}`, free: true });
        }
      });

      return updated;
    });
  }, [workingSelectedSkillSets, archetype, skillSets, feats]);


  // --- Point Calculation Logic ---
  // Recalculate available points whenever selections change
  useEffect(() => {
    const skillSetPoints = workingSelectedSkillSets.reduce((acc, setName) => {
      const found = skillSets.find((s) => s.name === setName);
      return acc + (found?.points || 0); // Add points for each selected skill set
    }, 0);

    // Archetype affects maximum skill sets, but current calculation only uses points from selected ones.
    // The 'maxSkillSets' variable can be used for UI validation or display if needed.
    const maxSkillSets = archetype === "Highly Trained" ? 3 : 2;

    // Calculate total points used: 1 point per skill, 5 points per feat, and points from skill sets
    const focusPoints = workingSelectedSkills.reduce((acc, s) => {
      const totalFocuses = s.focuses.filter(
        (f) => f.trim() !== "" && f !== "__custom__"
      ).length;
      // Determine how many free focuses are granted for this skill
      const freeFocuses = Math.max(0, (skillCounts[s.name] || 0) - 1);
      return acc + Math.max(0, totalFocuses - freeFocuses);
    }, 0);
    const paidFeatCount = workingSelectedFeats.filter(f => !f.free).length;
    const featCost = Math.max(0, paidFeatCount - 1) * 5; // first paid feat is free
    const pointsUsed =
      workingSelectedSkills.length + focusPoints + featCost + skillSetPoints;
    setAvailablePoints(20 - pointsUsed); // Update available points
  }, [
    workingSelectedSkills,
    workingSelectedFeats,
    workingSelectedSkillSets,
    workingStartingSkills,
    skillSets,
    archetype,
  ]);

  // Persist selections whenever any working state changes
  useEffect(() => {
    setStartingSkills(workingStartingSkills);
    setSelectedSkills(workingSelectedSkills);
    setSelectedFeats(workingSelectedFeats);
    setSelectedSkillSets(workingSelectedSkillSets);
    setSelectedManeuvers(workingSelectedManeuvers);
    setStartingManeuver(workingStartingManeuver);
  }, [workingStartingSkills, workingSelectedSkills, workingSelectedFeats, workingSelectedSkillSets, workingSelectedManeuvers, workingStartingManeuver]);

  // Ensure skills with free focuses have placeholders for those focuses
  useEffect(() => {
    setWorkingSelectedSkills((prev) => {
      let changed = false;
      let updated = [...prev];

      const allSkillNames = new Set<string>([...prev.map((s) => s.name), ...workingStartingSkills, ...skillsFromSets]);

      allSkillNames.forEach((skillName) => {
        const freeCount = Math.max(0, (skillCounts[skillName] || 0) - 1);
        if (freeCount > 0) {
          const idx = updated.findIndex((s) => s.name === skillName);
          if (idx === -1) {
            updated.push({ name: skillName, focuses: Array(freeCount).fill("") });
            changed = true;
          } else if (updated[idx].focuses.length < freeCount) {
            const focuses = [...updated[idx].focuses];
            while (focuses.length < freeCount) focuses.push("");
            updated[idx] = { ...updated[idx], focuses };
            changed = true;
          }
        }
      });

      return changed ? updated : prev;
    });
  }, [skillCounts, workingStartingSkills, skillsFromSets]);

  // --- Handlers for Toggling Selections ---

  // Update focus for a specific skill
  const updateSkillFocus = (skillName: string, index: number, focus: string) => {
    setWorkingSelectedSkills((prev) => {
      const idx = prev.findIndex((s) => s.name === skillName);
      if (idx === -1) {
        const focuses: string[] = [];
        focuses[index] = focus;
        return [...prev, { name: skillName, focuses }];
      }
      const updated = [...prev];
      const focuses = [...updated[idx].focuses];
      focuses[index] = focus;
      updated[idx] = { ...updated[idx], focuses };
      return updated;
    });
  };

  const addSkillFocus = (skillName: string) => {
    setWorkingSelectedSkills((prev) => {
      const idx = prev.findIndex((s) => s.name === skillName);
      if (idx === -1) {
        return [...prev, { name: skillName, focuses: [""] }];
      }
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        focuses: [...updated[idx].focuses, ""],
      };
      return updated;
    });
  };

  const removeSkillFocus = (skillName: string, index: number) => {
    setWorkingSelectedSkills((prev) => {
      const idx = prev.findIndex((s) => s.name === skillName);
      if (idx === -1) return prev;
      const updated = [...prev];
      const focuses = [...updated[idx].focuses];
      focuses.splice(index, 1);
      updated[idx] = { ...updated[idx], focuses };
      return updated;
    });
  };

  // Toggle selection of an individual skill
  const toggleSkill = (skillName: string) => {
    const exists = workingSelectedSkills.some((s) => s.name === skillName);
    if (exists) {
      // If skill is already selected, remove it
      setWorkingSelectedSkills(workingSelectedSkills.filter((s) => s.name !== skillName));
    } else if (availablePoints >= 1) {
      const skill = skills.find((s) => s.name === skillName);
      if (skill) setWorkingSelectedSkills([...workingSelectedSkills, { name: skill.name, focuses: [] }]);
    }
  };

  // Toggle selection of a skill set
  const toggleSkillSet = (setName: string) => {
    const exists = workingSelectedSkillSets.includes(setName);
    if (exists) {
      // If skill set is already selected, remove it
      setWorkingSelectedSkillSets(workingSelectedSkillSets.filter((s) => s !== setName));
    } else {
      const found = skillSets.find((s) => s.name === setName);
      // Only add if skill set exists and there are enough points
      if (!found || availablePoints < found.points) return;
      setWorkingSelectedSkillSets([...workingSelectedSkillSets, setName]);
    }
  };

  // Toggle selection of a basic starting skill (max 2)
  const toggleStartingSkill = (skill: string) => {
    const isSelected = workingStartingSkills.includes(skill);
    if (isSelected) {
      // If skill is already selected, remove it
      setWorkingStartingSkills(workingStartingSkills.filter((s) => s !== skill));
    } else if (workingStartingSkills.length < 2) { // Allow only up to 2 starting skills
      setWorkingStartingSkills([...workingStartingSkills, skill]);
    }
  };

  // Add a feat to the selected feats list
  const addFeat = (featName: string) => {
    const featToAdd = feats.find((f) => f.name === featName);
    if (!featToAdd) return; // Feat not found

    // Construct character data for prerequisite checks
    const characterData = {
      abilityScores,
      selectedSkills: workingSelectedSkills,
      startingSkills: workingStartingSkills,
      selectedFeats: workingSelectedFeats, // Include current feats for chained prereqs
      selectedSkillSets: workingSelectedSkillSets,
      skillSets,
    };

    // Check if prerequisites are met
    if (!meetsPrerequisites(featToAdd, characterData)) {
      const missing = getMissingPrereqs(featToAdd, characterData);
      alert(`You do not meet the prerequisites for ${featName}.\n\nMissing:\n` + missing.map((req: any) => {
        if (typeof req === 'object') {
          if (req.type === 'ability') return `${req.name} ${req.value}`;
          else if (req.type === 'skill' || req.type === 'startingSkill') return req.name;
          else if (req.type === 'feat') return `Feat: ${req.name}`;
          return JSON.stringify(req);
        }
        return req;
      }).join(', '));
      return;
    }

    // Check if enough points are available (assuming 5 points per feat)
    if (availablePoints < 5) {
        alert("Not enough points to select this feat.");
        return;
    }

    // Add the feat with an empty input field, ready for user selection if needed
    setWorkingSelectedFeats((prev) => [...prev, { name: featName, input: "", free: false }]);
  };

  // Remove a feat by its index in the workingSelectedFeats array
  const removeFeat = (indexToRemove: number) => {
    let removed = false;
    setWorkingSelectedFeats((prev) => {
      const feat = prev[indexToRemove];
      if (feat?.free) return prev; // can't remove free feats
      const updated = prev.filter((_, index) => index !== indexToRemove);
      removed = true;
      return updated;
    });

    if (removed && workingSelectedFeats[indexToRemove]?.name === "Learn Maneuver") {
      const updatedManeuvers = [...workingSelectedManeuvers];
      updatedManeuvers.splice(indexToRemove, 1);
      setWorkingSelectedManeuvers(updatedManeuvers);
    }
  };

  // Remove the most recently added instance of a feat by name
  const removeFeatByName = (featName: string) => {
    setWorkingSelectedFeats((prev) => {
      // find last non-free instance
      let index = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].name === featName && !prev[i].free) { index = i; break; }
      }
      if (index === -1) return prev;
      const updated = prev.filter((_, i) => i !== index);
      // Also remove corresponding maneuver selection if needed
      setWorkingSelectedManeuvers((prevM) => {
        if (prev[index]?.name === "Learn Maneuver") {
          const m = [...prevM];
          m.splice(index, 1);
          return m;
        }
        return prevM;
      });
      return updated;
    });
  };

  // Toggle a feat via checkbox interaction
  const toggleFeat = (featName: string, checked: boolean) => {
    const feat = feats.find((f) => f.name === featName);
    if (!feat) return;

    const characterData = {
      abilityScores,
      selectedSkills: workingSelectedSkills,
      startingSkills: workingStartingSkills,
      selectedFeats: workingSelectedFeats,
      selectedSkillSets: workingSelectedSkillSets,
      skillSets,
    };

    if (!meetsPrerequisites(feat, characterData)) {
      return;
    }

    if (checked) addFeat(featName);
    else removeFeatByName(featName);
  };

  // --- Navigation Handlers ---
  const handlePrevious = () => setCurrentSubStep(0);

  const handleContinue = () => {
    // Validation checks before proceeding to the next step
    if (
      availablePoints !== 0 || // All points must be spent
      workingStartingSkills.length !== 2 || // Exactly two starting skills must be selected
      !workingStartingManeuver // A starting maneuver must be selected
    ) {
      alert(
        "You must spend all 20 points, select 2 starting skills, and pick a starting maneuver before continuing."
      );
      return;
    }

    // Validate that each "Learn Maneuver" feat has a corresponding maneuver selected
    const maneuverFeats = workingSelectedFeats.filter((f) => f.name === "Learn Maneuver");
    if (maneuverFeats.length !== workingSelectedManeuvers.filter(Boolean).length) {
      alert("Please select a maneuver for each 'Learn Maneuver' feat.");
      return;
    }

    // Persist working selections to the global character builder store
    setStartingSkills(workingStartingSkills);
    setSelectedSkills(workingSelectedSkills);
    setSelectedFeats(workingSelectedFeats);
    setSelectedSkillSets(workingSelectedSkillSets);
    setSelectedManeuvers(workingSelectedManeuvers);
    setStartingManeuver(workingStartingManeuver);
    setCurrentStep(6); // Proceed to next main step
    setCurrentSubStep(0);
  };

  return (
    <motion.div className="bg-panel rounded-2xl p-6 comic-border overflow-hidden halftone-bg">
      <h2 className="text-2xl font-comic text-accent mb-4">Step 5: Feats</h2>
      <div className="text-sm text-white mb-4">
        Points Available: <span className="text-accent font-bold">{availablePoints}</span>
      </div>

      <Tabs
        value="feats"
        onValueChange={(value) => {
          if (value !== "feats") {
            setSkillsTab(value);
            setCurrentSubStep(0);
          }
        }}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="starting">Starting</TabsTrigger>
          <TabsTrigger value="skillsets">Skill Sets</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="feats">Feats</TabsTrigger>
        </TabsList>

        <TabsContent value="feats">
          <p className="text-white text-sm mb-2">
            Your hero gets 1 free feat. The first feat chosen costs zero points.
          </p>
          <div className="flex gap-4 mb-4">
            {featTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`filter-${type}`}
                  checked={typeFilter[type]}
                  onCheckedChange={(checked) =>
                    setTypeFilter((prev) => ({ ...prev, [type]: !!checked }))
                  }
                />
                <Label htmlFor={`filter-${type}`} className="capitalize">
                  {type}
                </Label>
              </div>
            ))}
          </div>
          {(() => {
            const characterData = {
              abilityScores,
              selectedSkills: workingSelectedSkills,
              startingSkills: workingStartingSkills,
              selectedFeats: workingSelectedFeats,
              selectedSkillSets: workingSelectedSkillSets,
              skillSets,
            };

            const allFeats = uniqueFeats.filter(
              (f) => !typeFilter || typeFilter[f.type]
            );

            return allFeats.map((feat, index) => {
              const selected = workingSelectedFeats.filter((f) => f.name === feat.name);
              const count = selected.length;
              const missing = getMissingPrereqs(feat, characterData);
              const meetsReqs = missing.length === 0;
              const isDisabled = !meetsReqs;
              const sources = selected.filter(f => f.source).map(f => f.source as string);
              const source = sources.join(', ');
              const locked = sources.length > 0;

          return (
            <div
              key={feat.id ? String(feat.id) : `${feat.name}-${index}`}
              className={`mb-4 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <FeatCard
                feat={feat}
                isSelected={count > 0}
                isDisabled={isDisabled}
                missingPrereqs={missing}
                onToggle={(checked) => toggleFeat(feat.name, checked)}
                showDropdown={feat.name === 'Learn Maneuver' && count > 0}
                maneuvers={feat.name === 'Learn Maneuver' ? maneuvers : undefined}
                source={source}
                locked={locked}
              />

              {count > 0 && (
                <div className="ml-4 mt-2 space-y-2">
                  {workingSelectedFeats
                    .map((f, originalIndex) => ({ ...f, originalIndex }))
                    .filter((f) => f.name === feat.name)
                    .map((f, i) => (
                      <div key={f.originalIndex} className="flex items-center gap-2">
                        <span className="text-sm text-white">{feat.name} #{i + 1}</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFeat(f.originalIndex)}
                          disabled={Boolean(f.free)}
                        >
                          Remove
                        </Button>
                        {feat.name === 'Skill Focus' ? (
                          <select
                            value={workingSelectedFeats[f.originalIndex]?.input || ''}
                            onChange={(e) => {
                              const updated = [...workingSelectedFeats];
                              updated[f.originalIndex].input = e.target.value;
                              setWorkingSelectedFeats(updated);
                            }}
                            className="border rounded p-1 text-black"
                          >
                            <option value="">Select a skill</option>
                            {skills.map((s) => (
                              <option key={s.name} value={s.name}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        ) : feat.input_label && (
                          <input
                            type="text"
                            placeholder={feat.input_label}
                            value={workingSelectedFeats[f.originalIndex]?.input || ''}
                            onChange={(e) => {
                              const updated = [...workingSelectedFeats];
                              updated[f.originalIndex].input = e.target.value;
                              setWorkingSelectedFeats(updated);
                            }}
                            className="border rounded p-1 text-black"
                          />
                        )}
                        {feat.name === 'Learn Maneuver' && (
                          <ManeuverDropdown
                            label={`Select Maneuver #${i + 1}`}
                            value={workingSelectedManeuvers[f.originalIndex] || ''}
                            onChange={(value) => {
                              const updated = [...workingSelectedManeuvers];
                              updated[f.originalIndex] = value;
                              setWorkingSelectedManeuvers(updated);
                            }}
                            maneuvers={maneuvers}
                            meetsPrerequisites={(item) => meetsPrerequisites(item, characterData)}
                            getMissingPrereqs={(item) => getMissingPrereqs(item, characterData)}
                          />
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
            });
          })()}

          <div className="flex justify-between mt-6">
            <Button onClick={handlePrevious}>
              <ArrowLeft className="mr-2 h-5 w-5" /> Previous
            </Button>
            <Button onClick={handleContinue}>
              Next <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Step5_Feats;
