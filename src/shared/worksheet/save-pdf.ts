import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const CAPTURE_SCALE = 1.5;

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, '-').replace(/\s+/g, '_');
}

/**
 * Uses html2canvas to capture each direct child of `container` as a
 * separate A4 page and assembles them into a single multi-page PDF,
 * then triggers download in the browser.
 */
export async function saveWorksheetAsPdf(
  container: HTMLElement,
  filename: string,
): Promise<void> {
  const pageElements = Array.from(container.children) as HTMLElement[];
  if (pageElements.length === 0) return;

  const pdf = new jsPDF('p', 'mm', [A4_WIDTH_MM, A4_HEIGHT_MM]);

  for (let i = 0; i < pageElements.length; i++) {
    const canvas = await html2canvas(pageElements[i], {
      scale: CAPTURE_SCALE,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const imgWidth = A4_WIDTH_MM;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
  }

  pdf.save(sanitizeFilename(filename));
}
