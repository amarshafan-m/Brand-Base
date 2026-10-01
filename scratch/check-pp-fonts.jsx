var output = [];
for (var key in app) {
  if (key.toLowerCase().indexOf('font') !== -1) {
    output.push("app." + key);
  }
}
alert("Found app properties: " + output.join(', '));
