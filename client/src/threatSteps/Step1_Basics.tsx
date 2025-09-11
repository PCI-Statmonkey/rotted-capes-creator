import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useThreat } from "@/context/ThreatContext";
import { THREAT_PARAMETERS, getThreatParameter } from "@/data/threatParameters";
import { THREAT_ROLES } from "@/data/threatRoles";
import { THREAT_SIZES } from "@/data/threatSizes";
import { THREAT_TYPES } from "@/data/threatTypes";
import { calculateThreatMods } from "@/utils/threatModifiers";

interface FormData {
  name: string;
  rank: string;
  role: string;
  size: string;
  type: string;
  advanced: boolean;
  defenseRank: string;
  durabilityRank: string;
  attackRank: string;
  initiative: number;
  pace: string;
  stamina: number;
  wounds: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export default function Step1_Basics() {
  const { threat, updateThreatField, setCurrentStep, applyParameters, applyAdvancedParameters, resetThreat } = useThreat();
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

  const defenseScores = [avoidanceDefault, threat.defenses.fortitude, willpowerDefault];
  const [assigned, setAssigned] = useState<{ avoidance: number | null; fortitude: number | null; willpower: number | null }>({
    avoidance: null,
    fortitude: null,
    willpower: null,
  });
  const [selected, setSelected] = useState<number | null>(null);

  const { register, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      name: threat.name,
      rank: threat.rank,
      role: threat.role,
      size: threat.size,
      type: threat.type,
      advanced: threat.advanced,
      defenseRank: threat.rank,
      durabilityRank: threat.rank,
      attackRank: threat.rank,
      initiative: threat.initiative,
      pace: threat.pace,
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

  const rank = watch("rank");
  const advanced = watch("advanced");
  const defenseRank = watch("defenseRank");
  const durabilityRank = watch("durabilityRank");
  const attackRank = watch("attackRank");
  const role = watch("role");
  const size = watch("size");
  const type = watch("type");

  useEffect(() => {
    setValue("rank", threat.rank);
  }, [threat.rank, setValue]);

  useEffect(() => {
    register("role");
    register("size");
    register("type");
  }, [register]);

  // Update baseline parameters when rank changes
  useEffect(() => {
    if (!advanced) {
      applyParameters(rank);
      setValue("defenseRank", rank);
      setValue("durabilityRank", rank);
      setValue("attackRank", rank);
    }
  }, [rank, advanced, applyParameters, setValue]);

  // Apply advanced parameters when selections change
  useEffect(() => {
    if (advanced) {
      applyAdvancedParameters(defenseRank, durabilityRank, attackRank);
    }
  }, [advanced, defenseRank, durabilityRank, attackRank, applyAdvancedParameters]);

  // Update stats defaults when threat changes
  useEffect(() => {
    setValue("initiative", threat.initiative);
    setValue("pace", threat.pace);
    setValue("stamina", staminaDefault);
    setValue("wounds", woundsDefault);
    setValue("strength", threat.abilityScores.strength);
    setValue("dexterity", threat.abilityScores.dexterity);
    setValue("constitution", threat.abilityScores.constitution);
    setValue("intelligence", threat.abilityScores.intelligence);
    setValue("wisdom", threat.abilityScores.wisdom);
    setValue("charisma", threat.abilityScores.charisma);
    setAssigned({ avoidance: null, fortitude: null, willpower: null });
    setSelected(null);
  }, [threat, setValue, staminaDefault, woundsDefault, avoidanceDefault, willpowerDefault]);

  const assignDefense = (field: "avoidance" | "fortitude" | "willpower") => {
    if (selected === null) {
      if (assigned[field] !== null) {
        setAssigned((prev) => ({ ...prev, [field]: null }));
      }
      return;
    }
    if (Object.values(assigned).includes(selected)) return;
    setAssigned((prev) => ({ ...prev, [field]: selected }));
    setSelected(null);
  };

  const onSubmit = (data: FormData) => {
    updateThreatField("name", data.name);
    updateThreatField("rank", data.rank);
    updateThreatField("role", data.role);
    updateThreatField("size", data.size);
    updateThreatField("type", data.type);
    updateThreatField("advanced", data.advanced);
    updateThreatField("initiative", data.initiative);
    updateThreatField("pace", data.pace);
    updateThreatField("defenses", {
      avoidance: assigned.avoidance !== null ? defenseScores[assigned.avoidance] : defenseScores[0],
      fortitude: assigned.fortitude !== null ? defenseScores[assigned.fortitude] : defenseScores[1],
      willpower: assigned.willpower !== null ? defenseScores[assigned.willpower] : defenseScores[2],
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
    setCurrentStep(2);
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
      <form onSubmit={handleSubmit(onSubmit)} className="mt-12 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-8">
          <div className="space-y-4">
            <h2 className="font-display text-3xl">Step 1: Basics</h2>
            <div className="grid gap-2 text-xl">
              <label className="font-comic">Name</label>
              <Input className="w-64 h-10 text-xl" {...register("name")} />
            </div>
            <div className="grid gap-2 text-xl">
              <label className="font-comic">Rank</label>
              <Select onValueChange={(v) => setValue("rank", v)} value={rank} disabled={advanced}>
                <SelectTrigger className="w-64 h-10 text-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {THREAT_PARAMETERS.map((p) => (
                    <SelectItem key={p.label} value={p.label}>{p.label} / {p.rank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2 pt-2 text-xl">
                <Checkbox id="advanced" checked={advanced} onCheckedChange={(v) => setValue("advanced", v as boolean)} />
                <label htmlFor="advanced" className="font-comic">Use Advanced Threat Parameters</label>
              </div>
              {advanced && (
                <div className="space-y-4 border p-4 rounded-md mt-2 text-xl">
                  <div className="grid gap-2">
                    <label className="font-comic">Defense Rank</label>
                    <Select onValueChange={(v) => setValue("defenseRank", v)} value={defenseRank}>
                      <SelectTrigger className="w-64 h-10 text-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {THREAT_PARAMETERS.map((p) => (
                          <SelectItem key={p.label} value={p.label}>{p.label} / {p.rank}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="font-comic">Durability Rank</label>
                    <Select onValueChange={(v) => setValue("durabilityRank", v)} value={durabilityRank}>
                      <SelectTrigger className="w-64 h-10 text-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {THREAT_PARAMETERS.map((p) => (
                          <SelectItem key={p.label} value={p.label}>{p.label} / {p.rank}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="font-comic">Attack Rank</label>
                    <Select onValueChange={(v) => setValue("attackRank", v)} value={attackRank}>
                      <SelectTrigger className="w-64 h-10 text-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {THREAT_PARAMETERS.map((p) => (
                          <SelectItem key={p.label} value={p.label}>{p.label} / {p.rank}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            <div className="grid gap-2 text-xl">
              <label className="font-comic">Role</label>
              <Select onValueChange={(v) => setValue("role", v)} value={role}>
                <SelectTrigger className="w-64 h-10 text-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {THREAT_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 text-xl">
              <label className="font-comic">Size</label>
              <Select onValueChange={(v) => setValue("size", v)} value={size}>
                <SelectTrigger className="w-64 h-10 text-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {THREAT_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 text-xl">
              <label className="font-comic">Type</label>
              <Select onValueChange={(v) => setValue("type", v)} value={type}>
                <SelectTrigger className="w-64 h-10 text-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {THREAT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-l pl-8 space-y-6">
            <h2 className="font-display text-3xl">Step 2: Stats</h2>
            <div className="flex gap-8 text-xl">
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
              <label className="block font-comic mb-2 text-xl">Defenses</label>
              <div className="flex gap-2 mb-4">
                {defenseScores.map((score, idx) => {
                  const used = Object.values(assigned).includes(idx);
                  const isSelected = selected === idx;
                  return (
                    <Button
                      key={idx}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={used ? "opacity-50 cursor-not-allowed" : ""}
                      onClick={() => {
                        if (!used) setSelected(idx);
                      }}
                    >
                      {score}
                    </Button>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Click a number then a defense to assign it.
              </p>
              <div className="space-y-3 text-xl">
                <div className="flex items-center gap-2">
                  <span className="w-28">Avoidance</span>
                  <div
                    className="w-24 h-10 text-center text-xl flex items-center justify-center border rounded cursor-pointer"
                    onClick={() => assignDefense("avoidance")}
                  >
                    {assigned.avoidance !== null ? defenseScores[assigned.avoidance] : "Assign"}
                  </div>
                </div>
                {mods.notes.avoidance.length > 0 && (
                  <p className="text-sm text-muted-foreground pl-28">
                    {mods.notes.avoidance.join(", ")}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-28">Fortitude</span>
                  <div
                    className="w-24 h-10 text-center text-xl flex items-center justify-center border rounded cursor-pointer"
                    onClick={() => assignDefense("fortitude")}
                  >
                    {assigned.fortitude !== null ? defenseScores[assigned.fortitude] : "Assign"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-28">Willpower</span>
                  <div
                    className="w-24 h-10 text-center text-xl flex items-center justify-center border rounded cursor-pointer"
                    onClick={() => assignDefense("willpower")}
                  >
                    {assigned.willpower !== null ? defenseScores[assigned.willpower] : "Assign"}
                  </div>
                </div>
                {mods.notes.willpower.length > 0 && (
                  <p className="text-sm text-muted-foreground pl-28">
                    {mods.notes.willpower.join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-8 text-xl">
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
              <label className="block font-comic mb-2 text-xl">Ability Scores</label>
              <div className="flex gap-4 text-xl flex-nowrap">
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
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Next</Button>
        </div>
      </form>
    </div>
  );
}

