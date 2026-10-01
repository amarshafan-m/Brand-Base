var seq = app.project.activeSequence;
if (seq && seq.videoTracks.numTracks > 0) {
    var track = seq.videoTracks[0];
    if (track.clips.numItems > 0) {
        var clip = track.clips[0];
        var props = [];
        for (var i in clip) {
            if (typeof clip[i] === 'function') props.push(i);
        }
        var f = new File("/Users/amarshafanm/Desktop/Plugin/Extensions/Brand Base/clip_methods.txt");
        f.open("w");
        f.write(props.join("\n"));
        f.close();
    }
}
