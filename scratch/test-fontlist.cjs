const fontList = require('font-list');
fontList.getFonts()
  .then(fonts => {
    console.log("Total fonts:", fonts.length);
  })
  .catch(err => {
    console.log(err);
  });
