import { Button } from "@/components/ui/button";
import { useThreat } from "@/context/ThreatContext";

export default function Step4_Summary() {
  const { threat, setCurrentStep, resetThreat } = useThreat();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{threat.name} {threat.rank}, {threat.size} {threat.type} ({threat.role})</h2>
      {threat.advanced && (
        <p className="text-sm text-muted-foreground">Effective Rank: {threat.effectiveRank}</p>
      )}
      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="font-semibold">Initiative:</td>
            <td>+{threat.initiative}</td>
            <td className="font-semibold">Pace:</td>
            <td>{threat.pace}</td>
          </tr>
          <tr>
            <td colSpan={4} className="pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>Avoidance</th>
                    <th>Fortitude</th>
                    <th>Willpower</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center">
                    <td>{threat.defenses.avoidance}</td>
                    <td>{threat.defenses.fortitude}</td>
                    <td>{threat.defenses.willpower}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td className="font-semibold">Stamina:</td>
            <td>{threat.stamina}</td>
            <td className="font-semibold">Wounds:</td>
            <td>{threat.wounds}</td>
          </tr>
          <tr>
            <td className="font-semibold">To Hit (S/A):</td>
            <td>+{threat.attack.single} / +{threat.attack.area}</td>
            <td className="font-semibold">Damage:</td>
            <td>{threat.damage.min}–{threat.damage.max} (avg {threat.damage.avg})</td>
          </tr>
        </tbody>
      </table>
      <table className="w-full text-sm mt-4">
        <thead>
          <tr>
            <th>STR</th>
            <th>DEX</th>
            <th>CON</th>
            <th>INT</th>
            <th>WIS</th>
            <th>CHA</th>
          </tr>
        </thead>
        <tbody>
          <tr className="text-center">
            <td>{threat.abilityScores.strength}</td>
            <td>{threat.abilityScores.dexterity}</td>
            <td>{threat.abilityScores.constitution}</td>
            <td>{threat.abilityScores.intelligence}</td>
            <td>{threat.abilityScores.wisdom}</td>
            <td>{threat.abilityScores.charisma}</td>
          </tr>
        </tbody>
      </table>
      <div>
        <h3 className="font-semibold mt-4">Skill Sets</h3>
        <ul className="list-disc pl-5 text-sm">
          {threat.skillSets.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mt-4">Traits</h3>
        <ul className="list-disc pl-5 text-sm">
          {threat.traits.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between pt-4">
        <Button type="button" onClick={() => setCurrentStep(3)}>Back</Button>
        <Button type="button" onClick={resetThreat}>Start Over</Button>
      </div>
    </div>
  );
}
