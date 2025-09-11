import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThreat } from "@/context/ThreatContext";
import { getThreatParameter } from "@/data/threatParameters";
import { calculateThreatMods } from "@/utils/threatModifiers";
import { motion } from "framer-motion";

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
    <motion.div
      className="bg-panel rounded-2xl p-6 comic-border overflow-hidden halftone-bg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 border-b-2 border-gray-700 pb-4">
        <h2 className="font-display text-3xl text-red-500 tracking-wide">Step 2: Stats</h2>
        <p className="text-gray-300 mt-2">Set the threat's combat readiness.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-xl">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <label className="font-comic mb-2">Initiative</label>
            <Input
              className="w-24 h-10 text-center text-xl"
              type="number"
              {...register("initiative", { valueAsNumber: true })}
            />
          </div>
          <div className="flex flex-col">
            <label className="font-comic mb-2">Pace</label>
            <Input
              className="w-24 h-10 text-center text-xl"
              {...register("pace")}
            />
          </div>
        </div>

        <div>
          <label className="block font-comic mb-2">Defenses</label>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-28">Avoidance</span>
              <Input
                className="w-24 h-10 text-center text-xl"
                type="number"
                {...register("avoidance", { valueAsNumber: true })}
              />
            </div>
            {mods.notes.avoidance.length > 0 && (
              <p className="text-sm text-muted-foreground pl-28">
                {mods.notes.avoidance.join(", ")}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span className="w-28">Fortitude</span>
              <Input
                className="w-24 h-10 text-center text-xl"
                type="number"
                {...register("fortitude", { valueAsNumber: true })}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-28">Willpower</span>
              <Input
                className="w-24 h-10 text-center text-xl"
                type="number"
                {...register("willpower", { valueAsNumber: true })}
              />
            </div>
            {mods.notes.willpower.length > 0 && (
              <p className="text-sm text-muted-foreground pl-28">
                {mods.notes.willpower.join(", ")}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <span>Stamina</span>
            <Input
              className="w-24 h-10 text-center text-xl"
              type="number"
              {...register("stamina", { valueAsNumber: true })}
            />
            {mods.notes.stamina.length > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                {mods.notes.stamina.join(", ")}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center">
            <span>Wounds</span>
            <Input
              className="w-24 h-10 text-center text-xl"
              type="number"
              {...register("wounds", { valueAsNumber: true })}
            />
            {mods.notes.wounds.length > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                {mods.notes.wounds.join(", ")}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block font-comic mb-2">Ability Scores</label>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center">
              <span>STR</span>
              <Input
                className="w-20 h-10 text-center text-xl"
                type="number"
                {...register("strength", { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col items-center">
              <span>DEX</span>
              <Input
                className="w-20 h-10 text-center text-xl"
                type="number"
                {...register("dexterity", { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col items-center">
              <span>CON</span>
              <Input
                className="w-20 h-10 text-center text-xl"
                type="number"
                {...register("constitution", { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col items-center">
              <span>INT</span>
              <Input
                className="w-20 h-10 text-center text-xl"
                type="number"
                {...register("intelligence", { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col items-center">
              <span>WIS</span>
              <Input
                className="w-20 h-10 text-center text-xl"
                type="number"
                {...register("wisdom", { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col items-center">
              <span>CHA</span>
              <Input
                className="w-20 h-10 text-center text-xl"
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
    </motion.div>
  );
}
