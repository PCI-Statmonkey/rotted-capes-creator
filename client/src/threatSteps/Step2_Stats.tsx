import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThreat } from "@/context/ThreatContext";
import { getThreatParameter } from "@/data/threatParameters";
import { calculateThreatMods } from "@/utils/threatModifiers";

interface FormData {
  initiative: number;
  pace: string;
  avoidance: number;
  fortitude: number;
  willpower: number;
  stamina: number;
  wounds: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export default function Step2_Stats() {
  const { threat, updateThreatField, setCurrentStep } = useThreat();
  const params = getThreatParameter(threat.rank);
  const mods = calculateThreatMods(threat);
  const avoidanceDefault =
    params && threat.defenses.avoidance === params.defenses[0]
      ? threat.defenses.avoidance + mods.avoidance
      : threat.defenses.avoidance;
  const willpowerDefault =
    params && threat.defenses.willpower === params.defenses[2]
      ? threat.defenses.willpower + mods.willpower
      : threat.defenses.willpower;
  const staminaDefault =
    params && threat.stamina === params.stamina
      ? threat.stamina * mods.staminaMult + mods.stamina
      : threat.stamina;
  const woundsDefault =
    params && threat.wounds === params.wounds
      ? threat.wounds + mods.wounds
      : threat.wounds;

  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      initiative: threat.initiative,
      pace: threat.pace,
      avoidance: avoidanceDefault,
      fortitude: threat.defenses.fortitude,
      willpower: willpowerDefault,
      stamina: staminaDefault,
      wounds: woundsDefault,
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
      <div className="flex gap-4">
        <div className="flex flex-col">
          <label>Initiative</label>
          <Input
            className="w-20"
            type="number"
            {...register("initiative", { valueAsNumber: true })}
          />
        </div>
        <div className="flex flex-col">
          <label>Pace</label>
          <Input className="w-20" {...register("pace")} />
        </div>
      </div>
      <div>
        <label className="block mb-1">Defenses</label>
        <div className="flex gap-2">
          <div className="flex flex-col items-center">
            <span className="text-xs">Avoid</span>
            <Input
              className="w-12 text-center"
              type="number"
              {...register("avoidance", { valueAsNumber: true })}
            />
            {mods.notes.avoidance.length > 0 && (
              <p className="text-[10px] text-muted-foreground text-center">
                {mods.notes.avoidance.join(", ")}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs">Fort</span>
            <Input
              className="w-12 text-center"
              type="number"
              {...register("fortitude", { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs">Will</span>
            <Input
              className="w-12 text-center"
              type="number"
              {...register("willpower", { valueAsNumber: true })}
            />
            {mods.notes.willpower.length > 0 && (
              <p className="text-[10px] text-muted-foreground text-center">
                {mods.notes.willpower.join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <span className="text-xs">Stamina</span>
          <Input
            className="w-16 text-center"
            type="number"
            {...register("stamina", { valueAsNumber: true })}
          />
          {mods.notes.stamina.length > 0 && (
            <p className="text-[10px] text-muted-foreground text-center">
              {mods.notes.stamina.join(", ")}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs">Wounds</span>
          <Input
            className="w-16 text-center"
            type="number"
            {...register("wounds", { valueAsNumber: true })}
          />
          {mods.notes.wounds.length > 0 && (
            <p className="text-[10px] text-muted-foreground text-center">
              {mods.notes.wounds.join(", ")}
            </p>
          )}
        </div>
      </div>
      <div>
        <label className="block mb-1">Ability Scores</label>
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col items-center">
            <span className="text-xs">STR</span>
            <Input
              className="w-12 text-center"
              type="number"
              {...register("strength", { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs">DEX</span>
            <Input
              className="w-12 text-center"
              type="number"
              {...register("dexterity", { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs">CON</span>
            <Input
              className="w-12 text-center"
              type="number"
              {...register("constitution", { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs">INT</span>
            <Input
              className="w-12 text-center"
              type="number"
              {...register("intelligence", { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs">WIS</span>
            <Input
              className="w-12 text-center"
              type="number"
              {...register("wisdom", { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs">CHA</span>
            <Input
              className="w-12 text-center"
              type="number"
              {...register("charisma", { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <Button type="button" onClick={() => setCurrentStep(1)}>Back</Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
