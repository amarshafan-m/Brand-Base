export function copyToClipboard(text: string): boolean {
  // 1. Try Node.js (CEP) clipboard command first
  try {
    // @ts-ignore
    if (typeof require !== 'undefined') {
      // @ts-ignore
      const cp = require('child_process');
      // @ts-ignore
      const platform = typeof process !== 'undefined' ? process.platform : 'darwin';
      if (platform === 'darwin') {
        cp.spawnSync('pbcopy', { input: text });
        return true;
      } else if (platform === 'win32') {
        cp.spawnSync('clip', { input: text });
        return true;
      }
    }
  } catch (e) {
    console.warn("Node clipboard fallback failed", e);
  }

  // 2. Try modern clipboard API
  try {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
      return true;
    }
    
    // 3. Fallback to execCommand for non-secure contexts
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
}
