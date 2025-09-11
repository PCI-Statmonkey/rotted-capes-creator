import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThreat } from "@/context/ThreatContext";
import { getThreatParameter } from "@/data/threatParameters";
import { calculateThreatMods } from "@/utils/threatModifiers";

interface AttackFormData {
  toHitSingle: number;
  toHitArea: number;
  damageMin: number;
  damageMax: number;
  damageAvg: number;
}

export default function Step3_Traits() {
  const {
    threat,
    addTrait,
    removeTrait,
    addSkillSet,
    removeSkillSet,
    updateThreatField,
    setCurrentStep,
    resetThreat,
  } = useThreat();
  const [trait, setTrait] = useState("");
  const [skill, setSkill] = useState("");

  const params = getThreatParameter(threat.rank);
  const mods = calculateThreatMods(threat);
  const toHitSingleDefault =
    params && threat.attack.single === params.toHit[0]
      ? threat.attack.single + mods.toHit
      : threat.attack.single;
  const toHitAreaDefault =
    params && threat.attack.area === params.toHit[1]
      ? threat.attack.area + mods.toHit
      : threat.attack.area;

  const { register, handleSubmit, reset } = useForm<AttackFormData>({
    defaultValues: {
      toHitSingle: toHitSingleDefault,
      toHitArea: toHitAreaDefault,
      damageMin: threat.damage.min,
      damageMax: threat.damage.max,
      damageAvg: threat.damage.avg,
    },
  });

  useEffect(() => {
    reset({
      toHitSingle: toHitSingleDefault,
      toHitArea: toHitAreaDefault,
      damageMin: threat.damage.min,
      damageMax: threat.damage.max,
      damageAvg: threat.damage.avg,
    });
  }, [threat, reset, toHitSingleDefault, toHitAreaDefault]);

  const onSubmit = (data: AttackFormData) => {
    updateThreatField("attack", { single: data.toHitSingle, area: data.toHitArea });
    updateThreatField("damage", {
      min: data.damageMin,
      max: data.damageMax,
      avg: data.damageAvg,
    });
    setCurrentStep(4);
  };

  const addTraitHandler = () => {
    if (trait.trim()) {
      addTrait(trait.trim());
      setTrait("");
    }
  };

  const addSkillHandler = () => {
    if (skill.trim()) {
      addSkillSet(skill.trim());
      setSkill("");
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="destructive"
        className="absolute top-0 right-0"
        onClick={resetThreat}
      >
        Start Over
      </Button>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-12">
      <div className="flex gap-4">
        <div className="flex flex-col">
          <label>To Hit (Single)</label>
          <Input
            className="w-20"
            type="number"
            {...register("toHitSingle", { valueAsNumber: true })}
          />
        </div>
        <div className="flex flex-col">
          <label>To Hit (Area)</label>
          <Input
            className="w-20"
            type="number"
            {...register("toHitArea", { valueAsNumber: true })}
          />
        </div>
      </div>
      {mods.notes.toHit.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {mods.notes.toHit.join(", ")}
        </p>
      )}
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <label>Damage Min</label>
          <Input type="number" {...register("damageMin", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <label>Damage Max</label>
          <Input type="number" {...register("damageMax", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <label>Damage Avg</label>
          <Input type="number" {...register("damageAvg", { valueAsNumber: true })} />
        </div>
      </div>
      <div>
        <label className="block mb-2">Traits</label>
        <div className="flex space-x-2 mb-2">
          <Input value={trait} onChange={(e) => setTrait(e.target.value)} />
          <Button type="button" onClick={addTraitHandler}>Add</Button>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          {threat.traits.map((t, i) => (
            <li key={i} className="flex justify-between">
              <span>{t}</span>
              <Button variant="ghost" type="button" onClick={() => removeTrait(i)}>Remove</Button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <label className="block mb-2">Skill Sets</label>
        <div className="flex space-x-2 mb-2">
          <Input value={skill} onChange={(e) => setSkill(e.target.value)} />
          <Button type="button" onClick={addSkillHandler}>Add</Button>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          {threat.skillSets.map((s, i) => (
            <li key={i} className="flex justify-between">
              <span>{s}</span>
              <Button variant="ghost" type="button" onClick={() => removeSkillSet(i)}>Remove</Button>
            </li>
          ))}
        </ul>
      </div>
        <div className="flex justify-end gap-2">
          <Button type="button" onClick={() => setCurrentStep(2)}>Back</Button>
          <Button type="submit">Next</Button>
        </div>
      </form>
    </div>
  );
}
