const fs = require('fs');
let io = fs.readFileSync('src/js/main/filesystem/io.ts', 'utf8');
io = io.replace(
  `export async function readJson<T = any>(full: string): Promise<T> {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
}`,
  `export async function readJson<T = any>(full: any): Promise<T> {
    const p = typeof full === 'string' ? full : full.nativePath;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}`
);
fs.writeFileSync('src/js/main/filesystem/io.ts', io);
console.log('Patched io.ts readJson');
