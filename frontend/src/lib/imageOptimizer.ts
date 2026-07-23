import { type PixelCrop } from "react-image-crop";

export const processCroppedImage = (
  image: HTMLImageElement,
  crop: PixelCrop,
  originalFileName: string
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return reject(new Error("Canvas 2D is not supported by this browser"));
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);

    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Error during image conversion"));
        const oldName = originalFileName.replace(/\.[^/.]+$/, "");
        const newFile = new File([blob], `${oldName}-optimized.webp`, {
          type: "image/webp",
        });
        resolve(newFile);
      },
      "image/webp",
      0.95
    );
  });
};