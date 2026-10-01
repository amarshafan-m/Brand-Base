const fs = require('fs');
const file = 'src/js/main/pages/BrandsPage.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldEmptyState = `        <section className="empty-state">
          <div className="empty-state__icon"><Icon name="brand" size={24} /></div>
          <h3>No brands found</h3>
          <p>Create your first brand to start organizing assets.</p>
          <Button variant="primary" icon="plus" onClick={() => setShowCreateModal(true)}>Create Brand</Button>
        </section>`;

const newEmptyState = `        <EmptyState 
          title="No brands found" 
          description="Create your first brand to start organizing assets." 
          icon="brand" 
          action={<Button variant="primary" icon="plus" onClick={() => setShowCreateModal(true)}>Create Brand</Button>} 
        />`;

if (code.includes('No brands found')) {
  code = code.replace(oldEmptyState, newEmptyState);
  fs.writeFileSync(file, code);
  console.log("Success");
}
