import { applicationContainer } from "../app/application";
import { csi } from "../../lib/utils/bolt";
import { ensureFolderSync } from "../filesystem/io";

const https = typeof window !== 'undefined' && window.require ? window.require('https') : null;
const fs = typeof window !== 'undefined' && window.require ? window.require('fs') : null;
const path = typeof window !== 'undefined' && window.require ? window.require('path') : null;
const os = typeof window !== 'undefined' && window.require ? window.require('os') : null;
const AdmZip = typeof window !== 'undefined' && window.require ? window.require('adm-zip') : null;
const child_process = typeof window !== 'undefined' && window.require ? window.require('child_process') : null;

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
    if (!https || !fs || !path || !os || !AdmZip || !child_process) throw new Error("Node environment not fully available for OTA.");
    
    return new Promise((resolve, reject) => {
      const tmpFile = path.join(os.tmpdir(), `brandbase-update-${Date.now()}.zip`);
      
      if (onProgress) onProgress("Downloading update...");
      
      const file = fs.createWriteStream(tmpFile);
      
      const download = (url: string) => {
        https.get(url, (res: any) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            return download(res.headers.location);
          }
          
          res.pipe(file);

          res.on('error', (err: any) => {
            file.close();
            fs.unlink(tmpFile, () => {});
            reject(new Error("Network connection lost during download: " + err.message));
          });
          
          file.on('finish', () => {
            file.close();
            if (onProgress) onProgress("Extracting update...");
            
            try {
              const extensionPath = csi.getSystemPath("extension");
              const zip = new AdmZip(tmpFile);
              
              try {
                // Try standard extraction first
                zip.extractAllTo(extensionPath, true);
                try { fs.unlinkSync(tmpFile); } catch(e) {}
                
                if (onProgress) onProgress("Update installed! Restarting...");
                setTimeout(() => { window.location.reload(); }, 1500);
                resolve();
              } catch (err: any) {
                // Handle Windows Permissions Error
                if (err && (err.code === 'EPERM' || err.message.includes('EPERM') || (err.code === 'ENOENT' && err.message.includes('chmod'))) && os.platform() === 'win32') {
                  if (onProgress) onProgress("Requesting Admin permissions...");
                  const safeExtractDir = path.join(os.tmpdir(), `brandbase-update-ext-${Date.now()}`);
                  ensureFolderSync(safeExtractDir);
                  zip.extractAllTo(safeExtractDir, true);
                  
                  const batFile = path.join(os.tmpdir(), `brandbase-update-${Date.now()}.bat`);
                  fs.writeFileSync(batFile, `xcopy /E /Y /C /Q "${safeExtractDir}\\*" "${extensionPath}\\"`);
                  const psCommand = `Start-Process cmd -ArgumentList '/c ""${batFile}""' -Verb RunAs -Wait`;
                  
                  child_process.exec(`powershell.exe -NoProfile -Command "${psCommand}"`, (error: any) => {
                    try { fs.unlinkSync(tmpFile); } catch(e) {}
                    try { fs.unlinkSync(batFile); } catch(e) {}
                    if (error) {
                      reject(new Error("Update cancelled or failed during Windows administrator prompt."));
                    } else {
                      if (onProgress) onProgress("Update installed! Restarting...");
                      setTimeout(() => { window.location.reload(); }, 1500);
                      resolve();
                    }
                  });
                } 
                // Handle Mac Permissions Error
                else if (err && (err.code === 'EACCES' || err.message.includes('EACCES')) && os.platform() === 'darwin') {
                  if (onProgress) onProgress("Requesting Admin permissions...");
                  const safeExtractDir = path.join(os.tmpdir(), `brandbase-update-ext-${Date.now()}`);
                  ensureFolderSync(safeExtractDir);
                  zip.extractAllTo(safeExtractDir, true);
                  
                  // Escape inner quotes for AppleScript (\\")
                  const macCmd = `cp -R \\"${safeExtractDir}/\\"* \\"${extensionPath}/\\"`;
                  const osaCommand = `osascript -e 'do shell script "${macCmd}" with administrator privileges'`;
                  
                  child_process.exec(osaCommand, (error: any) => {
                    try { fs.unlinkSync(tmpFile); } catch(e) {}
                    if (error) {
                      reject(new Error("Update cancelled or failed during Mac administrator prompt."));
                    } else {
                      if (onProgress) onProgress("Update installed! Restarting...");
                      setTimeout(() => { window.location.reload(); }, 1500);
                      resolve();
                    }
                  });
                } else {
                  reject(err);
                }
              }
            } catch (err) {
              reject(err);
            }
          });
        }).on('error', (err: any) => {
          try { file.close(); } catch (e) {}
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
