import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Save, RotateCcw } from "lucide-react";
import { useThreat } from "@/context/ThreatContext";
import { ZOMBIE_FEATURES, SUPER_Z_FEATURES } from "@/data/zombieFeatures";

export default function Step9_Summary() {
  const { threat, setCurrentStep, resetThreat } = useThreat();

  const handleBack = () => {
    setCurrentStep(8); // Go back to Step 8 (Actions)
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving threat:", threat);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log("Exporting PDF for:", threat);
  };

  const handleStartOver = () => {
    resetThreat();
    setCurrentStep(1);
  };

  // Get auto-features based on type
  const getAutoFeatures = () => {
    if (threat.type === "Zombie") return ZOMBIE_FEATURES;
    if (threat.type === "Super Z") return SUPER_Z_FEATURES;
    return [];
  };

  const autoFeatures = getAutoFeatures();

  // Calculate ability modifiers
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className="space-y-6" data-testid="step-summary">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              9
            </span>
            Threat Summary
          </CardTitle>
          <CardDescription>
            Review your completed threat. This stat block matches the format found in The Archive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Threat Header - Archive Style */}
          <div className="p-4 bg-muted/50 rounded-lg border-2 border-primary/20">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-primary">
                {threat.name} 
              </h2>
              <p className="text-lg text-muted-foreground">
                <span className="font-semibold">{threat.rank} ({getThreatRankNumber(threat.rank)})</span>, 
                <span className="ml-1">{threat.size} {threat.type}</span>
                <span className="ml-1">({threat.role})</span>
              </p>
            </div>

            {/* Initiative and Pace */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="font-semibold">Initiative:</span> +{threat.initiative}
              </div>
              <div>
                <span className="font-semibold">Pace:</span> {threat.pace || "2 areas"}
              </div>
            </div>

            {/* Actions Section */}
            <div className="mb-4">
              <h3 className="font-semibold text-primary mb-2">Actions</h3>
              <div className="text-sm bg-background/50 p-3 rounded border">
                {threat.actions && threat.actions.length > 0 ? (
                  <div className="space-y-2">
                    {threat.actions.map((action) => (
                      <div key={action.id}>
                        <p className="font-medium">
                          <span className="font-semibold">{action.name}:</span>{" "}
                          {action.type === "Attack" ? (
                            <>
                              {action.toHit && `+${action.toHit} to hit`}
                              {action.defense && `, ${action.defense}`}
                              {action.range && `, ${action.range.toLowerCase().includes("melee") 
                                ? `reach: ${action.range}` 
                                : `Ranged ${action.range}`}`}
                              {action.area && `, ${action.area}`}
                              {action.damage && action.damageType && `. Hit: ${action.damage} ${action.damageType}`}
                              {action.successText && `. Upon a successful hit, ${action.successText}`}
                            </>
                          ) : (
                            action.description
                          )}
                          {action.actionType && (
                            <span className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">
                              {action.actionType}
                            </span>
                          )}
                        </p>
                        {action.type === "Attack" && action.description && (
                          <p className="text-muted-foreground text-xs pl-4">{action.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    No actions defined.
                  </p>
                )}
              </div>
            </div>

            {/* Defense Table */}
            <div className="mb-4">
              <table className="w-full border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-2 font-semibold">Avoidance</th>
                    <th className="border border-border p-2 font-semibold">Fortitude</th>
                    <th className="border border-border p-2 font-semibold">Willpower</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-2 text-center">{threat.defenses.avoidance}</td>
                    <td className="border border-border p-2 text-center">{threat.defenses.fortitude}</td>
                    <td className="border border-border p-2 text-center">{threat.defenses.willpower}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Stamina and Wounds */}
            <div className="mb-4">
              <table className="w-full border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-2 font-semibold">Stamina</th>
                    <th className="border border-border p-2 font-semibold">Wounds</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-2 text-center">
                      {threat.stamina}
                      {threat.type === "Zombie" || threat.type === "Super Z" ? " (None - Undead)" : ""}
                    </td>
                    <td className="border border-border p-2 text-center">{threat.wounds}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Ability Scores */}
            <div className="mb-4">
              <table className="w-full border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-2 font-semibold">STR</th>
                    <th className="border border-border p-2 font-semibold">DEX</th>
                    <th className="border border-border p-2 font-semibold">CON</th>
                    <th className="border border-border p-2 font-semibold">INT</th>
                    <th className="border border-border p-2 font-semibold">WIS</th>
                    <th className="border border-border p-2 font-semibold">CHA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-2 text-center">
                      {threat.abilityScores.strength} ({getModifier(threat.abilityScores.strength)})
                    </td>
                    <td className="border border-border p-2 text-center">
                      {threat.abilityScores.dexterity} ({getModifier(threat.abilityScores.dexterity)})
                    </td>
                    <td className="border border-border p-2 text-center">
                      {threat.abilityScores.constitution} ({getModifier(threat.abilityScores.constitution)})
                    </td>
                    <td className="border border-border p-2 text-center">
                      {threat.abilityScores.intelligence} ({getModifier(threat.abilityScores.intelligence)})
                    </td>
                    <td className="border border-border p-2 text-center">
                      {threat.abilityScores.wisdom} ({getModifier(threat.abilityScores.wisdom)})
                    </td>
                    <td className="border border-border p-2 text-center">
                      {threat.abilityScores.charisma} ({getModifier(threat.abilityScores.charisma)})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Skill Sets */}
            {threat.skillSets.length > 0 && (
              <div className="mb-4">
                <table className="w-full border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-2 font-semibold text-left">Skill Sets (Edge)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-2">
                        {threat.skillSets.join(", ")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Auto-Generated Features */}
            {autoFeatures.length > 0 && (
              <div className="mb-4">
                <table className="w-full border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-2 font-semibold text-left">
                        {threat.type} Features
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-2">
                        <div className="space-y-2">
                          {autoFeatures.map((feature, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-semibold">{feature.name}:</span>{" "}
                              <span>{feature.description}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Custom Features */}
            {threat.features && threat.features.length > 0 && (
              <div className="mb-4">
                <table className="w-full border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="border border-border p-2 font-semibold text-left">Features & Powers</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-2">
                        <div className="space-y-2">
                          {threat.features.map((feature) => (
                            <div key={feature.id} className="text-sm">
                              <span className="font-semibold">{feature.name}</span>
                              {feature.type !== "trait" && (
                                <span className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">
                                  {feature.type}
                                </span>
                              )}
                              <span className="block text-muted-foreground mt-1">
                                {feature.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Resistances & Immunities Summary */}
            {(() => {
              const immunities: string[] = [];
              const resistances: string[] = [];
              
              // Get auto-generated immunities/resistances
              autoFeatures.forEach(feature => {
                if (feature.name.toLowerCase().includes("immunity")) {
                  immunities.push(feature.name.replace(/\s*immunity$/i, ""));
                }
                if (feature.name.toLowerCase().includes("resistance")) {
                  resistances.push(feature.name.replace(/\s*resistance$/i, ""));
                }
              });
              
              // Get custom immunities/resistances
              threat.features?.forEach(feature => {
                if (feature.type === "immunity") {
                  immunities.push(feature.name);
                } else if (feature.type === "Damage Resistance") {
                  resistances.push(feature.name);
                }
              });
              
              return (immunities.length > 0 || resistances.length > 0) && (
                <div className="mb-4">
                  <table className="w-full border border-border">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border p-2 font-semibold text-left">Resistances & Immunities</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-2">
                          <div className="space-y-1 text-sm">
                            {immunities.length > 0 && (
                              <div>
                                <span className="font-semibold">Immune to:</span>{" "}
                                {immunities.join(", ")}
                              </div>
                            )}
                            {resistances.length > 0 && (
                              <div>
                                <span className="font-semibold">Resistant to:</span>{" "}
                                {resistances.join(", ")}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* Rank Bonus */}
            <div className="mb-4">
              <table className="w-full border border-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-2 font-semibold text-left">Rank Bonus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-2">
                      +{getThreatRankBonus(threat.rank)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={handleSave} data-testid="button-save-threat">
              <Save className="h-4 w-4 mr-2" />
              Save Threat
            </Button>
            <Button onClick={handleExportPDF} variant="outline" data-testid="button-export-pdf">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={handleStartOver} variant="destructive" data-testid="button-start-over">
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} data-testid="button-back">
          Back: Actions
        </Button>
        <div className="text-sm text-muted-foreground flex items-center">
          Threat creation complete!
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getThreatRankNumber(rank: string): number {
  const rankMap: { [key: string]: number } = {
    "Bystander": 0.25,
    "Hardened": 0.5,
    "Zeta": 1,
    "Epsilon": 2,
    "Delta": 3,
    "Gamma": 4,
    "Beta": 5,
    "Alpha": 6,
    "Theta": 7,
    "Sigma": 8,
    "Upsilon": 9,
    "Omega": 10
  };
  return rankMap[rank] || 1;
}

function getThreatRankBonus(rank: string): number {
  const bonusMap: { [key: string]: number } = {
    "Bystander": 1,
    "Hardened": 1,
    "Zeta": 1,
    "Epsilon": 2,
    "Delta": 3,
    "Gamma": 4,
    "Beta": 5,
    "Alpha": 6,
    "Theta": 7,
    "Sigma": 8,
    "Upsilon": 9,
    "Omega": 10
  };
  return bonusMap[rank] || 1;
}