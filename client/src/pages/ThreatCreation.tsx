import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ThreatCreation() {
  return (
    <div className="container mx-auto p-4 md:px-8">
      <h1 className="font-display text-3xl mb-6">Threat Creation</h1>
      <p className="text-muted-foreground mb-8">
        Tools for building adversaries and challenges. (Coming soon)
      </p>
      <Link href="/editor">
        <Button className="bg-accent hover:bg-red-700 font-comic">Back to Toolkit</Button>
      </Link>
    </div>
  );
}

