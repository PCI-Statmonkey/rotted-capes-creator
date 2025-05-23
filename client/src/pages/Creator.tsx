import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCharacter } from "@/context/CharacterContext";
import CharacterSummary from "@/components/CharacterSummary";
import ProgressBar from "@/components/ProgressBar";
import Step1_Concept from "@/steps/Step1_Concept";
import Step2_Origin from "@/steps/Step2_Origin";
import Step3_Archetype from "@/steps/Step3_Archetype";
import Step4_Abilities from "@/steps/Step4_Abilities";
import Step5_Skills from "@/steps/Step5_Skills";
import Step6_Powers from "@/steps/Step6_Powers";
import Step7_Weaknesses from "@/steps/Step7_Weaknesses";
import Step8_Gear from "@/steps/Step8_Gear";
import Step9_FinishingTouches from "@/steps/Step9_FinishingTouches";
import Step10_Summary from "@/steps/Step10_Summary";
import { WIZARD_STEPS } from "@/lib/utils";
import { useLocation, useParams, useRoute } from "wouter";

export default function Creator() {
  const { currentStep, setCurrentStep } = useCharacter();
  const params = useParams();
  const [location, setLocation] = useLocation();
  
  // Sync URL with current step
  useEffect(() => {
    // If we have a step parameter in the URL
    if (params && params.step) {
      const stepName = params.step.toLowerCase();
      // Find the corresponding step number
      const stepObject = WIZARD_STEPS.find(step => 
        step.name.toString().toLowerCase().replace(/[^a-z0-9]/g, '') === stepName
      );
      
      if (stepObject) {
        setCurrentStep(stepObject.id);
      }
    }
  }, [params, setCurrentStep]);
  
  // Update URL when step changes (but only after the component mounts)
  useEffect(() => {
    // Skip initial URL update to avoid issues with CharacterProvider
    const updateUrl = () => {
      if (currentStep > 0 && currentStep <= WIZARD_STEPS.length) {
        const stepObject = WIZARD_STEPS.find(step => step.id === currentStep);
        
        if (stepObject) {
          const stepNameForUrl = stepObject.name
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
          
          // Only update if the URL doesn't already match
          if (!location.includes(`/creator/${stepNameForUrl}`)) {
            setLocation(`/creator/${stepNameForUrl}`);
          }
        }
      }
    };
    
    // Small delay to ensure CharacterProvider is fully initialized
    const timer = setTimeout(updateUrl, 100);
    return () => clearTimeout(timer);
  }, [currentStep, setLocation, location]);
  
  // Function to render the current step component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_Concept />;
      case 2:
        return <Step2_Origin />;
      case 3:
        return <Step3_Archetype />;
      case 4:
        return <Step4_Abilities />;
      case 5:
        return <Step5_Skills />;
      case 6:
        return <Step6_Powers />;
      case 7:
        return <Step7_Weaknesses />;
      case 8:
        return <Step8_Gear />;
      case 9:
        return <Step9_FinishingTouches />;
      case 10:
        return <Step10_Summary />;
      // Default to the first step if an unknown step is provided
      default:
        return <Step1_Concept />;
    }
  };

  return (
    <div className="container mx-auto p-4 md:px-8">
      <div className="w-full mb-6">
        {/* Progress Bar */}
        <ProgressBar />

        {/* Step Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Step Card */}
          <motion.div 
            className="lg:w-2/3"
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Character Summary Sidebar */}
          <CharacterSummary />
        </div>
      </div>
    </div>
  );
}
