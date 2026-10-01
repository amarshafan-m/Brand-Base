var seq = app.project.activeSequence;
if (seq) {
    var time = seq.getPlayerPosition();
    try {
        var result = seq.importMGT("/Users/amarshafanm/Desktop/Brand Base/brands/b1/mogrts/mixkit-280.mogrt", time.ticks, 0, 0);
        var f = new File("/Users/amarshafanm/Desktop/Plugin/Extensions/Brand Base/result.txt");
        f.open("w");
        f.write(result ? "Success" : "Failed importMGT");
        f.close();
    } catch(e) {
        var f = new File("/Users/amarshafanm/Desktop/Plugin/Extensions/Brand Base/result.txt");
        f.open("w");
        f.write("Error with ticks: " + e.message);
        f.close();
    }
}
