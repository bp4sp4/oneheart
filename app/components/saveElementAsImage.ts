// Utility to save a DOM element as an image using html2canvas
import html2canvas from 'html2canvas';

export async function saveElementAsImage(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, { backgroundColor: null });
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
