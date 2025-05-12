import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Character } from '../context/CharacterContext';

// Format a character ability score and modifier
const formatAbilityScore = (score: number, mod: number): string => {
  return `${score} (${mod >= 0 ? '+' + mod : mod})`;
};

/**
 * Generate a PDF from a character sheet
 * @param character The character data to include in the PDF
 * @returns Promise that resolves when PDF generation is complete
 */
export const generateCharacterPDF = async (character: Character): Promise<string> => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Set font sizes
  const titleSize = 24;
  const headingSize = 16;
  const normalSize = 12;
  const smallSize = 10;
  
  // Set margins and positions
  const margin = 20;
  let yPos = margin;
  const lineHeight = 8;
  
  // Add title
  doc.setFontSize(titleSize);
  doc.setFont('helvetica', 'bold');
  doc.text(character.name, margin, yPos);
  yPos += lineHeight * 2;
  
  // Add secret identity
  doc.setFontSize(normalSize);
  doc.setFont('helvetica', 'italic');
  doc.text(`Secret Identity: ${character.secretIdentity}`, margin, yPos);
  yPos += lineHeight * 1.5;
  
  // Basic info section
  doc.setFontSize(headingSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Character Information', margin, yPos);
  yPos += lineHeight;
  
  doc.setFontSize(normalSize);
  doc.setFont('helvetica', 'normal');
  doc.text(`Concept: ${character.concept}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Origin: ${character.origin}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Archetype: ${character.archetype}`, margin, yPos);
  yPos += lineHeight;
  
  // Physical traits
  doc.text(`Gender: ${character.gender}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Age: ${character.age}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Height: ${character.height}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Weight: ${character.weight}`, margin, yPos);
  yPos += lineHeight * 1.5;
  
  // Attributes section
  doc.setFontSize(headingSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Abilities', margin, yPos);
  yPos += lineHeight;
  
  // Set up columns for abilities
  doc.setFontSize(normalSize);
  doc.setFont('helvetica', 'normal');
  const col1X = margin;
  const col2X = margin + 80;
  
  // Abilities columns
  doc.text(`Strength: ${formatAbilityScore(character.abilities.strength.value, character.abilities.strength.modifier)}`, col1X, yPos);
  doc.text(`Intelligence: ${formatAbilityScore(character.abilities.intelligence.value, character.abilities.intelligence.modifier)}`, col2X, yPos);
  yPos += lineHeight;
  
  doc.text(`Dexterity: ${formatAbilityScore(character.abilities.dexterity.value, character.abilities.dexterity.modifier)}`, col1X, yPos);
  doc.text(`Wisdom: ${formatAbilityScore(character.abilities.wisdom.value, character.abilities.wisdom.modifier)}`, col2X, yPos);
  yPos += lineHeight;
  
  doc.text(`Constitution: ${formatAbilityScore(character.abilities.constitution.value, character.abilities.constitution.modifier)}`, col1X, yPos);
  doc.text(`Charisma: ${formatAbilityScore(character.abilities.charisma.value, character.abilities.charisma.modifier)}`, col2X, yPos);
  yPos += lineHeight * 1.5;
  
  // Combat stats
  doc.setFontSize(headingSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Combat Statistics', margin, yPos);
  yPos += lineHeight;
  
  doc.setFontSize(normalSize);
  doc.setFont('helvetica', 'normal');
  doc.text(`Defense: ${character.defense}`, col1X, yPos);
  doc.text(`Initiative: ${character.initiative}`, col2X, yPos);
  yPos += lineHeight;
  
  doc.text(`Toughness: ${character.toughness}`, col1X, yPos);
  yPos += lineHeight;
  
  doc.text(`Fortitude: ${character.fortitude}`, col1X, yPos);
  doc.text(`Reflex: ${character.reflex}`, col2X, yPos);
  yPos += lineHeight;
  
  doc.text(`Willpower: ${character.willpower}`, col1X, yPos);
  yPos += lineHeight * 1.5;
  
  // Skills section
  doc.setFontSize(headingSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Skills', margin, yPos);
  yPos += lineHeight;
  
  doc.setFontSize(normalSize);
  doc.setFont('helvetica', 'normal');
  
  if (character.skills.length === 0) {
    doc.text('No skills.', margin, yPos);
    yPos += lineHeight;
  } else {
    character.skills.forEach(skill => {
      doc.text(`${skill.name} (${skill.ability}): ${skill.ranks} ranks${skill.trained ? ' (Trained)' : ''}`, margin, yPos);
      yPos += lineHeight;
      
      if (skill.specialization) {
        doc.setFontSize(smallSize);
        doc.text(`   Specialization: ${skill.specialization}`, margin, yPos);
        doc.setFontSize(normalSize);
        yPos += lineHeight;
      }
    });
  }
  yPos += lineHeight * 0.5;
  
  // Add page break if we're getting close to the bottom
  if (yPos > 250) {
    doc.addPage();
    yPos = margin;
  }
  
  // Powers section
  doc.setFontSize(headingSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Powers', margin, yPos);
  yPos += lineHeight;
  
  doc.setFontSize(normalSize);
  doc.setFont('helvetica', 'normal');
  
  if (character.powers.length === 0) {
    doc.text('No powers.', margin, yPos);
    yPos += lineHeight;
  } else {
    character.powers.forEach(power => {
      doc.setFontSize(normalSize);
      doc.setFont('helvetica', 'bold');
      doc.text(`${power.name} (Rank ${power.rank}, Cost ${power.cost})`, margin, yPos);
      yPos += lineHeight;
      
      doc.setFontSize(smallSize);
      doc.setFont('helvetica', 'normal');
      
      // Handle long descriptions by wrapping text
      const splitDescription = doc.splitTextToSize(power.description, 170);
      doc.text(splitDescription, margin, yPos);
      yPos += lineHeight * (splitDescription.length);
      
      if (power.perks && power.perks.length > 0) {
        doc.text('Perks:', margin, yPos);
        yPos += lineHeight;
        power.perks.forEach(perk => {
          doc.text(`• ${perk}`, margin + 5, yPos);
          yPos += lineHeight;
        });
      }
      
      if (power.flaws && power.flaws.length > 0) {
        doc.text('Flaws:', margin, yPos);
        yPos += lineHeight;
        power.flaws.forEach(flaw => {
          doc.text(`• ${flaw}`, margin + 5, yPos);
          yPos += lineHeight;
        });
      }
      
      yPos += lineHeight * 0.5;
      
      // Add page break if we're getting close to the bottom
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }
    });
  }
  
  // Complications section
  doc.setFontSize(headingSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Complications', margin, yPos);
  yPos += lineHeight;
  
  doc.setFontSize(normalSize);
  doc.setFont('helvetica', 'normal');
  
  if (character.complications.length === 0) {
    doc.text('No complications.', margin, yPos);
    yPos += lineHeight;
  } else {
    character.complications.forEach(complication => {
      doc.setFont('helvetica', 'bold');
      doc.text(complication.name, margin, yPos);
      yPos += lineHeight;
      
      doc.setFont('helvetica', 'normal');
      const splitDescription = doc.splitTextToSize(complication.description, 170);
      doc.text(splitDescription, margin, yPos);
      yPos += lineHeight * (splitDescription.length + 0.5);
      
      // Add page break if we're getting close to the bottom
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }
    });
  }
  
  // Gear section
  doc.setFontSize(headingSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Gear', margin, yPos);
  yPos += lineHeight;
  
  doc.setFontSize(normalSize);
  doc.setFont('helvetica', 'normal');
  
  if (character.gear.length === 0) {
    doc.text('No gear.', margin, yPos);
  } else {
    character.gear.forEach(item => {
      doc.setFont('helvetica', 'bold');
      doc.text(item.name, margin, yPos);
      yPos += lineHeight;
      
      doc.setFont('helvetica', 'normal');
      const splitDescription = doc.splitTextToSize(item.description, 170);
      doc.text(splitDescription, margin, yPos);
      yPos += lineHeight * (splitDescription.length + 0.5);
      
      // Add page break if we're getting close to the bottom
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }
    });
  }
  
  // Footer with points spent
  doc.setFontSize(smallSize);
  doc.text(`Points Spent: Abilities ${character.pointsSpent.abilities}, Skills ${character.pointsSpent.skills}, Powers ${character.pointsSpent.powers}, Total ${character.pointsSpent.total}`, margin, 285);
  
  // Generate the PDF and return it as a data URL
  const pdfOutput = doc.output('datauristring');
  
  // Track PDF generation with analytics
  try {
    // You could add analytics tracking here
    console.log('PDF generated for character:', character.name);
  } catch (error) {
    console.error('Error tracking PDF generation:', error);
  }
  
  return pdfOutput;
};

/**
 * Generate a PDF from a DOM element using html2canvas
 * This is useful for rendering a complete character sheet with exact styling
 * @param element The DOM element to capture
 * @param filename The name of the output PDF file
 */
export const generatePDFFromElement = async (element: HTMLElement, filename: string): Promise<void> => {
  // Capture the DOM element as a canvas
  const canvas = await html2canvas(element, {
    scale: 2, // Higher scale for better quality
    useCORS: true,
    logging: false,
    allowTaint: true
  });
  
  // Create PDF of the right size
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Calculate dimensions to fit the content properly
  const imgWidth = 210; // A4 width in mm (210mm)
  const imgHeight = canvas.height * imgWidth / canvas.width;
  
  // Add the image to the PDF
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  
  // Save the PDF
  pdf.save(filename);
};