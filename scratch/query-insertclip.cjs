const fs = require('fs');
// Let's create a JSX script that loops through the methods of Track and prints their signatures.
const jsx = `
var seq = app.project.activeSequence;
var vTrack = seq.videoTracks[0];
var methods = [];
for (var k in vTrack) {
  methods.push(k);
}
alert("Methods: " + methods.join(", "));
`;
console.log("No easy way to get signature from ExtendScript.");
