import { motion } from "framer-motion";
import { WIZARD_STEPS } from "@/lib/utils";
import { useCharacter } from "@/context/CharacterContext";
import { cn } from "@/lib/utils";

export default function ProgressBar() {
  const { currentStep, setCurrentStep } = useCharacter();

  return (
    <div className="flex overflow-x-auto md:overflow-visible py-2 px-1 mb-4 no-scrollbar">
      <div className="flex w-full">
        {WIZARD_STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <motion.div
              key={step.id}
              className={cn(
                "progress-bar-item flex-1 h-12 md:h-16 bg-panel mr-1 flex items-center justify-center relative group transition-all cursor-pointer",
                isActive || isCompleted ? "" : "opacity-70"
              )}
              onClick={() => setCurrentStep(step.id)}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              {(isActive || isCompleted) && (
                <motion.div 
                  className="absolute inset-0 bg-accent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isActive ? 0.7 : 0.4 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <span className="relative font-comic text-white z-10 text-center px-2 truncate">
                {step.id}. {step.name}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
