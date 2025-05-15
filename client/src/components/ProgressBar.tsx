import { motion } from "framer-motion";
import { WIZARD_STEPS } from "@/lib/utils";
import { useCharacter } from "@/context/CharacterContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProgressBar() {
  const { currentStep, setCurrentStep, saveCharacter, resetCharacter } = useCharacter();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  const handleStartOver = () => {
    setConfirmDialogOpen(true);
  };
  
  const confirmStartOver = () => {
    resetCharacter(); // Reset character to empty state
    setConfirmDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-center mb-4">
        {/* Progress steps scrollable container */}
        <div className="flex overflow-x-auto md:overflow-visible py-2 px-1 flex-grow no-scrollbar mr-2">
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
                  onClick={() => {
                    // Save character progress before changing steps
                    saveCharacter();
                    setCurrentStep(step.id);
                  }}
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
        
        {/* Start Over button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-shrink-0 border-red-500 text-red-500 hover:bg-red-500/10 hover:text-red-600"
          onClick={handleStartOver}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Over?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset your character and start the creation process from the beginning. 
              Any unsaved progress will be lost. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStartOver}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, Start Over
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
