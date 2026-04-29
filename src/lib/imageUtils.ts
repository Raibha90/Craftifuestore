export const processImage = (file: File, options?: { maxWidth?: number; maxHeight?: number; format?: 'image/jpeg' | 'image/png' | 'image/webp'; quality?: number; isFavicon?: boolean }): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const format = options?.format || 'image/webp';
        const quality = options?.quality || 0.8;

        if (options?.isFavicon) {
          width = 32;
          height = 32;
        } else if (options?.maxWidth || options?.maxHeight) {
          const maxW = options.maxWidth || width;
          const maxH = options.maxHeight || height;

          if (width > height) {
            if (width > maxW) {
              height = Math.round(height *= maxW / width);
              width = maxW;
            }
          } else {
            if (height > maxH) {
              width = Math.round(width *= maxH / height);
              height = maxH;
            }
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context not available'));
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(format, quality));
      };
      
      img.onerror = reject;
      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
