import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useThreat } from "@/context/ThreatContext";

export default function ThreatParamsBar() {
  const { threat } = useThreat();

  if (!threat.name) {
    return null; // Don't show until threat has a name
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20" data-testid="threat-params-bar">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Threat Name and Rank */}
          <div className="flex items-center gap-4">
            <div>
              <h3 className="font-semibold text-lg" data-testid="text-threat-name">
                {threat.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" data-testid="text-final-rank">
                  {threat.rank}
                </Badge>
                {threat.advanced && (
                  <Badge variant="outline" className="text-xs" data-testid="badge-advanced">
                    Advanced ({threat.effectiveRank?.toFixed(2)})
                  </Badge>
                )}
              </div>
            </div>

            {/* Advanced Mode Details */}
            {threat.advanced && threat.advancedRanks && (
              <div className="text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <span data-testid="text-attack-rank">Atk: {threat.advancedRanks.attack}</span>
                  <span data-testid="text-defense-rank">Def: {threat.advancedRanks.defense}</span>
                  <span data-testid="text-durability-rank">Dur: {threat.advancedRanks.durability}</span>
                </div>
              </div>
            )}
          </div>

          {/* Key Parameters */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="text-center" data-testid="display-defenses">
              <div className="font-medium flex items-center justify-center gap-1">
                Defenses
                {!threat.defenseAssigned && threat.pendingDefenseValues && (
                  <Badge variant="destructive" className="text-xs">
                    Unassigned
                  </Badge>
                )}
              </div>
              <div className="text-muted-foreground">
                {threat.defenseAssigned ? (
                  `${threat.defenses.avoidance}/${threat.defenses.fortitude}/${threat.defenses.willpower}`
                ) : threat.pendingDefenseValues ? (
                  `Pending: ${threat.pendingDefenseValues.join("/")}`
                ) : (
                  "0/0/0"
                )}
              </div>
            </div>
            
            <div className="text-center" data-testid="display-stamina-wounds">
              <div className="font-medium">Stamina / Wounds</div>
              <div className="text-muted-foreground">
                {threat.stamina} / {threat.wounds}
              </div>
            </div>

            {threat.attack && (
              <div className="text-center" data-testid="display-to-hit">
                <div className="font-medium">To Hit</div>
                <div className="text-muted-foreground">
                  +{threat.attack.single} / +{threat.attack.area}
                </div>
              </div>
            )}

            {threat.damage && (
              <div className="text-center" data-testid="display-damage">
                <div className="font-medium">Damage</div>
                <div className="text-muted-foreground">
                  {threat.damage.min}–{threat.damage.max} (avg {threat.damage.avg})
                </div>
              </div>
            )}

            {threat.type && (
              <div className="text-center" data-testid="display-type">
                <div className="font-medium">Type</div>
                <div className="text-muted-foreground">
                  {threat.type}
                </div>
              </div>
            )}

            {threat.size && (
              <div className="text-center" data-testid="display-size">
                <div className="font-medium">Size</div>
                <div className="text-muted-foreground">
                  {threat.size}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}