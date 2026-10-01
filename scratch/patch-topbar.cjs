const fs = require('fs');
const path = 'src/js/main/layouts/TopBar.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(/import \{ Icon \} from "..\/components\/Icon";/, 'import { Icon } from "../components/Icon";\nimport { Dropdown } from "../components/Dropdown";');

const oldSelect = `<select 
          value={activeBrand?.id || ""} 
          onChange={handleBrandChange}
          style={{ 
            padding: '6px 12px', 
            backgroundColor: '#1a1a1a', 
            border: '1px solid #444', 
            color: '#fff', 
            borderRadius: '4px',
            fontSize: '13px',
            minWidth: '150px'
          }}
        >
          {brands?.length === 0 && <option value="">No Brands Found</option>}
          {brands?.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>`;

const newSelect = `<Dropdown 
          value={activeBrand?.id || ""} 
          onChange={(newBrandId) => {
            if (!newBrandId) return;
            applicationContainer.brandService.setDefault(newBrandId)
              .then(() => {
                triggerGlobalReload();
                onShowNotice("Active brand changed.");
              })
              .catch((err) => onShowNotice(err.message));
          }}
          options={brands ? brands.map(b => ({ value: b.id, label: b.name })) : []}
          placeholder="No Brands Found"
        />`;

code = code.replace(oldSelect, newSelect);

fs.writeFileSync(path, code);
