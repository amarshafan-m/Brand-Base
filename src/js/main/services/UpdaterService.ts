import { applicationContainer } from "../app/application";

const https = typeof window !== 'undefined' && window.require ? window.require('https') : null;
const fs = typeof window !== 'undefined' && window.require ? window.require('fs') : null;
const path = typeof window !== 'undefined' && window.require ? window.require('path') : null;
const os = typeof window !== 'undefined' && window.require ? window.require('os') : null;
const AdmZip = typeof window !== 'undefined' && window.require ? window.require('adm-zip') : null;

export interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  releaseNotes: string;
  downloadUrl: string | null;
}

export class UpdaterService {
  private repo = "amarshafan-m/Brand-Base";
  private currentVersion = "1.0.0"; // Should ideally be read from package.json/manifest, hardcoded for now based on v1.0.0

  public async checkForUpdates(): Promise<UpdateInfo> {
    if (!https) return { hasUpdate: false, latestVersion: this.currentVersion, releaseNotes: "", downloadUrl: null };

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: `/repos/${this.repo}/releases/latest`,
        headers: { 'User-Agent': 'Brand-Base-Updater' }
      };

      https.get(options, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => { data += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode === 404) {
              return resolve({ hasUpdate: false, latestVersion: this.currentVersion, releaseNotes: "", downloadUrl: null });
            }
            const release = JSON.parse(data);
            const latestVersion = release.tag_name.replace(/^v/, '');
            
            const hasUpdate = this.compareVersions(latestVersion, this.currentVersion) > 0;
            
            let downloadUrl = null;
            if (hasUpdate && release.assets) {
              const asset = release.assets.find((a: any) => a.name === 'update.zip');
              if (asset) downloadUrl = asset.browser_download_url;
            }

            resolve({
              hasUpdate,
              latestVersion,
              releaseNotes: release.body || "",
              downloadUrl
            });
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', (e: any) => reject(e));
    });
  }

  public async installUpdate(downloadUrl: string, onProgress?: (msg: string) => void): Promise<void> {
    if (!https || !fs || !path || !os || !AdmZip) throw new Error("Node environment not fully available for OTA.");
    
    return new Promise((resolve, reject) => {
      const tmpFile = path.join(os.tmpdir(), `brandbase-update-${Date.now()}.zip`);
      
      if (onProgress) onProgress("Downloading update...");
      
      const file = fs.createWriteStream(tmpFile);
      
      // We need to handle redirects (302) which GitHub uses for asset downloads
      const download = (url: string) => {
        https.get(url, (res: any) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            return download(res.headers.location);
          }
          
          res.pipe(file);
          
          file.on('finish', () => {
            file.close();
            if (onProgress) onProgress("Extracting update...");
            
            try {
              // Get the extension's root directory
              // @ts-ignore
              const extensionPath = window.cep.fs.getInitPath();
              
              const zip = new AdmZip(tmpFile);
              // Extract and overwrite everything
              zip.extractAllTo(extensionPath, true);
              
              // Cleanup
              fs.unlinkSync(tmpFile);
              
              if (onProgress) onProgress("Update installed! Restarting...");
              resolve();
              
              // Give the UI a moment to show the success message before reloading
              setTimeout(() => {
                window.location.reload();
              }, 1500);
              
            } catch (err) {
              reject(err);
            }
          });
        }).on('error', (err: any) => {
          fs.unlink(tmpFile, () => {});
          reject(err);
        });
      };
      
      download(downloadUrl);
    });
  }

  // Returns > 0 if v1 > v2
  private compareVersions(v1: string, v2: string): number {
    const p1 = v1.split('.').map(Number);
    const p2 = v2.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      const n1 = p1[i] || 0;
      const n2 = p2[i] || 0;
      if (n1 > n2) return 1;
      if (n1 < n2) return -1;
    }
    return 0;
  }
}
