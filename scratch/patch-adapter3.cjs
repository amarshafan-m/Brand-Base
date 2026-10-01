const fs = require('fs');
let code = fs.readFileSync('src/js/main/premiere/CEPPremiereAdapter.ts', 'utf8');

code = code.replace(
  /async getContext\(\): Promise<PremiereContext> \{[\s\S]*?\n  \}/,
  `async getContext(): Promise<PremiereContext> {
    try {
      // @ts-ignore
      const result = await evalTS("bbGetContext");
      return result || { projectAvailable: false, sequenceAvailable: false };
    } catch (e) {
      require('fs').writeFileSync('/Users/amarshafanm/Desktop/premiere_error.txt', JSON.stringify(e) + " " + e);
      return { projectAvailable: false, sequenceAvailable: false };
    }
  }`
);

fs.writeFileSync('src/js/main/premiere/CEPPremiereAdapter.ts', code);
console.log('Patched CEPPremiereAdapter');
