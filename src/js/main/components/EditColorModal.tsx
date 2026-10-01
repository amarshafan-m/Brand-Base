import { useState, useRef } from "react";
import { Button } from "./ui";
import { Dropdown } from "./Dropdown";
import { applicationContainer } from "../app/application";
import { triggerGlobalReload } from "../hooks/useApplicationData";
import type { BrandColor, BrandColorType } from "../domain/models";
import { ColorPicker } from "./ColorPicker";
import { guessColorName } from "../utils/colorNames";

interface Props {
  brandId: string;
  color?: BrandColor;
  onClose: () => void;
}

const IS_MAC = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

/**
 * Get Node.js child_process.exec in CEP — tries multiple access methods.
 */
function getExec(): ((cmd: string, opts: any, cb: (err: any, stdout: string, stderr: string) => void) => void) | null {
  try {
    // CEP exposes require in different ways depending on version
    const req = (window as any).require || (window as any).cep_node?.require || (typeof require !== 'undefined' ? require : null);
    if (req) {
      return req('child_process').exec;
    }
  } catch { /* ignore */ }
  return null;
}

/**
 * macOS: Checks if Screen Recording permission is granted.
 * Caches the result so the slow Swift command only runs once per session.
 */
let _cachedPermission: boolean | null = null;

function checkMacScreenRecordingPermission(): Promise<boolean> {
  if (_cachedPermission !== null) {
    return Promise.resolve(_cachedPermission);
  }
  return new Promise((resolve) => {
    const exec = getExec();
    if (!exec) { resolve(false); return; }

    exec(
      `/usr/bin/swift -e 'import CoreGraphics; print(CGPreflightScreenCaptureAccess())'`,
      { timeout: 10000 },
      (error: any, stdout: string, _stderr: string) => {
        if (error) { _cachedPermission = false; resolve(false); return; }
        _cachedPermission = stdout.trim() === 'true';
        resolve(_cachedPermission);
      }
    );
  });
}

// Pre-warm: start the permission check in background immediately on macOS
if (IS_MAC) { checkMacScreenRecordingPermission(); }

/**
 * macOS: Opens native color picker via AppleScript.
 */
function openMacColorPicker(): Promise<string | null> {
  return new Promise((resolve) => {
    const exec = getExec();
    if (!exec) { resolve(null); return; }

    exec(
      `/usr/bin/osascript -e 'choose color'`,
      { timeout: 60000 },
      (error: any, stdout: string, _stderr: string) => {
        if (error) { resolve(null); return; }
        try {
          const cleaned = stdout.replace(/[{}]/g, '').trim();
          const parts = cleaned.split(',').map((s: string) => parseInt(s.trim(), 10));
          if (parts.length >= 3 && parts.every((n: number) => !isNaN(n))) {
            const r = Math.round((parts[0] / 65535) * 255);
            const g = Math.round((parts[1] / 65535) * 255);
            const b = Math.round((parts[2] / 65535) * 255);
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
            resolve(hex);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      }
    );
  });
}

/**
 * Windows Fallback: Opens native color picker via PowerShell.
 * Uses .NET System.Windows.Forms.ColorDialog.
 */
function openWindowsFallbackPicker(): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const nodeFs = (window as any).require ? (window as any).require('fs') : null;
      const nodePath = (window as any).require ? (window as any).require('path') : null;
      const nodeOs = (window as any).require ? (window as any).require('os') : null;
      const exec = (window as any).require ? (window as any).require('child_process').exec : null;

      if (!exec || !nodeFs || !nodePath || !nodeOs) return resolve(null);

      const psScript = [
        'Add-Type -AssemblyName System.Windows.Forms',
        '$d = New-Object System.Windows.Forms.ColorDialog',
        '$d.FullOpen = $true',
        'if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {',
        '  Write-Output ("{0},{1},{2}" -f $d.Color.R, $d.Color.G, $d.Color.B)',
        '} else {',
        '  Write-Output "CANCELLED"',
        '}'
      ].join('\r\n');

      const tmpFile = nodePath.join(nodeOs.tmpdir(), `brandbase_fallback_${Date.now()}.ps1`);
      nodeFs.writeFileSync(tmpFile, psScript, 'utf8');

      exec(`powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File "${tmpFile}"`, { timeout: 120000 }, (error: any, stdout: string) => {
        try { nodeFs.unlinkSync(tmpFile); } catch {}
        if (error) return resolve(null);
        try {
          const out = stdout.trim();
          if (out === 'CANCELLED' || !out) return resolve(null);
          const p = out.split(',').map((s: string) => parseInt(s.trim(), 10));
          if (p.length >= 3 && p.every((n: number) => !isNaN(n))) {
            resolve(`#${p[0].toString(16).padStart(2, '0')}${p[1].toString(16).padStart(2, '0')}${p[2].toString(16).padStart(2, '0')}`.toUpperCase());
          } else resolve(null);
        } catch { resolve(null); }
      });
    } catch { resolve(null); }
  });
}

