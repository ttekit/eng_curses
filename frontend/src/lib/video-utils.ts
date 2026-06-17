// src/lib/video-utils.ts

/**
 * Создает картинку-превью (Blob) из загруженного видео-файла.
 * Берет кадр на 0.1 секунде.
 */
export function generateVideoThumbnailBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.playsInline = true;
    video.muted = true;
    // Создаем временную ссылку на локальный файл
    video.src = URL.createObjectURL(file);

    // Как только подгрузятся метаданные, перематываем на 0.1 секунды
    video.onloadeddata = () => {
      video.currentTime = 0.1;
    };

    // Когда перемотка завершена, рисуем кадр на canvas
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Конвертируем canvas в jpeg изображение (Blob)
      canvas.toBlob(
        (blob) => {
          // Обязательно очищаем память
          URL.revokeObjectURL(video.src);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas blob generation failed"));
          }
        },
        "image/jpeg",
        0.85,
      );
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(video.src);
      reject(e);
    };
  });
}
