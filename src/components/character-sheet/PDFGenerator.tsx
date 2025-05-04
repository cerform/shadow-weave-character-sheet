
import React, { useState } from 'react';

interface PDFGeneratorProps {
  character: any;
  setPdfData: (data: any) => void;
  children: React.ReactNode;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ character, setPdfData, children }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generatePDF = () => {
    setIsGenerating(true);
    
    // Simulate PDF generation
    setTimeout(() => {
      setPdfData(character);
      setIsGenerating(false);
      
      // Alert to show that PDF would be generated in a real implementation
      alert('This is a placeholder for PDF generation. In a real implementation, this would generate and download a PDF.');
    }, 500);
  };
  
  // Return the child element with an onClick that generates the PDF
  return (
    <div onClick={generatePDF} className={isGenerating ? 'opacity-70 pointer-events-none' : ''}>
      {children}
    </div>
  );
};

export default PDFGenerator;
