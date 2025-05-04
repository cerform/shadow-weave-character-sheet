
import { jsPDF } from 'jspdf';

// Extend the jsPDF type to include the y property
declare module 'jspdf' {
  interface jsPDF {
    y: number;
  }
}

// Helper function to set Y position
export const setYPosition = (doc: jsPDF, y: number): void => {
  (doc as any).y = y;
};

// Helper function to get Y position
export const getYPosition = (doc: jsPDF): number => {
  return (doc as any).y || 0;
};
