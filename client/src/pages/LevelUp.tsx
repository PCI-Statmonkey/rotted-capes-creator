import { useState } from "react";
import { useCharacter, getRankCap } from "@/context/CharacterContext";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function LevelUp() {
  const { character, updateCharacterField, updateDerivedStats } = useCharacter();
  const [choice, setChoice] = useState<string>("rank");

  const applyChoice = () => {
    switch (choice) {
      case "rank": {
        updateCharacterField("rank", character.rank + 1);
        updateCharacterField("rankBonus", character.rankBonus + 1);
        updateCharacterField("grit", character.grit + 1);
        break;
      }
      case "power": {
        const cap = getRankCap(character.rank);
        const updated = character.powers.map(p => ({ ...p, rank: Math.min((p.rank ?? 0) + 1, cap) }));
        updateCharacterField("powers", updated as any);
        break;
      }
      case "feat": {
        const name = prompt("Enter feat name");
        if (name) {
          updateCharacterField("feats", [...character.feats, { name }]);
        }
        break;
      }
      case "feature": {
        const name = prompt("Enter feature name");
        if (name) {
          // Store features in feats array with source flag
          updateCharacterField("feats", [...character.feats, { name, source: "feature" }]);
        }
        break;
      }
    }
    updateCharacterField("level", character.level + 1);
    updateDerivedStats();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-comic mb-4">Level Up</h1>
      <p className="mb-4">Current Rank {character.rank}, Level {character.level}</p>
      <RadioGroup value={choice} onValueChange={setChoice} className="space-y-2 mb-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="rank" id="rank" />
          <Label htmlFor="rank">Rank Increase</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="feat" id="feat" />
          <Label htmlFor="feat">Feat</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="feature" id="feature" />
          <Label htmlFor="feature">Feature</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="power" id="power" />
          <Label htmlFor="power">Power Boost</Label>
        </div>
      </RadioGroup>
      <Button onClick={applyChoice}>Apply</Button>
    </div>
  );
}
