// Step5_Skills.tsx
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import FeatCard from "@/components/FeatCard";
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
    startingFeat,
  } = useCharacterBuilder();
  const { character } = useCharacter();
  const archetype = character.archetype;

  // --- Local state for working selections ---
  const [workingStartingSkills, setWorkingStartingSkills] = useState<string[]>([]);
  const [workingSelectedSkills, setWorkingSelectedSkills] = useState<{ name: string; focus?: string }[]>([]);
  // Store selected feats with an optional input for feats like 'Skill Focus' or 'Learn Maneuver'
  const [workingSelectedFeats, setWorkingSelectedFeats] = useState<{ name: string; input?: string }[]>([]);
  const [workingSelectedSkillSets, setWorkingSelectedSkillSets] = useState<string[]>([]);
  // Maneuvers are stored separately, indexed to correspond with 'Learn Maneuver' feats
  const [workingSelectedManeuvers, setWorkingSelectedManeuvers] = useState<string[]>([]);
  const [workingStartingFeat, setWorkingStartingFeat] = useState<string>(""); // State for the single starting feat

  // --- Data loaded from JSON and API ---
  const { data: skills } = useCachedGameContent<any>('skills');
  const { data: feats } = useCachedGameContent<any>('feats');
  const { data: skillSets } = useCachedGameContent<any>('skill-sets');
  const { data: maneuvers } = useCachedGameContent<any>('maneuvers');

  const skillsFromSets = useMemo(() => {
    return workingSelectedSkillSets.flatMap((setName) => {
      const found = skillSets.find((s) => s.name === setName);
      return (
        found?.skills?.map((s: any) => (typeof s === "string" ? s : s.name)) || []
      );
    });
  }, [workingSelectedSkillSets, skillSets]);

  const [availablePoints, setAvailablePoints] = useState(20); // Initial points
  const [currentTab, setCurrentTab] = useState("starting"); // Current active tab

  // Destructure character builder setters to persist selections
  const {
    setStartingSkills,
    setSelectedSkills,
    setSelectedFeats,
    setSelectedSkillSets,
    setSelectedManeuvers,
    setStartingFeat,
    setCurrentStep,
  } = useCharacterBuilder();

  // --- Data Fetching & Initialization ---
  // Data is fetched and cached via useCachedGameContent hook
  useEffect(() => {
    if (startingSkills) setWorkingStartingSkills(startingSkills);
    if (selectedSkills) setWorkingSelectedSkills(selectedSkills);
    if (selectedFeats) setWorkingSelectedFeats(selectedFeats as any);
    if (selectedSkillSets) setWorkingSelectedSkillSets(selectedSkillSets);
    if (selectedManeuvers) setWorkingSelectedManeuvers(selectedManeuvers);
    if (startingFeat) setWorkingStartingFeat(startingFeat);
  }, []);


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
    const pointsUsed =
      workingSelectedSkills.length + workingSelectedFeats.length * 5 + skillSetPoints;
    setAvailablePoints(20 - pointsUsed); // Update available points
  }, [workingSelectedSkills, workingSelectedFeats, workingSelectedSkillSets, skillSets, archetype]);

  // Persist selections whenever any working state changes
  useEffect(() => {
    setStartingSkills(workingStartingSkills);
    setSelectedSkills(workingSelectedSkills);
    setSelectedFeats(workingSelectedFeats);
    setSelectedSkillSets(workingSelectedSkillSets);
    setSelectedManeuvers(workingSelectedManeuvers);
    setStartingFeat(workingStartingFeat);
  }, [workingStartingSkills, workingSelectedSkills, workingSelectedFeats, workingSelectedSkillSets, workingSelectedManeuvers, workingStartingFeat]);

  // --- Handlers for Toggling Selections ---

  // Update focus for a specific skill
  const updateSkillFocus = (skillName: string, focus: string) => {
    setWorkingSelectedSkills((prev) =>
      prev.map((s) => (s.name === skillName ? { ...s, focus } : s))
    );
  };

  // Toggle selection of an individual skill
  const toggleSkill = (skillName: string) => {
    const exists = workingSelectedSkills.some((s) => s.name === skillName);
    if (exists) {
      // If skill is already selected, remove it
      setWorkingSelectedSkills(workingSelectedSkills.filter((s) => s.name !== skillName));
    } else if (availablePoints >= 1) { // Only add if enough points (assuming 1 point per skill)
      const skill = skills.find((s) => s.name === skillName);
      if (skill) setWorkingSelectedSkills([...workingSelectedSkills, { name: skill.name }]);
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
    if (checked) addFeat(featName);
    else removeFeatByName(featName);
  };

  // --- Navigation Handlers ---
  const handlePrevious = () => setCurrentStep(4);

  const handleContinue = () => {
    // Validation checks before proceeding to the next step
    if (
      availablePoints < 0 || // Points must not be negative
      !workingStartingFeat || // A starting feat must be selected
      workingStartingSkills.length !== 2 // Exactly two starting skills must be selected
    ) {
      alert("You must spend all points (or have 0 remaining), select 2 starting skills, and choose a starting feat.");
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
    setStartingFeat(workingStartingFeat);
    setCurrentStep(6); // Move to the next step
  };

  return (
    <motion.div className="bg-panel rounded-2xl p-6 comic-border overflow-hidden halftone-bg">
      <h2 className="text-2xl font-comic text-accent mb-4">Step 5: Skills & Feats</h2>
      <div className="text-sm text-white mb-2">
        Points Available: <span className="text-accent font-bold">{availablePoints}</span>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
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

          {/* Section for selecting a starting feat */}
          <h3 className="text-white text-md mt-4 mb-2">Starting Feat: Pick one</h3>
          <select
            value={workingStartingFeat}
            onChange={(e) => setWorkingStartingFeat(e.target.value)}
            className="border rounded p-2 text-black w-full bg-white focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select a starting feat</option>
            {feats.map((feat) => (
              <option key={feat.name} value={feat.name}>
                {feat.name}
              </option>
            ))}
          </select>
        </TabsContent>

        <TabsContent value="skillsets">
          <h3 className="text-white text-md mb-2">Skill Sets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillSets.map((set) => (
              <SkillSetCard
                key={set.name}
                set={set}
                isSelected={workingSelectedSkillSets.includes(set.name)}
                onToggle={() => toggleSkillSet(set.name)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <h3 className="text-white text-md mb-2">Individual Skills</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => {
              const fromSkillSet = skillsFromSets.includes(skill.name);
              const isSelected =
                fromSkillSet ||
                workingSelectedSkills.some((s) => s.name === skill.name) ||
                workingStartingSkills.includes(skill.name);
              const focus =
                workingSelectedSkills.find((s) => s.name === skill.name)?.focus || "";
              return (
                <SkillCard
                  key={skill.name}
                  skill={skill}
                  isSelected={isSelected}
                  focus={focus}
                  fromSkillSet={fromSkillSet}
                  onToggle={() => toggleSkill(skill.name)}
                  onFocusChange={(newFocus) => updateSkillFocus(skill.name, newFocus)}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="feats">
          {(() => {
            // Prepare character data for prerequisite checks dynamically
            const characterData = {
              abilityScores,
              selectedSkills: workingSelectedSkills,
              startingSkills: workingStartingSkills,
              selectedFeats: workingSelectedFeats, // Include current feats for chained prereqs
              selectedSkillSets: workingSelectedSkillSets,
              skillSets,
            };

            // Map through all available feats to render them
            return feats.map((feat) => {
              // Count how many times this specific feat is already selected
              const count = workingSelectedFeats.filter((f) => f.name === feat.name).length;

              // Determine if the feat's prerequisites are met
              const isDisabled = !meetsPrerequisites(feat, characterData);
              const missing = getMissingPrereqs(feat, characterData); // Get details of missing prerequisites

              return (
                <div key={feat.name} className={`mb-4 ${isDisabled ? 'opacity-50' : ''}`}>
                  <FeatCard
                    feat={feat}
                    isSelected={count > 0} // Is this feat type selected at least once?
                    isDisabled={isDisabled} // Is this feat disabled due to prereqs?
                    missingPrereqs={missing} // Pass missing prereqs for display in card
                    onToggle={(checked) => toggleFeat(feat.name, checked)}
                    showDropdown={feat.name === "Learn Maneuver" && count > 0} // Show dropdown if 'Learn Maneuver' is selected
                    maneuvers={feat.name === "Learn Maneuver" ? maneuvers : undefined} // Pass maneuvers data for dropdown
                  />

                    
{/* Render input fields and remove buttons for each instance of a selected feat */}
                  {count > 0 && (
                    <div className="ml-4 mt-2 space-y-2">
                      {workingSelectedFeats
                        // Map with original index to correctly update state
                        .map((f, originalIndex) => ({ ...f, originalIndex }))
                        // Filter to only show instances of the current feat being rendered
                        .filter((f) => f.name === feat.name)
                        // Map again to render each instance (using 'i' for current instance's order)
                        .map((f, i) => (
                          <div key={f.originalIndex} className="flex items-center gap-2">
                            <span className="text-sm text-white">
                              {feat.name} #{i + 1}
                            </span>
                            <Button
                              size="sm"
                              variant="destructive"
                              // Remove the specific instance using its original index
                              onClick={() => removeFeat(f.originalIndex)}
                            >
                              Remove
                            </Button>

                            {/* Render specific input based on feat type */}
                            {feat.name === "Skill Focus" ? (
                              <select
                                value={workingSelectedFeats[f.originalIndex]?.input || ""}
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
                            ) : feat.input_label && ( // Generic text input for other feats with input_label
                              <input
                                type="text"
                                placeholder={feat.input_label}
                                value={workingSelectedFeats[f.originalIndex]?.input || ""}
                                onChange={(e) => {
                                  const updated = [...workingSelectedFeats];
                                  updated[f.originalIndex].input = e.target.value;
                                  setWorkingSelectedFeats(updated);
                                }}
                                className="border rounded p-1 text-black"
                              />
                            )}

                            {/* Maneuver dropdown for 'Learn Maneuver' feat */}
                            {feat.name === "Learn Maneuver" && (
                              <ManeuverDropdown
                                label={`Select Maneuver #${i + 1}`}
                                value={workingSelectedManeuvers[f.originalIndex] || ""}
                                onChange={(value) => {
                                  const updated = [...workingSelectedManeuvers];
                                  // Update the maneuver at the correct original index
                                  updated[f.originalIndex] = value;
                                  setWorkingSelectedManeuvers(updated);
                                }}
                                maneuvers={maneuvers}
                                meetsPrerequisites={(item) =>
                                  meetsPrerequisites(item, characterData)
                                }
                                getMissingPrereqs={(item) =>
                                  getMissingPrereqs(item, characterData)
                                }
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ); // End of the 'return' for feats.map
            });
          })()}
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
            else if (currentTab === "skills") setCurrentTab("feats");
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
