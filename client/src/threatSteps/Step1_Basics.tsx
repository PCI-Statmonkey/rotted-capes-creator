import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useThreat } from "@/context/ThreatContext";
import { THREAT_PARAMETERS } from "@/data/threatParameters";
import { THREAT_ROLES } from "@/data/threatRoles";
import { THREAT_SIZES } from "@/data/threatSizes";
import { THREAT_TYPES } from "@/data/threatTypes";

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
}

export default function Step1_Basics() {
  const { threat, updateThreatField, setCurrentStep, applyParameters, applyAdvancedParameters } = useThreat();
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

  const onSubmit = (data: FormData) => {
    updateThreatField("name", data.name);
    updateThreatField("rank", data.rank);
    updateThreatField("role", data.role);
    updateThreatField("size", data.size);
    updateThreatField("type", data.type);
    updateThreatField("advanced", data.advanced);
    setCurrentStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <label>Name</label>
        <Input {...register("name")} />
      </div>
      <div className="grid gap-2">
        <label>Rank</label>
        <Select onValueChange={(v) => setValue("rank", v)} value={rank} disabled={advanced}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {THREAT_PARAMETERS.map((p) => (
              <SelectItem key={p.label} value={p.label}>{p.label} / {p.rank}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox id="advanced" checked={advanced} onCheckedChange={(v) => setValue("advanced", v as boolean)} />
          <label htmlFor="advanced">Use Advanced Threat Parameters</label>
        </div>
        {advanced && (
          <div className="space-y-4 border p-4 rounded-md mt-2">
            <div className="grid gap-2">
              <label>Defense Rank</label>
              <Select onValueChange={(v) => setValue("defenseRank", v)} value={defenseRank}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {THREAT_PARAMETERS.map((p) => (
                    <SelectItem key={p.label} value={p.label}>{p.label} / {p.rank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label>Durability Rank</label>
              <Select onValueChange={(v) => setValue("durabilityRank", v)} value={durabilityRank}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {THREAT_PARAMETERS.map((p) => (
                    <SelectItem key={p.label} value={p.label}>{p.label} / {p.rank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label>Attack Rank</label>
              <Select onValueChange={(v) => setValue("attackRank", v)} value={attackRank}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
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
      <div className="grid gap-2">
        <label>Role</label>
        <Select onValueChange={(v) => setValue("role", v)} value={role}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {THREAT_ROLES.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <label>Size</label>
        <Select onValueChange={(v) => setValue("size", v)} value={size}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {THREAT_SIZES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <label>Type</label>
        <Select onValueChange={(v) => setValue("type", v)} value={type}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {THREAT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
