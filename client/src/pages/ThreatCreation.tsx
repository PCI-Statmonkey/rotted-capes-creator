import { ThreatProvider, useThreat } from "@/context/ThreatContext";
import ThreatParamsBar from "@/components/ThreatParamsBar";

// Import all 9 threat creation steps
import Step1_Rank from "@/threatSteps/Step1_Rank";
import Step2_Defenses from "@/threatSteps/Step2_Defenses";
import Step3_Role from "@/threatSteps/Step2_Role";
import Step4_Type from "@/threatSteps/Step3_Type";
import Step5_Size from "@/threatSteps/Step4_Size";
import Step6_SkillSets from "@/threatSteps/Step5_SkillSets";
import Step7_AbilityScores from "@/threatSteps/Step6_AbilityScores";
import Step8_Actions from "@/threatSteps/Step8_Actions";
import Step9_Summary from "@/threatSteps/Step9_Summary";

const TOTAL_STEPS = 9;

function Wizard() {
  const { currentStep } = useThreat();

  switch (currentStep) {
    case 1:
      return <Step1_Rank />;
    case 2:
      return <Step2_Defenses />;
    case 3:
      return <Step3_Role />;
    case 4:
      return <Step4_Type />;
    case 5:
      return <Step5_Size />;
    case 6:
      return <Step6_SkillSets />;
    case 7:
      return <Step7_AbilityScores />;
    case 8:
      return <Step8_Actions />;
    case 9:
      return <Step9_Summary />;
    default:
      return <Step1_Rank />;
  }
}

export default function ThreatCreation() {
  return (
    <ThreatProvider>
      <div className="container mx-auto p-4 md:px-8 space-y-6">
        <div className="relative min-h-screen bg-gradient-to-br from-background to-muted/20">
          <div className="absolute inset-0 bg-[url('/textures/grunge-bg.png')] opacity-5 bg-repeat bg-center" />
          <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
            <div className="text-center mb-8">
              <h1 className="font-display text-4xl md:text-5xl text-primary mb-2">
                Threat Creation
              </h1>
              <p className="text-muted-foreground text-lg">
                Create cinematic threats for your Rotted Capes sessions
              </p>
            </div>
            
            <ThreatParamsBar />
            <div className="mt-8">
              <Wizard />
            </div>
          </div>
        </div>
      </div>
    </ThreatProvider>
  );
}

