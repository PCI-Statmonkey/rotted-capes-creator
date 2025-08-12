// Step5_Skills.tsx
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useCharacterBuilder } from "@/lib/Stores/characterBuilder";
import ManeuverDropdown from "@/components/ManeuverDropdown";
import SkillSetCard from "@/components/SkillSetCard";
import SkillCard from "@/components/SkillCard";
import { meetsPrerequisites, getMissingPrereqs } from "@/utils/requirementValidator";
import useCachedGameContent from "@/hooks/useCachedGameContent";
import { useCharacter } from "@/context/CharacterContext";

// Basic starting skills list
const basicStartingSkills = [
  "Athletics",
  "Drive",
  "Local Knowledge",
  "Basic Technology",
  "Basic Engineering",
  "Urban Survival",
];

const Step5_Skills = () => {
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
    archetypeSkill,
  } = useCharacterBuilder();
  const { character, setCurrentStep, setCurrentSubStep } = useCharacter();
  const archetype = character.archetype;
  const currentOrigin = character.origin?.split("(")[0].trim();
  const baseSkillPoints = currentOrigin === "Highly Trained" ? 30 : 20;

  const selectedSkillSetNames = useMemo(
    () => (selectedSkillSets || []).map((s: any) => (typeof s === 'string' ? s : s.name)),
    [selectedSkillSets]
  );

  // --- Local state for working selections ---
  const [workingStartingSkills, setWorkingStartingSkills] = useState<string[]>([]);
  const [workingSelectedSkills, setWorkingSelectedSkills] = useState<{ name: string; focuses: string[] }[]>([]);
  // Store selected feats with an optional input for feats like 'Skill Focus' or 'Learn Maneuver'
  const [workingSelectedFeats, setWorkingSelectedFeats] = useState<{ name: string; input?: string | string[]; free?: boolean }[]>([]);
  const [workingSelectedSkillSets, setWorkingSelectedSkillSets] = useState<{ name: string; edges: string[]; deepCutNotes?: string }[]>([]);
  // Maneuvers are stored separately, indexed to correspond with 'Learn Maneuver' feats
  const [workingSelectedManeuvers, setWorkingSelectedManeuvers] = useState<string[]>([]);
  const [workingStartingManeuver, setWorkingStartingManeuver] = useState<string>("");
  const [customSetName, setCustomSetName] = useState("");
  const [customSetEdges, setCustomSetEdges] = useState("");

  // --- Data loaded from JSON and API ---
  const { data: skills } = useCachedGameContent<any>('skills');
  const { data: feats } = useCachedGameContent<any>('feats');
  const { data: skillSets } = useCachedGameContent<any>('skill-sets');
  const { data: maneuvers } = useCachedGameContent<any>('maneuvers');

  const skillsFromSets = useMemo(() => {
    return workingSelectedSkillSets.flatMap((entry) => {
      const found = skillSets.find((s) => s.name === entry.name);
      return (
        found?.skills?.map((s: any) => (typeof s === "string" ? s : s.name)) || []
      );
    });
  }, [workingSelectedSkillSets, skillSets]);

  // Count how many times each skill is granted for free via starting skills or skill sets
  const skillCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (archetypeSkill) {
      counts[archetypeSkill] = (counts[archetypeSkill] || 0) + 1;
    }
    workingStartingSkills.forEach((s) => {
      counts[s] = (counts[s] || 0) + 1;
    });
    workingSelectedSkillSets.forEach((entry) => {
      const found = skillSets.find((s) => s.name === entry.name);
      found?.skills?.forEach((sk: any) => {
        const name = typeof sk === "string" ? sk : sk.name;
        counts[name] = (counts[name] || 0) + 1;
      });
    });
    return counts;
  }, [workingStartingSkills, workingSelectedSkillSets, skillSets, archetypeSkill]);

  const [availablePoints, setAvailablePoints] = useState(baseSkillPoints); // Initial points
  const [currentTab, setCurrentTab] = useState(skillsTab || "starting"); // Current active tab

  useEffect(() => {
    setSkillsTab(currentTab);
  }, [currentTab, setSkillsTab]);

  useEffect(() => {
    if (skillsTab !== currentTab) {
      setCurrentTab(skillsTab || "starting");
    }
  }, [skillsTab]);

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
    const mappedSkills = (selectedSkills || []).map((s: any) => ({
      name: s.name,
      focuses: s.focuses || (s.focus ? [s.focus] : []),
    }));

    if (JSON.stringify(startingSkills) !== JSON.stringify(workingStartingSkills)) {
      setWorkingStartingSkills(startingSkills || []);
    }

    if (JSON.stringify(mappedSkills) !== JSON.stringify(workingSelectedSkills)) {
      setWorkingSelectedSkills(mappedSkills);
    }

    if (JSON.stringify(selectedFeats) !== JSON.stringify(workingSelectedFeats)) {
      setWorkingSelectedFeats(selectedFeats || []);
    }

    if (JSON.stringify(selectedSkillSets) !== JSON.stringify(workingSelectedSkillSets)) {
      setWorkingSelectedSkillSets(selectedSkillSets || []);
    }

    if (
      JSON.stringify(selectedManeuvers) !==
      JSON.stringify(workingSelectedManeuvers)
    ) {
      setWorkingSelectedManeuvers(selectedManeuvers || []);
    }

    if (startingManeuver !== workingStartingManeuver) {
      setWorkingStartingManeuver(startingManeuver || "");
    }
  }, [
    startingSkills,
    selectedSkills,
    selectedFeats,
    selectedSkillSets,
    selectedManeuvers,
    startingManeuver,
  ]);


  // --- Point Calculation Logic ---
  // Recalculate available points whenever selections change
  useEffect(() => {
    const skillSetPoints = workingSelectedSkillSets.reduce((acc, entry) => {
      const found = skillSets.find((s) => s.name === entry.name);
      return acc + (found?.points || 0); // Add points for each selected skill set
    }, 0);

    // Archetype affects maximum skill sets, but current calculation only uses points from selected ones.
    // The 'maxSkillSets' variable can be used for UI validation or display if needed.
    const maxSkillSets = archetype === "Highly Trained" ? 3 : 2;

    // Calculate total points used: 1 point per purchased skill, 5 points per feat, and points from skill sets
    const acquiredSkills = new Set<string>([
      ...workingStartingSkills,
      ...skillsFromSets,
      ...(archetypeSkill ? [archetypeSkill] : []),
    ]);
    const skillCost = workingSelectedSkills.reduce((acc, s) => {
      return acc + (acquiredSkills.has(s.name) ? 0 : 1);
    }, 0);
    const focusPoints = workingSelectedSkills.reduce((acc, s) => {
      const totalFocuses = s.focuses.filter(
        (f) => f.trim() !== "" && f !== "__custom__"
      ).length;
      const freeFocuses = Math.max(0, (skillCounts[s.name] || 0) - 1);
      return acc + Math.max(0, totalFocuses - freeFocuses);
    }, 0);
    const paidFeatCount = workingSelectedFeats.filter((f) => !f.free).length;
    const featCost = Math.max(0, paidFeatCount - 1) * 5; // first paid feat is free
    const pointsUsed = skillCost + focusPoints + featCost + skillSetPoints;
    setAvailablePoints(baseSkillPoints - pointsUsed); // Update available points
  }, [
    workingSelectedSkills,
    workingSelectedFeats,
    workingSelectedSkillSets,
    workingStartingSkills,
    skillSets,
    archetype,
    archetypeSkill,
  ]);

  // Persist selections whenever any working state changes
  useEffect(() => {
    setStartingSkills(workingStartingSkills);
    setSelectedSkills(workingSelectedSkills);
    setSelectedFeats(workingSelectedFeats);
    setSelectedSkillSets(workingSelectedSkillSets.map(({ name, edges, deepCutNotes }) => ({ name, edges, deepCutNotes })) as any);
    setSelectedManeuvers(workingSelectedManeuvers);
    setStartingManeuver(workingStartingManeuver);
  }, [workingStartingSkills, workingSelectedSkills, workingSelectedFeats, workingSelectedSkillSets, workingSelectedManeuvers, workingStartingManeuver]);

  // Ensure skills with free focuses have placeholders for those focuses
  useEffect(() => {
    setWorkingSelectedSkills((prev) => {
      let changed = false;
      let updated = [...prev];

      const allSkillNames = new Set<string>([
        ...prev.map((s) => s.name),
        ...workingStartingSkills,
        ...skillsFromSets,
        ...(archetypeSkill ? [archetypeSkill] : []),
      ]);

      allSkillNames.forEach((skillName) => {
        const skillData = skills.find((s) => s.name === skillName);
        if (skillData?.focusOptions === null) return;
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
  }, [skillCounts, workingStartingSkills, skillsFromSets, archetypeSkill, skills]);

  // --- Handlers for Toggling Selections ---

  // Update focus for a specific skill
  const updateSkillFocus = (skillName: string, index: number, focus: string) => {
    const skill = skills.find((s) => s.name === skillName);
    if (skill?.focusOptions === null) return;
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
    const skill = skills.find((s) => s.name === skillName);
    if (skill?.focusOptions === null) return; // cannot add focus
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
    const skill = skills.find((s) => s.name === skillName);
    if (skill?.focusOptions === null) return;
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
    const exists = workingSelectedSkillSets.some((s) => s.name === setName);
    if (exists) {
      // If skill set is already selected, remove it
      setWorkingSelectedSkillSets(workingSelectedSkillSets.filter((s) => s.name !== setName));
    } else {
      const found = skillSets.find((s) => s.name === setName);
      // Only add if skill set exists and there are enough points
      if (!found || availablePoints < found.points) return;
      setWorkingSelectedSkillSets([...workingSelectedSkillSets, { name: setName, edges: [], deepCutNotes: "" }]);
    }
  };

  const toggleEdge = (setName: string, edge: string) => {
    setWorkingSelectedSkillSets((prev) =>
      prev.map((s) =>
        s.name === setName
          ? {
              ...s,
              edges: s.edges.includes(edge)
                ? s.edges.filter((e) => e !== edge)
                : [...s.edges, edge],
            }
          : s
      )
    );
  };

  const updateDeepCutNotes = (setName: string, notes: string) => {
    setWorkingSelectedSkillSets((prev) =>
      prev.map((s) => (s.name === setName ? { ...s, deepCutNotes: notes } : s))
    );
  };

  const addCustomSkillSet = () => {
    const name = customSetName.trim();
    if (!name) return;
    const edges = customSetEdges
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    setWorkingSelectedSkillSets([...workingSelectedSkillSets, { name, edges, deepCutNotes: "" }]);
    setCustomSetName("");
    setCustomSetEdges("");
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
      selectedSkillSets: workingSelectedSkillSets.map(({ name, edges, deepCutNotes }) => ({ name, edges, deepCutNotes })),
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

    setWorkingSelectedFeats((prev) => [...prev, { name: featName, input: "" }]);
  };

  // Remove a feat by its index in the workingSelectedFeats array
  const removeFeat = (indexToRemove: number) => {
    setWorkingSelectedFeats((prev) => prev.filter((_, index) => index !== indexToRemove));

    // If a 'Learn Maneuver' feat was removed, also clear its corresponding maneuver selection
    if (workingSelectedFeats[indexToRemove]?.name === "Learn Maneuver") {
      const updatedManeuvers = [...workingSelectedManeuvers];
      updatedManeuvers.splice(indexToRemove, 1); // Remove the maneuver at the same index
      setWorkingSelectedManeuvers(updatedManeuvers);
    }
  };

  // Remove the most recently added instance of a feat by name
  const removeFeatByName = (featName: string) => {
    setWorkingSelectedFeats((prev) => {
      const index = prev.map((f) => f.name).lastIndexOf(featName);
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
      selectedSkillSets: workingSelectedSkillSets.map(({ name, edges, deepCutNotes }) => ({ name, edges, deepCutNotes })),
      skillSets,
    };

    if (!meetsPrerequisites(feat, characterData)) {
      return;
    }

    if (checked) addFeat(featName);
    else removeFeatByName(featName);
  };

  // --- Navigation Handlers ---
  const handlePrevious = () => setCurrentStep(4);

  const handleContinue = () => {
    // Prevent navigating forward if points are overspent
    if (availablePoints < 0) {
      alert("You have spent more points than available.");
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
    setSelectedSkillSets(workingSelectedSkillSets.map(({ name, edges, deepCutNotes }) => ({ name, edges, deepCutNotes })) as any);
    setSelectedManeuvers(workingSelectedManeuvers);
    setStartingManeuver(workingStartingManeuver);
    setSkillsTab("feats");
    setCurrentSubStep(1); // Move to feats sub-step
  };

  return (
    <motion.div className="bg-panel rounded-2xl p-6 comic-border overflow-hidden halftone-bg">
      <h2 className="text-2xl font-display text-red-500 mb-4">Step 5: Skills</h2>
      <div className="text-sm text-white mb-2 text-[1.05rem]">
        Points Available: <span className="text-accent font-bold">{availablePoints}</span>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(value) => {
          if (value === "feats") {
            handleContinue();
          } else {
            setCurrentTab(value);
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

        <TabsContent value="starting">
          <h3 className="text-white text-md mb-2">Starting Skills: Pick any two</h3>
          {basicStartingSkills.map((skill) => (
            <div key={skill} className="text-white">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-accent rounded focus:ring-accent"
                  checked={workingStartingSkills.includes(skill)}
                  onChange={() => toggleStartingSkill(skill)}
                />
                <span>{skill}</span>
              </label>
            </div>
          ))}


          <h3 className="text-white text-md mt-4 mb-2">Starting Maneuver: Pick one</h3>
          <select
            value={workingStartingManeuver}
            onChange={(e) => setWorkingStartingManeuver(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-accent focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option className="text-accent" value="">Select a starting maneuver</option>
            {maneuvers
              .filter((m) =>
                meetsPrerequisites(
                  { prerequisites: m.requirements },
                  {
                    abilityScores,
                    selectedSkills: workingSelectedSkills,
                    startingSkills: workingStartingSkills,
                    selectedFeats: workingSelectedFeats,
                    selectedSkillSets: workingSelectedSkillSets.map(({ name, edges, deepCutNotes }) => ({ name, edges, deepCutNotes })),
                    skillSets,
                  }
                )
              )
              .map((m) => (
                <option key={m.name} value={m.name} className="text-accent">
                  {m.name}
                </option>
              ))}
          </select>
        </TabsContent>

        <TabsContent value="skillsets">
          <h3 className="text-white text-md mb-2">Skill Sets</h3>
          <div className="mb-4 flex flex-col gap-2">
            <Input
              placeholder="Custom skill set name"
              value={customSetName}
              onChange={(e) => setCustomSetName(e.target.value)}
            />
            <Input
              placeholder="Edges (comma separated)"
              value={customSetEdges}
              onChange={(e) => setCustomSetEdges(e.target.value)}
            />
            <Button onClick={addCustomSkillSet}>Add Custom Skill Set</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillSets.map((set) => {
              const selected = workingSelectedSkillSets.find((s) => s.name === set.name);
              return (
                <SkillSetCard
                  key={set.name}
                  set={set}
                  isSelected={!!selected}
                  onToggle={() => toggleSkillSet(set.name)}
                  selectedEdges={selected?.edges || []}
                  onEdgeToggle={(edge) => toggleEdge(set.name, edge)}
                  deepCutNotes={selected?.deepCutNotes || ""}
                  onDeepCutNotesChange={(val) => updateDeepCutNotes(set.name, val)}
                />
              );
            })}
            {workingSelectedSkillSets
              .filter((s) => !skillSets.some((set) => set.name === s.name))
              .map((s) => (
                <SkillSetCard
                  key={s.name}
                  set={{ name: s.name, points: 0, description: "Custom skill set", edges: s.edges, feats: [], skills: [] }}
                  isSelected={true}
                  onToggle={() => toggleSkillSet(s.name)}
                  selectedEdges={s.edges}
                  onEdgeToggle={(edge) => toggleEdge(s.name, edge)}
                  deepCutNotes={s.deepCutNotes || ""}
                  onDeepCutNotesChange={(val) => updateDeepCutNotes(s.name, val)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <h3 className="text-white text-md mb-2">Individual Skills</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => {
              const fromSkillSet = skillsFromSets.includes(skill.name);
              const startingSkill = workingStartingSkills.includes(skill.name);
              const fromArchetype = archetypeSkill === skill.name;
              const isSelected =
                fromSkillSet ||
                startingSkill ||
                fromArchetype ||
                workingSelectedSkills.some((s) => s.name === skill.name);
              const focuses =
                workingSelectedSkills.find((s) => s.name === skill.name)?.focuses || [];
              const freeFocus = (skillCounts[skill.name] || 0) > 1;
              return (
                <SkillCard
                  key={skill.name}
                  skill={skill}
                  isSelected={isSelected}
                  focuses={focuses}
                  autoSelected={fromSkillSet || startingSkill || fromArchetype}
                  freeFocus={freeFocus}
                  onToggle={() => toggleSkill(skill.name)}
                  onFocusChange={(index, newFocus) => updateSkillFocus(skill.name, index, newFocus)}
                  onAddFocus={() => addSkillFocus(skill.name)}
                  onRemoveFocus={(index) => removeSkillFocus(skill.name, index)}
                />
              );
            })}
          </div>
        </TabsContent>

      </Tabs>

      <div className="flex justify-between mt-6">
        <Button onClick={handlePrevious}>
          <ArrowLeft className="mr-2 h-5 w-5" /> Previous
        </Button>
        <Button
          onClick={() => {
            // Logic to navigate between tabs or continue to the next step
            if (currentTab === "starting") setCurrentTab("skillsets");
            else if (currentTab === "skillsets") setCurrentTab("skills");
            else handleContinue(); // If on the last tab, call handleContinue
          }}
        >
          Next <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default Step5_Skills;
