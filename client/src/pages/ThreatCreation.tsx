import { ThreatProvider, useThreat } from "@/context/ThreatContext";
import Step1_Basics from "@/threatSteps/Step1_Basics";
import Step2_Traits from "@/threatSteps/Step2_Traits";
import Step3_Summary from "@/threatSteps/Step3_Summary";

function Wizard() {
  const { currentStep } = useThreat();

  switch (currentStep) {
    case 1:
      return <Step1_Basics />;
    case 2:
      return <Step2_Traits />;
    case 3:
      return <Step3_Summary />;
    default:
      return <Step1_Basics />;
  }
}

export default function ThreatCreation() {
  return (
    <ThreatProvider>
      <div className="container mx-auto p-4 md:px-8 space-y-6">
        <h1 className="font-display text-3xl">Threat Creation</h1>
        <Wizard />
      </div>
    </ThreatProvider>
  );
}