/**
 * Windows Eyedropper: Opens a fullscreen transparent overlay covering ALL monitors.
 * Falls back to ColorDialog if it crashes.
 */
function openWindowsColorPicker(): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const nodeFs = (window as any).require ? (window as any).require('fs') : null;
      const nodePath = (window as any).require ? (window as any).require('path') : null;
      const nodeOs = (window as any).require ? (window as any).require('os') : null;
      const exec = (window as any).require ? (window as any).require('child_process').exec : null;

      if (!exec || !nodeFs || !nodePath || !nodeOs) return resolve(null);

      const psScript = [
        'Add-Type -AssemblyName System.Windows.Forms',
        'Add-Type -AssemblyName System.Drawing',
        '$bitmap = New-Object System.Drawing.Bitmap(1, 1)',
        '$g = [System.Drawing.Graphics]::FromImage($bitmap)',
        '$form = New-Object System.Windows.Forms.Form',
        '$form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::None',
        '$form.StartPosition = [System.Windows.Forms.FormStartPosition]::Manual',
        '$form.Bounds = [System.Windows.Forms.SystemInformation]::VirtualScreen',
        '$form.TopMost = $true',
        '$form.BackColor = [System.Drawing.Color]::White',
        '$form.Opacity = 0.01',
        '$form.Cursor = [System.Windows.Forms.Cursors]::Cross',
        '$form.ShowInTaskbar = $false',
        '$form.Add_MouseClick({',
        '  param($sender, $e)',
        '  $pos = [System.Windows.Forms.Cursor]::Position',
        '  $form.Hide()',
        '  Start-Sleep -Milliseconds 60',
        '  try {',
        '    $g.CopyFromScreen($pos.X, $pos.Y, 0, 0, (New-Object System.Drawing.Size(1, 1)))',
        '    $p = $bitmap.GetPixel(0, 0)',
        '    Write-Output ("RESULT:#{0:X2}{1:X2}{2:X2}" -f $p.R, $p.G, $p.B)',
        '  } catch {',
        '    Write-Output "ERROR"',
        '  }',
        '  $form.Close()',
        '})',
        '$form.Add_KeyDown({',
        '  param($sender, $e)',
        '  if ($e.KeyCode -eq [System.Windows.Forms.Keys]::Escape) {',
        '    Write-Output "CANCELLED"',
        '    $form.Close()',
        '  }',
        '})',
        '[System.Windows.Forms.Application]::Run($form)',
        '$g.Dispose()',
        '$bitmap.Dispose()'
      ].join('\r\n');

      const tmpFile = nodePath.join(nodeOs.tmpdir(), `brandbase_eyedropper_${Date.now()}.ps1`);
      nodeFs.writeFileSync(tmpFile, psScript, 'utf8');

      exec(`powershell -ExecutionPolicy Bypass -WindowStyle Hidden -File "${tmpFile}"`, { timeout: 120000 }, async (error: any, stdout: string) => {
        try { nodeFs.unlinkSync(tmpFile); } catch {}
        
        const out = stdout.trim();
        
        // If explicitly cancelled, return null
        if (out === 'CANCELLED') return resolve(null);
        
        // If success, return the hex
        if (out.startsWith('RESULT:#') && out.length >= 14) {
          return resolve(out.substring(7, 14));
        }
        
        // If it errored, crashed, or was blocked, fallback to standard dialog
        console.warn("[BrandBase] Eyedropper failed or blocked. Falling back to ColorDialog.");
        const fallback = await openWindowsFallbackPicker();
        resolve(fallback);
      });
    } catch {
      openWindowsFallbackPicker().then(resolve);
    }
  });
}

