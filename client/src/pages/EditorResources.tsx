import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function EditorResources() {
  return (
    <div className="container mx-auto p-4 md:px-8">
      <h1 className="font-display text-3xl mb-6">Editor-in-Chief's Toolkit</h1>
      <p className="text-muted-foreground mb-8">
        Choose a tool to help run your game.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Link href="/editor/threat-creation">
          <Button className="bg-accent hover:bg-red-700 w-full font-comic">
            Threat Creation
          </Button>
        </Link>
        <Button className="bg-gray-700 hover:bg-gray-600 w-full font-comic">
          Encounter Builder
        </Button>
        <Button className="bg-gray-700 hover:bg-gray-600 w-full font-comic">
          NPC Generator
        </Button>
        <Button className="bg-gray-700 hover:bg-gray-600 w-full font-comic">
          Loot Generator
        </Button>
        <Button className="bg-gray-700 hover:bg-gray-600 w-full font-comic">
          Campaign Notes
        </Button>
      </div>
    </div>
  );
}

