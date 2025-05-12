import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Character } from '../context/CharacterContext';
import { generateCharacterPDF, generatePDFFromElement } from '../lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import { trackEvent } from '../lib/analytics';

interface CharacterPdfButtonProps {
  character: Character;
  elementRef?: React.RefObject<HTMLElement>;
  label?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

/**
 * Button component that generates and downloads a PDF character sheet
 */
const CharacterPdfButton: React.FC<CharacterPdfButtonProps> = ({
  character,
  elementRef,
  label = "Download PDF",
  variant = "outline"
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Generate and download PDF
  const handleGeneratePDF = async () => {
    try {
      setIsGenerating(true);
      
      // Track the event
      trackEvent('generate_pdf', 'character', character.name);
      
      // Use different generation methods based on whether elementRef is provided
      if (elementRef && elementRef.current) {
        // Generate PDF from DOM element (preserves styling)
        await generatePDFFromElement(
          elementRef.current, 
          `${character.name || 'character'}.pdf`
        );
      } else {
        // Generate PDF from character data
        const pdfDataUri = await generateCharacterPDF(character);
        
        // Create an invisible link and trigger download
        const link = document.createElement('a');
        link.href = pdfDataUri;
        link.download = `${character.name || 'character'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast({
        title: "PDF Generated",
        description: "Your character sheet has been downloaded",
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      toast({
        title: "Failed to generate PDF",
        description: "There was an error creating your character sheet",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleGeneratePDF} 
      disabled={isGenerating}
      variant={variant}
      className="gap-2"
    >
      <Download size={16} />
      {isGenerating ? "Generating..." : label}
    </Button>
  );
};

export default CharacterPdfButton;