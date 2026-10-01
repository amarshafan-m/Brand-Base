var time = app.project.activeSequence ? app.project.activeSequence.getPlayerPosition() : null;
try {
    var result = app.project.importFiles(["/Users/amarshafanm/Desktop/Brand Base/brands/b1/presets/destruction_presets.prfpset"], true, app.project.rootItem, false);
    var f = new File("/Users/amarshafanm/Desktop/Plugin/Extensions/Brand Base/result_preset.txt");
    f.open("w");
    f.write(result ? "Success" : "Failed");
    f.close();
} catch(e) {
    var f = new File("/Users/amarshafanm/Desktop/Plugin/Extensions/Brand Base/result_preset.txt");
    f.open("w");
    f.write("Error: " + e.message);
    f.close();
}
