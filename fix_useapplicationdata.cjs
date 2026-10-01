const fs = require('fs');
const file = 'src/js/main/hooks/useApplicationData.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  '}, [revision, loader, ...dependencies]);',
  '// eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [revision, ...dependencies]);'
);

fs.writeFileSync(file, code);
console.log("Success");
