import type { ScanImage } from './ai';

export interface Photo extends ScanImage {
  id: string;
  url: string; // for the on-screen thumbnail
}

const MAX_SIDE = 1280;

/** Shrink a phone photo to a ~200-400 KB JPEG so four of them fit in one request. */
export async function toPhoto(file: File): Promise<Photo> {
  const bitmap = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, url: dataUrl, data: dataUrl.split(',')[1], mediaType: 'image/jpeg' };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That photo couldn't be read. Try another one."));
    };
    img.src = url;
  });
}
