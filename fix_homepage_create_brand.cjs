const fs = require('fs');
const file = 'src/js/main/pages/HomePage.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import
if (!code.includes('CreateBrandModal')) {
  code = code.replace(
    'import { useAssetImport } from "../hooks/useAssetImport";',
    'import { useAssetImport } from "../hooks/useAssetImport";\nimport { CreateBrandModal } from "../components/CreateBrandModal";'
  );
}

// Add state
if (!code.includes('showCreateBrand')) {
  code = code.replace(
    '  const [hasLibrary, setHasLibrary] = useState(libraryManager.isLoaded());',
    '  const [hasLibrary, setHasLibrary] = useState(libraryManager.isLoaded());\n  const [showCreateBrand, setShowCreateBrand] = useState(false);'
  );
}

// Update click handler
code = code.replace(
  'onClick={() => onNavigate("brands")} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") onNavigate("brands"); }}',
  'onClick={() => setShowCreateBrand(true)} onKeyDown={(e) => { if(e.key === "Enter" || e.key === " ") setShowCreateBrand(true); }}'
);

// Add modal render
if (!code.includes('<CreateBrandModal')) {
  code = code.replace(
    '    </div>\n  );\n}\n',
    `      {showCreateBrand && (
        <CreateBrandModal 
          onClose={() => setShowCreateBrand(false)}
          onSuccess={(name) => {
            setShowCreateBrand(false);
            onShowNotice(\`Brand "\${name}" created.\`);
            reload();
          }}
        />
      )}
    </div>
  );
}
`
  );
}

fs.writeFileSync(file, code);
console.log("Success");
