import { useState } from "react";
import { 
  User,
  FileText,
  Sword,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCharacter } from "@/context/CharacterContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import InlineCharacterSheet from "./InlineCharacterSheet";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatModifier } from "@/lib/utils";

export default function CharacterSummary() {
  const { character } = useCharacter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const formatOriginName = (origin: string | undefined): string => {
    if (!origin) return "Not Selected";
    if (!origin.includes("(")) return origin;
    return origin
      .replace(/\(([^)]*)\)/, (_, inner: string) => {
        if (/^\s*Bonuses/i.test(inner)) return "";
        const part = inner.split(":" )[0].trim();
        return part ? `(${part})` : "";
      })
      .trim();
  };

  const formatArchetypeName = (archetype: string | undefined): string => {
    if (!archetype) return "Not Selected";
    return archetype.split("(")[0].trim();
  };

  const handleDownloadPDF = async () => {
    const sheetElement = document.getElementById('character-sheet');
    if (!sheetElement) return;

    try {
      const canvas = await html2canvas(sheetElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${character.name || 'character'}-sheet.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="lg:w-1/3 bg-panel rounded-2xl p-5 comic-border h-min sticky top-24 hidden lg:block">
      <div className="border-b-2 border-gray-700 pb-3 mb-4">
        <h3 className="font-comic text-2xl flex items-center">
          <User className="mr-2 h-5 w-5 text-accent" />
          Character Summary
        </h3>
      </div>

      <div className="space-y-4">
        <div className="text-center mb-4">
          <h4 className="font-comic text-2xl text-accent">
            {character.name || "Unnamed Character"}
          </h4>
          <div className="text-sm text-gray-400 italic">
            {character.secretIdentity ? `Secret Identity: ${character.secretIdentity}` : "No secret identity"}
          </div>
        </div>

        <div className="border-2 border-gray-700 rounded-lg p-3 bg-gray-800 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Rank/Level:</span>
            <span>Rank {character.rank} / Level {character.level}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Rank Bonus:</span>
            <span>+{character.rankBonus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Grit:</span>
            <span>+{character.grit}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Burnout:</span>
            <span>{character.currentBurnout} / {character.burnoutThreshold}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Next Burnout Check DC:</span>
            <span>{10 + 5 * character.burnoutChecks}</span>
          </div>
        </div>

        <div className="border-2 border-gray-700 rounded-lg p-3 bg-gray-800 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Origin:</span>
            <span>{formatOriginName(character.origin)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Archetype:</span>
            <span>{formatArchetypeName(character.archetype)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center border-2 border-gray-700 rounded-lg py-2 px-1 bg-gray-800">
            <div className="text-xs text-gray-400">STR</div>
            <div className="font-comic text-xl">
              {character.abilities.strength.value || "-"}
            </div>
            <div className="text-xs">
              {character.abilities.strength.value ? formatModifier(character.abilities.strength.modifier) : "-"}
            </div>
          </div>
          <div className="text-center border-2 border-gray-700 rounded-lg py-2 px-1 bg-gray-800">
            <div className="text-xs text-gray-400">DEX</div>
            <div className="font-comic text-xl">
              {character.abilities.dexterity.value || "-"}
            </div>
            <div className="text-xs">
              {character.abilities.dexterity.value ? formatModifier(character.abilities.dexterity.modifier) : "-"}
            </div>
          </div>
          <div className="text-center border-2 border-gray-700 rounded-lg py-2 px-1 bg-gray-800">
            <div className="text-xs text-gray-400">CON</div>
            <div className="font-comic text-xl">
              {character.abilities.constitution.value || "-"}
            </div>
            <div className="text-xs">
              {character.abilities.constitution.value ? formatModifier(character.abilities.constitution.modifier) : "-"}
            </div>
          </div>
          <div className="text-center border-2 border-gray-700 rounded-lg py-2 px-1 bg-gray-800">
            <div className="text-xs text-gray-400">INT</div>
            <div className="font-comic text-xl">
              {character.abilities.intelligence.value || "-"}
            </div>
            <div className="text-xs">
              {character.abilities.intelligence.value ? formatModifier(character.abilities.intelligence.modifier) : "-"}
            </div>
          </div>
          <div className="text-center border-2 border-gray-700 rounded-lg py-2 px-1 bg-gray-800">
            <div className="text-xs text-gray-400">WIS</div>
            <div className="font-comic text-xl">
              {character.abilities.wisdom.value || "-"}
            </div>
            <div className="text-xs">
              {character.abilities.wisdom.value ? formatModifier(character.abilities.wisdom.modifier) : "-"}
            </div>
          </div>
          <div className="text-center border-2 border-gray-700 rounded-lg py-2 px-1 bg-gray-800">
            <div className="text-xs text-gray-400">CHA</div>
            <div className="font-comic text-xl">
              {character.abilities.charisma.value || "-"}
            </div>
            <div className="text-xs">
              {character.abilities.charisma.value ? formatModifier(character.abilities.charisma.modifier) : "-"}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-comic text-xl flex items-center mb-2">
            <Sword className="mr-2 h-5 w-5 text-accent" /> Powers
          </h4>
          <div className="border-2 border-gray-700 rounded-lg p-3 bg-gray-800 text-sm">
            {character.powers && character.powers.length > 0 ? (
              <ul className="space-y-1">
                {character.powers.map((power, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{power.name}</span>
                    <span className="text-gray-400">Rank {power.rank}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic">Powers will appear here once selected...</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full flex items-center justify-center bg-accent hover:bg-red-700 shadow-lg"
              >
                <FileText className="mr-2 h-5 w-5" />
                Preview Character Sheet
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-panel text-white border-none max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-panel border-b border-gray-700 pb-2">
                <DialogTitle className="font-comic text-2xl flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-accent" />
                  Character Sheet
                </DialogTitle>
                <div className="flex justify-end">
                  <Button 
                    className="bg-accent hover:bg-red-700 mr-2"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </DialogHeader>
              <div className="p-0">
                <InlineCharacterSheet />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
