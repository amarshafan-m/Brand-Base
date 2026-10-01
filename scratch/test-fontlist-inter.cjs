const fontList = require('font-list');
fontList.getFonts()
  .then(fonts => {
    const inter = fonts.find(f => f.toLowerCase().includes('inter'));
    console.log("Found Inter:", inter || 'NO');
  })
  .catch(err => {
    console.log(err);
  });
