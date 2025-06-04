import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCharacter } from "@/context/CharacterContext";
import { useForm } from "react-hook-form";

interface ConceptFormData {
  name: string;
  secretIdentity: string;
  concept: string;
  gender: string;
  age: string;
  height: string;
  weight: string;
  appearance: string;
}

export default function Step1_Concept() {
  const { character, updateCharacterField, setCurrentStep } = useCharacter();

  const { register, handleSubmit, reset } = useForm<ConceptFormData>();

  // When the character changes (like on reset), update the form
  useEffect(() => {
    reset({
      name: character.name,
      secretIdentity: character.secretIdentity,
      concept: character.concept,
      gender: character.gender,
      age: character.age,
      height: character.height,
      weight: character.weight,
      appearance: character.appearance,
    });
  }, [character, reset]);

  const onSubmit = (data: ConceptFormData) => {
    Object.entries(data).forEach(([key, value]) => {
      updateCharacterField(key as keyof typeof character, value);
    });
    setCurrentStep(2);
  };

  return (
    <motion.div 
      className="bg-panel rounded-2xl p-6 comic-border overflow-hidden halftone-bg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 border-b-2 border-gray-700 pb-4">
        <h2 className="font-comic text-3xl text-accent tracking-wide">Step 1: Character Concept & Name</h2>
        <p className="text-gray-300 mt-2">Define your superhero's identity and origin story.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div>
            <label htmlFor="characterName" className="block font-comic text-xl mb-2">Character Name</label>
            <Input
              id="characterName"
              placeholder="The Incredible..."
              className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700"
              {...register("name")}
            />
          </div>

          <div>
            <label htmlFor="secretIdentity" className="block font-comic text-xl mb-2">Secret Identity</label>
            <Input
              id="secretIdentity"
              placeholder="Your alter ego..."
              className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700"
              {...register("secretIdentity")}
            />
          </div>

          <div>
            <label htmlFor="conceptDescription" className="block font-comic text-xl mb-2">Character Concept</label>
            <Textarea
              id="conceptDescription"
              rows={4}
              placeholder="Describe your hero's concept, motivations, and general idea..."
              className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700 resize-none"
              {...register("concept")}
            />
          </div>

          <div>
            <label className="block font-comic text-xl mb-2">Appearance</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className="block text-gray-300 mb-1">Gender</label>
                <Input
                  id="gender"
                  className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700"
                  {...register("gender")}
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-gray-300 mb-1">Age</label>
                <Input
                  id="age"
                  className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700"
                  {...register("age")}
                />
              </div>
              <div>
                <label htmlFor="height" className="block text-gray-300 mb-1">Height</label>
                <Input
                  id="height"
                  className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700"
                  {...register("height")}
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-gray-300 mb-1">Weight</label>
                <Input
                  id="weight"
                  className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700"
                  {...register("weight")}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="appearance" className="block font-comic text-xl mb-2">Appearance Description</label>
            <Textarea
              id="appearance"
              rows={3}
              placeholder="Describe your hero's costume and physical appearance..."
              className="w-full p-3 rounded-lg bg-gray-800 border-2 border-gray-700 resize-none"
              {...register("appearance")}
            />
          </div>
        </div>

        <div className="flex justify-between mt-8 pt-4 border-t-2 border-gray-700">
          <Button type="button" disabled className="opacity-50 cursor-not-allowed">
            <ArrowLeft className="mr-2 h-5 w-5" /> Previous
          </Button>
          <Button type="submit" className="bg-accent hover:bg-red-700 text-white shadow-lg">
            Next <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