export function EditColorModal({ brandId, color, onClose }: Props) {
  const [name, setName] = useState(color?.name || "");
  const [hex, setHex] = useState(color?.hex || "#000000");
  const [usage, setUsage] = useState<BrandColorType>(color?.usage || "primary");
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickingColor, setPickingColor] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);

  const updateHexAndName = (newHex: string, currentName: string, oldHex: string) => {
    setHex(newHex);
    
    // Only auto-update if name is empty or if it was the auto-generated name of the previous hex
    if (!currentName || (oldHex && currentName === guessColorName(oldHex))) {
      const guessed = guessColorName(newHex);
      if (guessed) {
        setName(guessed);
      }
    }
  };

  const handleHexChange = (val: string) => {
    updateHexAndName(val, name, hex);
  };

  const handleEyeDropper = async () => {
    setError(null);

    const exec = getExec();
    if (!exec) {
      setError("Node.js not available. Make sure '--enable-nodejs' is set in CEP config.");
      return;
    }

    // On macOS, auto-detect if Screen Recording permission is enabled
    if (IS_MAC) {
      const hasPermission = await checkMacScreenRecordingPermission();
      if (!hasPermission) {
        setShowPermissionPopup(true);
        return;
      }
    }

    await launchPicker();
  };

  const launchPicker = async () => {
    setPickingColor(true);
    setError(null);
    try {
      const result = IS_MAC ? await openMacColorPicker() : await openWindowsColorPicker();
      if (result) {
        updateHexAndName(result, name, hex);
      }
    } catch (err: any) {
      setError("Picker error: " + (err.message || String(err)));
    } finally {
      setPickingColor(false);
    }
  };

  const handleCheckAgain = async () => {
    _cachedPermission = null; // Clear cache to force re-check
    const hasPermission = await checkMacScreenRecordingPermission();
    if (hasPermission) {
      setShowPermissionPopup(false);
      setError(null);
      await launchPicker();
    } else {
      setError("Screen Recording is still not enabled. Please follow the steps and restart Premiere Pro.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanHex = hex.trim();

    if (!cleanName) {
      setError("Please provide a name for this color.");
      return;
    }
    
    if (!cleanHex) {
      setError("Please pick a HEX color value.");
      return;
    }

    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i.test(cleanHex)) {
      setError("Please enter a valid HEX code (e.g. #FF0000).");
      return;
    }

    try {
      const isNew = !color;
      if (isNew) {
        await applicationContainer.colorService.create({ brandId, name: cleanName, hex: cleanHex.toUpperCase(), usage });
      } else {
        await applicationContainer.colorService.update({ ...color, name: cleanName, hex: cleanHex.toUpperCase(), usage });
      }
      triggerGlobalReload();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* ---- macOS Screen Recording Permission Popup ---- */}
      {showPermissionPopup && (
        <div style={{
          backgroundColor: 'var(--bg-hover)',
          padding: '24px',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '340px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          zIndex: 200,
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>🎨</div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', textAlign: 'center' }}>Enable Screen Recording</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
            To use the eyedropper tool to pick colors from your screen, Premiere Pro needs <strong>Screen Recording</strong> permission.
          </p>
          {error && <div style={{ color: 'var(--danger)', fontSize: '12px', marginBottom: '12px', padding: '8px', backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: '4px' }}>{error}</div>}
          <div style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderRadius: '8px', 
            padding: '12px', 
            marginBottom: '16px',
            fontSize: '12px',
            lineHeight: '1.8',
            color: 'var(--text-main)',
          }}>
            <div><strong>Step 1:</strong> Open <strong>System Settings</strong></div>
            <div><strong>Step 2:</strong> Go to <strong>Privacy & Security</strong></div>
            <div><strong>Step 3:</strong> Click <strong>Screen Recording</strong></div>
            <div><strong>Step 4:</strong> Toggle ON for <strong>Adobe Premiere Pro</strong></div>
            <div><strong>Step 5:</strong> Restart Premiere Pro</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={() => { setShowPermissionPopup(false); setError(null); }}>Cancel</Button>
            <Button variant="primary" onClick={handleCheckAgain}>Check Again</Button>
          </div>
        </div>
      )}

      {/* ---- Add / Edit Color Form ---- */}
      {!showPicker && !showPermissionPopup && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-hover)', padding: '24px', borderRadius: '8px', width: '90%', maxWidth: '320px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>{color ? "Edit Color" : "Add Color"}</h2>
          {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
          
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '13px', marginBottom: '16px', width: '100%' }}>
            <span style={{ marginBottom: '4px' }}>Name</span>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} placeholder="e.g. Primary Blue" />
          </label>
          
          <div style={{ display: 'flex', marginBottom: '16px', alignItems: 'flex-end', width: '100%', position: 'relative' }}>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '13px', flex: 1, marginRight: '8px' }}>
              <span style={{ marginBottom: '4px' }}>HEX Value</span>
              <input type="text" value={hex} onChange={e => handleHexChange(e.target.value)} required style={{ padding: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }} placeholder="#FFFFFF" />
            </label>

            {/* Eyedropper button — picks color from anywhere on screen */}
            {(
              <button
                type="button"
                onClick={handleEyeDropper}
                disabled={pickingColor}
                title="Pick color from screen"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  flexShrink: 0,
                  marginRight: '8px',
                  backgroundColor: 'var(--bg-card)',
                  cursor: pickingColor ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-main)',
                  fontSize: '18px',
                  opacity: pickingColor ? 0.5 : 1,
                }}
              >
                {pickingColor ? '…' : '💧'}
              </button>
            )}

            {/* Color preview - opens custom picker */}
            <div role="button" tabIndex={0} aria-label="Open color picker"
              onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") setShowPicker(true); }}
              onClick={() => setShowPicker(true)}
              style={{ width: '36px', height: '36px', borderRadius: '4px', border: '1px solid var(--border)', flexShrink: 0, backgroundColor: hex.length >= 4 ? hex : '#000000', cursor: 'pointer' }} 
            />
          </div>
          
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '13px', marginBottom: '24px', width: '100%' }}>
            <span style={{ marginBottom: '4px' }}>Usage</span>
            <select value={usage} onChange={e => setUsage(e.target.value as BrandColorType)} style={{ padding: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="accent">Accent</option>
              <option value="background">Background</option>
              <option value="text">Text</option>
              <option value="custom">Custom</option>
            </select>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <div style={{ marginRight: '8px' }}><Button variant="secondary" onClick={onClose}>Cancel</Button></div>
            <Button variant="primary" onClick={handleSubmit}>Save</Button>
          </div>
        </form>
      )}
      
      {/* ---- Custom Color Picker ---- */}
      {showPicker && !showPermissionPopup && (
        <ColorPicker 
          initialColor={hex.length >= 4 ? hex : '#000000'} 
          onSelect={(c) => { updateHexAndName(c, name, hex); setShowPicker(false); }} 
          onCancel={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
