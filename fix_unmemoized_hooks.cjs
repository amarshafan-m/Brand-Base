const fs = require('fs');

function processFile(file, regex, memoizedName) {
  let code = fs.readFileSync(file, 'utf8');
  let match = code.match(regex);
  if (match) {
    if (!code.includes('useCallback')) {
      if (code.includes('import { useState')) {
         code = code.replace('import { useState', 'import { useCallback, useState');
      } else if (code.includes('import { useEffect')) {
         code = code.replace('import { useEffect', 'import { useCallback, useEffect');
      } else {
         code = 'import { useCallback } from "react";\n' + code;
      }
    }
    
    // Complex multiline replacements are hard with regex, so we'll do them manually for the known ones.
  }
}
