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

const basicStartingSkills = [
  "Athletics",
  "Drive",
  "Local Knowledge",
  "Basic Technology",
  "Basic Engineering",
  "Urban Survival",
];

const Step5_Skills = () => {
  const { abilityScores, archetype } = useCharacterBuilder();
  const updateSkillFocus = (skillName, focus) => {
    setWorkingSelectedSkills((prev) =>
      prev.map((s) => (s.name === skillName ? { ...s, focus } : s))
    );
  };
  const toggleSkill = (skillName) => {
    const exists = workingSelectedSkills.find((s) => s.name === skillName);
    if (exists) {
      setWorkingSelectedSkills(workingSelectedSkills.filter((s) => s.name !== skillName));
    } else if (availablePoints >= 1) {
      const skill = skills.find((s) => s.name === skillName);
      if (skill) setWorkingSelectedSkills([...workingSelectedSkills, { name: skill.name }]);
    }
  };
  const toggleSkillSet = (setName) => {
    const exists = workingSelectedSkillSets.includes(setName);
    if (exists) {
      setWorkingSelectedSkillSets(workingSelectedSkillSets.filter((s) => s !== setName));
    } else {
      const found = skillSets.find((s) => s.name === setName);
      if (!found || availablePoints < found.points) return;
      setWorkingSelectedSkillSets([...workingSelectedSkillSets, setName]);
    }
  };
  const toggleStartingSkill = (skill) => {
    const isSelected = workingStartingSkills.includes(skill);
    if (isSelected) {
      setWorkingStartingSkills(workingStartingSkills.filter((s) => s !== skill));
    } else if (workingStartingSkills.length < 2) {
      setWorkingStartingSkills([...workingStartingSkills, skill]);
    }
  };
  const [maneuvers, setManeuvers] = useState([]);

  const {
    setStartingSkills,
    setSelectedSkills,
    setSelectedFeats,
    setSelectedSkillSets,
    setSelectedManeuver,
    setStartingFeat,
    setCurrentStep,
  } = useCharacterBuilder();

  const [workingStartingSkills, setWorkingStartingSkills] = useState([]);
  const [workingSelectedSkills, setWorkingSelectedSkills] = useState([]);
  const [workingSelectedFeats, setWorkingSelectedFeats] = useState([]);
  const [workingSelectedSkillSets, setWorkingSelectedSkillSets] = useState([]);
  const [workingSelectedManeuvers, setWorkingSelectedManeuvers] = useState([]);
  const [workingStartingFeat, setWorkingStartingFeat] = useState("");

  const [skills, setSkills] = useState([]);
  const [feats, setFeats] = useState([]);
  const [skillSets, setSkillSets] = useState([]);
  const [availablePoints, setAvailablePoints] = useState(20);
  const [currentTab, setCurrentTab] = useState("starting");

  useEffect(() => {
    const fetchManeuvers = async () => {
      try {
        const res = await axios.get("/api/game-content/maneuvers");
        setManeuvers(Array.isArray(res.data) ? res.data : []);
      } catch {
        setManeuvers([]);
      }
    };
    fetchManeuvers();
  }, []);

  useEffect(() => {
    try {
      setFeats([...featsData].sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      setFeats([]);
    }
    setSkills(skillsData);
    setSkillSets(allSkillSets);
  }, []);

  useEffect(() => {
    const skillSetPoints = workingSelectedSkillSets.reduce((acc, setName) => {
      const found = skillSets.find((s) => s.name === setName);
      return acc + (found?.points || 0);
    }, 0);
    const maxSkillSets = archetype === "Highly Trained" ? 3 : 2;
    const limitedSkillSets = workingSelectedSkillSets.slice(0, maxSkillSets);
    const pointsUsed =
      workingSelectedSkills.length + workingSelectedFeats.length * 5 + skillSetPoints;
    setAvailablePoints(20 - pointsUsed);
  }, [workingSelectedSkills, workingSelectedFeats, workingSelectedSkillSets, skillSets]);

  });
};

  const handlePrevious = () => setCurrentStep(4);

  const handleContinue = () => {
    if (
      availablePoints < 0 ||
      !workingStartingFeat ||
      workingStartingSkills.length !== 2
    ) {
      alert("You must spend all points, select 2 starting skills, and choose a feat.");
      return;
    }
    const maneuverFeats = workingSelectedFeats.filter((f) => f.name === "Learn Maneuver");
    if (maneuverFeats.length !== workingSelectedManeuvers.filter(Boolean).length) {
      alert("Please select a maneuver for each 'Learn Maneuver' feat.");
      return;
    }
    setStartingSkills(workingStartingSkills);
    setSelectedSkills(workingSelectedSkills);
    setSelectedFeats(workingSelectedFeats);
    setSelectedSkillSets(workingSelectedSkillSets);
    setSelectedManeuver(workingSelectedManeuvers);
    setStartingFeat(workingStartingFeat);
    setCurrentStep(6);
  };

  // Keep all your existing tab rendering intact — now powered by the working state
  // ⬆ I will regenerate the full render block with everything preserved in the next message if you confirm this logic.

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
            <label>
              <input
                type="checkbox"
                checked={workingStartingSkills.includes(skill)}
                onChange={() => toggleStartingSkill(skill)}
              />
              {skill}
            </label>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="skillsets">
        <h3 className="text-white text-md mb-2">Skill Sets</h3>
        {skillSets.map((set) => (
          <SkillSetCard
            key={set.name}
            set={set}
            isSelected={workingSelectedSkillSets.includes(set.name)}
            onToggle={() => toggleSkillSet(set.name)}
          />
        ))}
      </TabsContent>

      <TabsContent value="skills">
        <h3 className="text-white text-md mb-2">Individual Skills</h3>
        {skills.map((skill) => {
          const isSelected = workingSelectedSkills.some((s) => s.name === skill.name);
          const focus = workingSelectedSkills.find((s) => s.name === skill.name)?.focus || "";
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
        {feats.map((feat) => {
          const count = workingSelectedFeats.filter((f) => f.name === feat.name).length;
          const characterData = {
          abilityScores,
          selectedSkills: workingSelectedSkills,
          startingSkills: workingStartingSkills,
          selectedFeats: workingSelectedFeats,
          selectedSkillSets: workingSelectedSkillSets,
          skillSets,
        };

        const isDisabled = !meetsPrerequisites(feat, characterData);
        const missing = getMissingPrereqs(feat, characterData);


          return (
            <div key={feat.name} className={`mb-4 ${isDisabled ? 'opacity-60' : ''}`} onClick={() => {
              if (isDisabled) {
                alert(`You do not meet the prerequisites for ${feat.name}.\n\nMissing:\n` + missing.join(', '));
              }
            }}>
              <FeatCard
                feat={feat}
                isSelected={count > 0}
                isDisabled={isDisabled}
                missingPrereqs={missing}
                onToggle={() => addFeat(feat.name)}
                showDropdown={feat.name === "Learn Maneuver" && count > 0}
                maneuvers={feat.name === "Learn Maneuver" ? maneuvers : undefined}
              />
              {isDisabled && missing.length > 0 && (
                <ul className="text-sm text-red-500 ml-4 mt-1 list-disc">
                  {missing.map((req, idx) => {
                    let label = req;
                    if (typeof req === 'object') {
                      if (req.type === 'ability') label = `${req.name} ${req.value}`;
                      else if (req.type === 'skill' || req.type === 'startingSkill') label = req.name;
                      else if (req.type === 'feat') label = `Feat: ${req.name}`;
                      else label = JSON.stringify(req);
                    }
                    return <li key={idx}>{label}</li>;
                  })}
                </ul>
              )}

              {count > 0 && (
                <div className="ml-4 mt-2 space-y-2">
                  {workingSelectedFeats
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
                              workingSelectedFeats.findIndex(
                                (x, idx) => x.name === feat.name && idx >= i
                              )
                            )
                          }
                        >
                          Remove
                        </Button>

                        {feat.name === "Skill Focus" ? (
                          <select
                            value={workingSelectedFeats[f.index]?.input || ""}
                            onChange={(e) => {
                              const updated = [...workingSelectedFeats];
                              updated[f.index].input = e.target.value;
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
                            value={workingSelectedFeats[f.index]?.input || ""}
                            onChange={(e) => {
                              const updated = [...workingSelectedFeats];
                              updated[f.index].input = e.target.value;
                              setWorkingSelectedFeats(updated);
                            }}
                            className="border rounded p-1 text-black"
                          />
                        )}

                        {feat.name === "Learn Maneuver" && (
                          <ManeuverDropdown
                            label={`Select Maneuver #${i + 1}`}
                            value={workingSelectedManeuvers[i] || ""}
                            onChange={(value) => {
                              const updated = [...workingSelectedManeuvers];
                              updated[i] = value;
                              setWorkingSelectedManeuvers(updated);
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
        onClick={() => {
          if (currentTab === "starting") setCurrentTab("skillsets");
          else if (currentTab === "skillsets") setCurrentTab("skills");
          else if (currentTab === "skills") setCurrentTab("feats");
          else handleContinue();
        }}
      >
        Next <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  </motion.div>
  );
};

export default Step5_Skills;
