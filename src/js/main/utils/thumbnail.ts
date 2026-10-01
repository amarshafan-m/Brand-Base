// @ts-ignore
const nodeFs = typeof window !== 'undefined' && window.require ? window.require('fs') : null;
// @ts-ignore
const nodePath = typeof window !== 'undefined' && window.require ? window.require('path') : null;

export async function generateThumbnail(
  sourceFilePath: string, // Absolute path to original file
  thumbnailFilePath: string, // Absolute path where thumbnail should be saved
  maxWidth = 400,
  maxHeight = 400
): Promise<boolean> {
  if (!nodeFs || !nodePath) return Promise.resolve(false);
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(false);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/webp", 0.8);
        const base64Data = dataUrl.replace(/^data:image\/webp;base64,/, "");

        try {
          const buffer = Buffer.from(base64Data, "base64");
          nodeFs.promises.writeFile(thumbnailFilePath, buffer)
            .then(() => resolve(true))
            .catch((err: any) => {
              console.error("Failed to write thumbnail file", err);
              resolve(false);
            });
        } catch (err) {
          console.error("Failed to write thumbnail file:", err);
          resolve(false);
        }
      };

      img.onerror = (e) => {
        console.error("Failed to load image for thumbnail generation:", e);
        resolve(false);
      };

      const safeUrl = 'file:///' + sourceFilePath.replace(/\\/g, '/');
      img.src = safeUrl;
    } catch (e) {
      console.error("Error generating thumbnail:", e);
      resolve(false);
    }
  });
}

export async function extractMogrtThumbnail(
  mogrtFilePath: string,
  thumbnailFilePath: string
): Promise<boolean> {
  if (!nodeFs || !nodePath) return Promise.resolve(false);
  return new Promise((resolve) => {
    try {
      // @ts-ignore
      const AdmZip = typeof window !== 'undefined' && window.require ? window.require('adm-zip') : null;
      if (!AdmZip) {
        console.warn("adm-zip not available");
        resolve(false);
        return;
      }
      
      const zip = new AdmZip(mogrtFilePath);
      const zipEntries = zip.getEntries();
      
      // Look for any image file inside the MOGRT
      let thumbnailEntry = zipEntries.find((e: any) => e.entryName.match(/(project|thumbnail|preview)\.(png|jpg|jpeg|gif|webp)$/i));
      if (!thumbnailEntry) thumbnailEntry = zipEntries.find((e: any) => e.entryName.match(/\.(png|jpg|jpeg|gif|webp)$/i));

      if (thumbnailEntry) {
        const buffer = thumbnailEntry.getData();
        nodeFs.promises.writeFile(thumbnailFilePath, buffer)
          .then(() => resolve(true))
          .catch((err: any) => {
            console.error("Failed to write mogrt thumbnail file", err);
            resolve(false);
          });
      } else {
        resolve(false);
      }
    } catch (e) {
      console.error("Error extracting mogrt thumbnail:", e);
      resolve(false);
    }
  });
}
