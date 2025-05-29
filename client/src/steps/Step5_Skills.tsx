import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCharacterBuilder } from "@/lib/Stores/characterBuilder";
import skillsData from "@/rules/skills.json";
import featsData from "@/rules/Feats.json";
import allSkillSets from "@/rules/skillSets.json";
import Select from "react-select";

const basicStartingSkills = [
  "Athletics", "Drive", "Local Knowledge", "Basic Technology", "Basic Engineering", "Urban Survival"
];

const maneuvers = [
  "Defensive Attack", "Defensive Stance", "Power Attack", "Grab", "Trip",
  "All-Out Attack", "Block", "Charge", "Disarm", "Feint", "Grapple"
];

const Step5_Skills = () => {
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

  useEffect(() => {
    try {
      const sortedFeats = [...featsData].sort((a, b) => a.name.localeCompare(b.name));
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
      const found = skillSets.find(s => s.name === setName);
      return acc + (found?.points || 0);
    }, 0);
    const pointsUsed = selectedSkills.length + selectedFeats.length * 5 + skillSetPoints;
    setAvailablePoints(20 - pointsUsed);
  }, [selectedSkills, selectedFeats, selectedSkillSets, skillSets]);

  // Debug: Log loaded feats
  console.log("Feats loaded:", feats.length, feats.map(f => f.name));

  const toggleSkill = (skillName) => {
    const exists = selectedSkills.find(s => s.name === skillName);
    if (exists) {
      setSelectedSkills(selectedSkills.filter(s => s.name !== skillName));
    } else if (availablePoints >= 1) {
      const skill = skills.find(s => s.name === skillName);
      if (skill) setSelectedSkills([...selectedSkills, { name: skill.name }]);
    }
  };

  const toggleStartingSkill = (skill) => {
    const isSelected = startingSkills.includes(skill);
    if (isSelected) {
      setStartingSkills(startingSkills.filter(s => s !== skill));
    } else if (startingSkills.length < 2) {
      setStartingSkills([...startingSkills, skill]);
    }
  };

  const updateSkillFocus = (skillName, focus) => {
    setSelectedSkills(prev =>
      prev.map(s => (s.name === skillName ? { ...s, focus } : s))
    );
  };

  const toggleFeat = (featName) => {
    const exists = selectedFeats.includes(featName);
    if (exists) {
      setSelectedFeats(selectedFeats.filter(f => f !== featName));
    } else if (availablePoints >= 5) {
      setSelectedFeats([...selectedFeats, featName]);
    }
  };

  const toggleSkillSet = (setName) => {
    const exists = selectedSkillSets.includes(setName);
    if (exists) {
      setSelectedSkillSets(selectedSkillSets.filter(s => s !== setName));
    } else {
      const found = skillSets.find(s => s.name === setName);
      if (!found) return;
      const cost = found.points;
      if (availablePoints >= cost) {
        setSelectedSkillSets([...selectedSkillSets, setName]);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(4);
  };

  const handleContinue = () => {
    if (availablePoints < 0 || !selectedManeuver || !startingFeat || startingSkills.length !== 2) return;
    setCurrentStep(6);
  };

  return (
    <motion.div className="bg-panel rounded-2xl p-6 comic-border overflow-hidden halftone-bg">
      <h2 className="font-comic text-3xl text-accent tracking-wide mb-4">Step 5: Skills & Feats</h2>

      <div className="flex justify-between items-center p-4 bg-gray-800 rounded-lg border border-gray-700 mb-6">
        <span className="text-gray-400">Points Available: </span>
        <span className={`${availablePoints < 0 ? 'text-red-500' : 'text-accent'}`}>{availablePoints}</span>
        <span className="text-gray-400"> / 20</span>
      </div>

      <Tabs defaultValue="start">
        <TabsList className="w-full grid grid-cols-5 mb-4">
          <TabsTrigger value="start">Starting</TabsTrigger>
          <TabsTrigger value="sets">Skill Sets</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="feats">Feats</TabsTrigger>
          <TabsTrigger value="maneuvers">Maneuvers</TabsTrigger>
        </TabsList>

        <TabsContent value="start" className="space-y-4">
          <div>
            <Label>Select 2 Starting Skills</Label>
            <div className="grid grid-cols-2 gap-2">
              {basicStartingSkills.map(skill => (
                <Button
                  key={skill}
                  variant={(startingSkills?.includes(skill) ?? false) ? "default" : "outline"}
                  onClick={() => toggleStartingSkill(skill)}
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Choose a Starting Feat</Label>
            <Select
            value={feats.find(f => f.name === startingFeat) || null}
            onChange={option => setStartingFeat(option ? option.name : "")}
            options={feats}
            getOptionLabel={option => option.name}
            getOptionValue={option => option.name}
            placeholder="-- Select --"
            isClearable
            menuPlacement="auto"
            maxMenuHeight={300}
            menuPortalTarget={document.body}
            styles={{
            menu: provided => ({
                ...provided,
                zIndex: 9999,
           }),
            menuList: provided => ({
              ...provided,
            maxHeight: 300,
    }),
    menuPortal: base => ({
      ...base,
      zIndex: 99999,
    }),
    control: provided => ({
      ...provided,
      backgroundColor: "#23272f",
      color: "#fff",
      borderColor: "#444",
      fontFamily: "'Comic Neue', sans-serif",
      fontWeight: 300,
    }),
    singleValue: provided => ({
      ...provided,
      color: "#fff",
      fontFamily: "'Comic Neue', sans-serif",
      fontWeight: 300,
      fontStyle: "normal",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#e11d48" : state.isFocused ? "#444" : "#23272f",
      color: "#fff",
      fontFamily: "'Comic Neue', sans-serif",
      fontWeight: 300,
      fontStyle: "normal",
    }),
  }}
            />
          </div>
          
        </TabsContent>

        <TabsContent value="sets" className="space-y-2">
          {skillSets.map(set => {
            const isSelected = selectedSkillSets.includes(set.name);
            return (
              <div key={set.name} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleSkillSet(set.name)} />
                    {set.name} ({set.points} pts)
                  </Label>
                </div>
                <div className="text-xs mt-2 text-gray-300">
                  Skills: {set.skills.map(s => s.name).join(', ')}<br />
                  Feats: {set.feats.join(', ')}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="skills" className="space-y-2">
          {skills.map(skill => {
            const isSelected = selectedSkills.find(s => s.name === skill.name);
            return (
              <div key={skill.name} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <Label className="flex items-center gap-2">
                  <Checkbox checked={!!isSelected} onCheckedChange={() => toggleSkill(skill.name)} />
                  {skill.name}
                  {isSelected && skill.allowsFocus && (
                    <Input
                      placeholder="Focus"
                      value={isSelected.focus || ""}
                      onChange={(e) => updateSkillFocus(skill.name, e.target.value)}
                      className="ml-4 text-sm w-48"
                    />
                  )}
                </Label>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="feats" className="space-y-2">
          {feats.map(feat => {
            const isSelected = selectedFeats.includes(feat.name);
            return (
              <div key={feat.name} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                <Label className="flex items-center gap-2">
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleFeat(feat.name)} />
                  {feat.name} — {feat.description}
                </Label>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="maneuvers" className="space-y-2">
          <Label className="text-sm">Select 1 Starting Maneuver</Label>
          <select
            value={selectedManeuver || ""}
            onChange={(e) => setSelectedManeuver(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
          >
            <option value="">-- Select --</option>
            {maneuvers.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-8 pt-4 border-t-2 border-gray-700">
        <Button onClick={handlePrevious}>
          <ArrowLeft className="mr-2 h-5 w-5" /> Previous
        </Button>
        <Button onClick={handleContinue} disabled={availablePoints < 0 || !selectedManeuver || !startingFeat || startingSkills.length !== 2}>
          Next <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default Step5_Skills;