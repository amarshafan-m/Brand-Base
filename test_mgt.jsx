var seq = app.project.activeSequence;
var out = [];
if (seq) {
    var selection = seq.getSelection();
    if (selection.length > 0) {
        var clip = selection[0];
        var mgt = clip.getMGTComponent();
        if (mgt) {
            var props = mgt.properties;
            for (var i = 0; i < props.numItems; i++) {
                var prop = props[i];
                out.push(prop.displayName + " (" + prop.propertyType + ")");
            }
        } else {
            out.push("No MGT Component. Components:");
            for (var c = 0; c < clip.components.numItems; c++) {
                out.push(clip.components[c].matchName);
            }
        }
    } else {
        out.push("Nothing selected.");
    }
} else {
    out.push("No active sequence.");
}
app.setSDKEventMessage(out.join("\n"), "info");
