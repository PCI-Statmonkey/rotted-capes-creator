import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThreat } from "@/context/ThreatContext";

interface FormData {
  initiative: number;
  pace: string;
  avoidance: number;
  fortitude: number;
  willpower: number;
  stamina: number;
  wounds: number;
  toHitSingle: number;
  toHitArea: number;
  damageMin: number;
  damageMax: number;
  damageAvg: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export default function Step2_Stats() {
  const { threat, updateThreatField, setCurrentStep } = useThreat();
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      initiative: threat.initiative,
      pace: threat.pace,
      avoidance: threat.defenses.avoidance,
      fortitude: threat.defenses.fortitude,
      willpower: threat.defenses.willpower,
      stamina: threat.stamina,
      wounds: threat.wounds,
      toHitSingle: threat.attack.single,
      toHitArea: threat.attack.area,
      damageMin: threat.damage.min,
      damageMax: threat.damage.max,
      damageAvg: threat.damage.avg,
      strength: threat.abilityScores.strength,
      dexterity: threat.abilityScores.dexterity,
      constitution: threat.abilityScores.constitution,
      intelligence: threat.abilityScores.intelligence,
      wisdom: threat.abilityScores.wisdom,
      charisma: threat.abilityScores.charisma,
    },
  });

  const onSubmit = (data: FormData) => {
    updateThreatField("initiative", data.initiative);
    updateThreatField("pace", data.pace);
    updateThreatField("defenses", {
      avoidance: data.avoidance,
      fortitude: data.fortitude,
      willpower: data.willpower,
    });
    updateThreatField("stamina", data.stamina);
    updateThreatField("wounds", data.wounds);
    updateThreatField("attack", { single: data.toHitSingle, area: data.toHitArea });
    updateThreatField("damage", { min: data.damageMin, max: data.damageMax, avg: data.damageAvg });
    updateThreatField("abilityScores", {
      strength: data.strength,
      dexterity: data.dexterity,
      constitution: data.constitution,
      intelligence: data.intelligence,
      wisdom: data.wisdom,
      charisma: data.charisma,
    });
    setCurrentStep(3);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <label>Initiative</label>
        <Input type="number" {...register("initiative", { valueAsNumber: true })} />
      </div>
      <div className="grid gap-2">
        <label>Pace</label>
        <Input {...register("pace")} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <label>Avoidance</label>
          <Input type="number" {...register("avoidance", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <label>Fortitude</label>
          <Input type="number" {...register("fortitude", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <label>Willpower</label>
          <Input type="number" {...register("willpower", { valueAsNumber: true })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label>Stamina</label>
          <Input type="number" {...register("stamina", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <label>Wounds</label>
          <Input type="number" {...register("wounds", { valueAsNumber: true })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label>To Hit (Single)</label>
          <Input type="number" {...register("toHitSingle", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <label>To Hit (Area)</label>
          <Input type="number" {...register("toHitArea", { valueAsNumber: true })} />
        </div>
      </div>
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
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <label>Strength</label>
          <Input type="number" {...register("strength", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <label>Dexterity</label>
          <Input type="number" {...register("dexterity", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <label>Constitution</label>
          <Input type="number" {...register("constitution", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <label>Intelligence</label>
          <Input type="number" {...register("intelligence", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <label>Wisdom</label>
          <Input type="number" {...register("wisdom", { valueAsNumber: true })} />
        </div>
        <div className="grid gap-2">
          <label>Charisma</label>
          <Input type="number" {...register("charisma", { valueAsNumber: true })} />
        </div>
      </div>
      <div className="flex justify-between">
        <Button type="button" onClick={() => setCurrentStep(1)}>Back</Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
