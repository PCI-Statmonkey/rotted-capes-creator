import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCharacter } from "@/context/CharacterContext";
import CharacterSummary from "@/components/CharacterSummary";
import ProgressBar from "@/components/ProgressBar";
import Step1_Concept from "@/steps/Step1_Concept";
import Step2_Origin from "@/steps/Step2_Origin";
import { WIZARD_STEPS } from "@/lib/utils";

export default function Creator() {
  const { currentStep } = useCharacter();
  
  // Function to render the current step component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_Concept />;
      case 2:
        return <Step2_Origin />;
      // Other steps will be added as they are implemented
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
