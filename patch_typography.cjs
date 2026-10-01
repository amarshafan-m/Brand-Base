const fs = require('fs');
const file = 'src/js/main/components/EditTypographyModal.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('updateName(')) {
  const guessFn = `
  const guessTypographyName = (family: string, roleVal: string) => {
    const roleName = roleVal.charAt(0).toUpperCase() + roleVal.slice(1);
    return \`\${family} \${roleName}\`;
  };

  const updateName = (newFamily: string, newRole: string) => {
    // Only auto-update if name is empty or matches the previously auto-generated name
    if (!name || name === guessTypographyName(fontFamily, role)) {
      setName(guessTypographyName(newFamily, newRole));
    }
  };
  `;
  
  code = code.replace(
    'const [error, setError] = useState<string | null>(null);',
    'const [error, setError] = useState<string | null>(null);\n' + guessFn
  );
  
  code = code.replace(
    '<FontPicker value={fontFamily} onChange={setFontFamily} />',
    '<FontPicker value={fontFamily} onChange={(val) => { updateName(val, role); setFontFamily(val); }} />'
  );
  
  code = code.replace(
    'onChange={val => setRole(val as any)}',
    'onChange={val => { const newRole = val as any; updateName(fontFamily, newRole); setRole(newRole); }}'
  );

  fs.writeFileSync(file, code);
}
