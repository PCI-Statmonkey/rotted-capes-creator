// Step5_Skills.tsx
import { useEffect, useState } from "react";
import axios from "axios";
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
import skillsData from "@/rules/skills.json";
import featsData from "@/rules/Feats.json";
import allSkillSets from "@/rules/skillSets.json";
import ManeuverDropdown from "@/components/ManeuverDropdown";
import SkillSetCard from "@/components/SkillSetCard";
import SkillCard from "@/components/SkillCard";
import FeatCard from "@/components/FeatCard";
import StartingTab from "@/components/StartingTab";

const basicStartingSkills = [
  "Athletics",
  "Drive",
  "Local Knowledge",
  "Basic Technology",
  "Basic Engineering",
  "Urban Survival",
];

const Step5_Skills = () => {
  const [maneuvers, setManeuvers] = useState([]);

  useEffect(() => {
    const fetchManeuvers = async () => {
      try {
        const res = await axios.get("/api/game-content/maneuvers");
        if (Array.isArray(res.data)) {
          setManeuvers(res.data);
        } else {
          console.error("Maneuvers data is not an array:", res.data);
          setManeuvers([]);
        }
      } catch (err) {
        console.error("Failed to load maneuvers:", err);
        setManeuvers([]);
      }
    };
    fetchManeuvers();
  }, []);

  const {
    startingSkills = [],
    setStartingSkills,
    startingFeat,
    setStartingFeat,
    selectedSkills,
    setSelectedSkills,
    selectedFeats,
    setSelectedFeats,
    selectedSkillSets,
    setSelectedSkillSets,
    selectedManeuver,
    setSelectedManeuver,
    setCurrentStep,
  } = useCharacterBuilder();

  const [skills, setSkills] = useState([]);
  const [feats, setFeats] = useState([]);
  const [skillSets, setSkillSets] = useState([]);
  const [availablePoints, setAvailablePoints] = useState(20);
  const [selectedManeuvers, setSelectedManeuvers] = useState([]);

  useEffect(() => {
    try {
      const sortedFeats = [...featsData].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setFeats(sortedFeats);
    } catch (e) {
      console.error("Failed to load feats:", e);
      setFeats([]);
    }
    setSkills(skillsData);
    setSkillSets(allSkillSets);
  }, []);

  useEffect(() => {
    const skillSetPoints = selectedSkillSets.reduce((acc, setName) => {
      const found = skillSets.find((s) => s.name === setName);
      return acc + (found?.points || 0);
    }, 0);
    const pointsUsed =
      selectedSkills.length + selectedFeats.length * 5 + skillSetPoints;
    setAvailablePoints(20 - pointsUsed);
  }, [selectedSkills, selectedFeats, selectedSkillSets, skillSets]);

const meetsPrerequisites = (item) => {
  if (!item?.prerequisites || item.prerequisites.length === 0) return true;

  return item.prerequisites.every((prereq) => {
    if (prereq.type === "skill") {
      return selectedSkills.some((s) => s.name === prereq.name);
    }
    if (prereq.type === "feat") {
      return selectedFeats.some((f) => f.name === prereq.name);
    }
    if (prereq.type === "startingSkill") {
      return startingSkills.includes(prereq.name);
    }
    return false;
  });
};

console.log("Feats available:", feats.map(f => ({ name: f.name, valid: meetsPrerequisites(f) })));

  const getMissingPrereqs = (item) => {
    if (!item?.prerequisites || item.prerequisites.length === 0) return [];
    return item.prerequisites.filter((prereq) => {
      if (prereq.type === "skill") {
        return !selectedSkills.some((s) => s.name === prereq.name);
      }
      if (prereq.type === "feat") {
        return !selectedFeats.some((f) => f.name === prereq.name);
      }
      if (prereq.type === "startingSkill") {
        return !startingSkills.includes(prereq.name);
      }
      return false;
    });
  };

  const toggleSkill = (skillName) => {
    const exists = selectedSkills.find((s) => s.name === skillName);
    if (exists) {
      setSelectedSkills(selectedSkills.filter((s) => s.name !== skillName));
    } else if (availablePoints >= 1) {
      const skill = skills.find((s) => s.name === skillName);
      if (skill) setSelectedSkills([...selectedSkills, { name: skill.name }]);
    }
  };

  const toggleStartingSkill = (skill) => {
    const isSelected = startingSkills.includes(skill);
    if (isSelected) {
      setStartingSkills(startingSkills.filter((s) => s !== skill));
    } else if (startingSkills.length < 2) {
      setStartingSkills([...startingSkills, skill]);
    }
  };

  const updateSkillFocus = (skillName, focus) => {
    setSelectedSkills((prev) =>
      prev.map((s) => (s.name === skillName ? { ...s, focus } : s))
    );
  };

  const addFeat = (featName: string) => {
    const feat = feats.find((f) => f.name === featName);
    if (!feat) return;
    if (availablePoints < 5) return;
    setSelectedFeats([...selectedFeats, { name: featName, input: "" }]);
    setAvailablePoints((prev) => prev - 5);
  };

  const removeFeat = (index: number) => {
    setSelectedFeats(selectedFeats.filter((_, i) => i !== index));
    setAvailablePoints((prev) => prev + 5);
  };

  const toggleSkillSet = (setName) => {
    const exists = selectedSkillSets.includes(setName);
    if (exists) {
      setSelectedSkillSets(selectedSkillSets.filter((s) => s !== setName));
    } else {
      const found = skillSets.find((s) => s.name === setName);
      if (!found) return;
      const cost = found.points;
      if (availablePoints >= cost) {
        setSelectedSkillSets([...selectedSkillSets, setName]);
      }
    }
  };

  const handlePrevious = () => setCurrentStep(4);
  const handleContinue = () => {
  if (
    availablePoints < 0 ||
    !startingFeat || // Make sure the user has selected the startingFeat
    startingSkills.length !== 2
  ) {
    alert("You must spend all points, select 2 starting skills, and choose a feat.");
    return;
  }

  const maneuverFeats = selectedFeats.filter((f) => f.name === "Learn Maneuver");
  if (maneuverFeats.length > 0 && maneuverFeats.length !== selectedManeuvers.filter(Boolean).length) {
    alert("Please select a maneuver for each 'Learn Maneuver' feat.");
    return;
  }

  setCurrentStep(6);
};

return (
  <motion.div className="bg-panel rounded-2xl p-6 comic-border overflow-hidden halftone-bg">
    <h2 className="text-2xl font-comic text-accent mb-4">Step 5: Skills & Feats</h2>
    <div className="text-sm text-white mb-2">
      Points Available: <span className="text-accent font-bold">{availablePoints}</span>
    </div>

    <Tabs defaultValue="starting" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="starting">Starting</TabsTrigger>
        <TabsTrigger value="skillsets">Skill Sets</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="feats">Feats</TabsTrigger>
      </TabsList>

      <TabsContent value="starting">
        <StartingTab
          basicStartingSkills={basicStartingSkills}
          startingSkills={startingSkills}
          toggleStartingSkill={toggleStartingSkill}
          startingFeat={startingFeat}
          setStartingFeat={setStartingFeat}
          selectedManeuver={selectedManeuver}
          setSelectedManeuver={setSelectedManeuver}
          feats={feats}
          maneuvers={maneuvers}
          meetsPrerequisites={meetsPrerequisites}
          getMissingPrereqs={getMissingPrereqs}
        />
      </TabsContent>

      <TabsContent value="skillsets">
        <h3 className="text-white text-md mb-2">Skill Sets</h3>
        {skillSets.map((set) => (
          <SkillSetCard
            key={set.name}
            set={set}
            isSelected={selectedSkillSets.includes(set.name)}
            onToggle={() => toggleSkillSet(set.name)}
          />
        ))}
      </TabsContent>

      <TabsContent value="skills">
        <h3 className="text-white text-md mb-2">Individual Skills</h3>
        {skills.map((skill) => {
          const isSelected = selectedSkills.some((s) => s.name === skill.name);
          const focus = selectedSkills.find((s) => s.name === skill.name)?.focus || "";
          return (
            <SkillCard
              key={skill.name}
              skill={skill}
              isSelected={isSelected}
              focus={focus}
              onToggle={() => toggleSkill(skill.name)}
              onFocusChange={(newFocus) => updateSkillFocus(skill.name, newFocus)}
            />
          );
        })}
      </TabsContent>

      <TabsContent value="feats">
        <h3 className="text-white text-md mb-2">Feats</h3>
        {feats.map((feat) => {
          const count = selectedFeats.filter((f) => f.name === feat.name).length;
          const isDisabled = !meetsPrerequisites(feat);
          const missing = getMissingPrereqs(feat).map((p) => p.name);
          return (
            <div key={feat.name} className="mb-4">
              <FeatCard
                feat={feat}
                isSelected={count > 0}
                isDisabled={isDisabled}
                missingPrereqs={missing}
                onToggle={() => addFeat(feat.name)}
                showDropdown={feat.name === "Learn Maneuver" && count > 0}
                maneuvers={feat.name === "Learn Maneuver" ? maneuvers : undefined}
                selectedManeuver={undefined}
              />
              {count > 0 && (
                <div className="ml-4 mt-2 space-y-2">
                  {selectedFeats
                    .map((f, i) => ({ ...f, index: i }))
                    .filter((f) => f.name === feat.name)
                    .map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-sm text-white">
                          {feat.name} #{i + 1}
                        </span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            removeFeat(
                              selectedFeats.findIndex(
                                (x, idx) => x.name === feat.name && idx >= i
                              )
                            )
                          }
                        >
                          Remove
                        </Button>

                        {feat.name === "Skill Focus" ? (
                          <select
                            value={selectedFeats[f.index]?.input || ""}
                            onChange={(e) => {
                              const updated = [...selectedFeats];
                              updated[f.index].input = e.target.value;
                              setSelectedFeats(updated);
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
                            value={selectedFeats[f.index]?.input || ""}
                            onChange={(e) => {
                              const updated = [...selectedFeats];
                              updated[f.index].input = e.target.value;
                              setSelectedFeats(updated);
                            }}
                            className="border rounded p-1 text-black"
                          />
                        )}

                        {feat.name === "Learn Maneuver" && (
                          <ManeuverDropdown
                            label={`Select Maneuver #${i + 1}`}
                            value={selectedManeuvers[i] || ""}
                            onChange={(value) => {
                              const updated = [...selectedManeuvers];
                              updated[i] = value;
                              setSelectedManeuvers(updated);
                            }}
                            maneuvers={maneuvers}
                            meetsPrerequisites={meetsPrerequisites}
                            getMissingPrereqs={getMissingPrereqs}
                          />
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </TabsContent>
    </Tabs>

    <div className="flex justify-between mt-6">
      <Button onClick={handlePrevious}>
        <ArrowLeft className="mr-2 h-5 w-5" /> Previous
      </Button>
      <Button
        onClick={handleContinue}
        disabled={
          availablePoints < 0 ||
          !startingFeat ||
          startingSkills.length !== 2 ||
          (selectedFeats.some((f) => f.name === "Learn Maneuver") &&
            selectedManeuvers.some((m) => m === ""))
        }
      >
        Next <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  </motion.div>
);
};
export default Step5_Skills;
