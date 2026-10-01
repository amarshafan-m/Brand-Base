// ============================
// Brand Base — Premiere Pro ExtendScript Bridge
// Supports: Premiere Pro v20+ (2020) through v26+ (2026)
// ============================

// ------ Utility: Safely find a project item by its media path ------
var findItem = function(item: any, pathToFind: string): any {
  if (!item) return null;
  try {
    var pType: any;
    try { pType = typeof ProjectItemType !== 'undefined' ? ProjectItemType : null; } catch(e) { pType = null; }

    if (pType) {
      if (item.type === pType.CLIP || item.type === pType.FILE) {
        try { if (item.getMediaPath && item.getMediaPath() === pathToFind) return item; } catch(e) {}
      }
    } else {
      try { if (item.getMediaPath && item.getMediaPath() === pathToFind) return item; } catch(e) {}
    }

    if (item.children) {
      var count = 0;
      try { count = item.children.numItems || item.children.length || 0; } catch(e) {}
      for (var i = 0; i < count; i++) {
        try {
          var found = findItem(item.children[i], pathToFind);
          if (found) return found;
        } catch(e) {}
      }
    }
  } catch(e) {}
  return null;
};

var safeGetInsertionBin = function(): any {
  try {
    if (app.project.getInsertionBin) {
      var bin = app.project.getInsertionBin();
      if (bin) return bin;
    }
  } catch(e) {}
  return app.project.rootItem;
};

// ------ Utility: Get or Create Bins for Organization ------
var getOrCreateBin = function(parentBin: any, binName: string): any {
  if (!parentBin) return null;
  try {
    var count = parentBin.children.numItems || 0;
    for (var i = 0; i < count; i++) {
      var child = parentBin.children[i];
      var pType: any;
      try { pType = typeof ProjectItemType !== 'undefined' ? ProjectItemType : null; } catch(e) { pType = null; }
      if (pType && child.type !== pType.BIN && child.type !== 2) continue; // 2 is typically BIN
      
      if (child.name === binName) return child;
    }
  } catch(e) {}
  
  try {
    return parentBin.createBin(binName);
  } catch(e) {
    return parentBin; 
  }
};

var getTargetBinForFile = function(filePath: string): any {
  try {
    var root = app.project.rootItem;
    if (!root) return null;
    
    var brandBaseBin = getOrCreateBin(root, "Brand Base Assets");
    if (!brandBaseBin) brandBaseBin = root;

    var ext = filePath.split('.').pop().toLowerCase();
    var subBinName = "Other";
    if (ext === 'mp4' || ext === 'mov' || ext === 'avi' || ext === 'webm') subBinName = "Videos";
    else if (ext === 'mp3' || ext === 'wav' || ext === 'aac' || ext === 'm4a' || ext === 'aif' || ext === 'aiff' || ext === 'flac') subBinName = "Audio";
    else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif' || ext === 'webp' || ext === 'svg' || ext === 'mogrt') subBinName = "Images";
    
    return getOrCreateBin(brandBaseBin, subBinName) || brandBaseBin;
  } catch(e) {
    return safeGetInsertionBin();
  }
};

var safeImportFiles = function(filePaths: string[], targetBin: any): boolean {
  try {
    var r = app.project.importFiles(filePaths, true, targetBin, false);
    if (r !== false) return true;
  } catch(e) {}
  try {
    var r2 = (app.project as any).importFiles(filePaths, true, targetBin);
    if (r2 !== false) return true;
  } catch(e) {}
  try {
    var r3 = (app.project as any).importFiles(filePaths);
    if (r3 !== false) return true;
  } catch(e) {}
  var anyOk = false;
  for (var i = 0; i < filePaths.length; i++) {
    try { (app.project as any).importFile(filePaths[i]); anyOk = true; } catch(e) {
      try { (app.project as any).importFile(filePaths[i], true, targetBin, false); anyOk = true; } catch(e2) {}
    }
  }
  if (!anyOk) {
    try {
      //@ts-ignore
      if (typeof qe !== 'undefined' && qe.project) {
        for (var j = 0; j < filePaths.length; j++) {
          //@ts-ignore
          qe.project.importFiles([filePaths[j]]);
          anyOk = true;
        }
      }
    } catch(e) {}
  }
  return anyOk;
};

var safeGetPlayerPosition = function(seq: any): any {
  try { return seq.getPlayerPosition(); } catch(e) {}
  return { ticks: "0", seconds: 0 };
};

export const bbGetContext = () => {
  try {
    if (!app.project) return { projectAvailable: false, sequenceAvailable: false };
    var seq: any = null;
    try { seq = app.project.activeSequence; } catch(e) {}
    return {
      projectAvailable: true,
      projectName: app.project.name || "",
      projectPath: app.project.path || "",
      sequenceAvailable: !!seq,
      sequenceName: seq ? (seq.name || "") : undefined,
      sequenceId: seq ? (seq.sequenceID || "") : undefined
    };
  } catch(e) {
    return { projectAvailable: false, sequenceAvailable: false };
  }
};

export const bbGetTimelineContext = () => {
  try {
    if (!app.project || !app.project.activeSequence) return { sequenceAvailable: false };
    var seq = app.project.activeSequence;
    var pos = safeGetPlayerPosition(seq);
    var vTracks = 0; var aTracks = 0;
    try { vTracks = seq.videoTracks.numTracks; } catch(e) {}
    try { aTracks = seq.audioTracks.numTracks; } catch(e) {}
    return {
      sequenceAvailable: true,
      sequenceName: seq.name || "",
      sequenceId: seq.sequenceID || "",
      videoTrackCount: vTracks,
      audioTrackCount: aTracks,
      playheadTicks: pos.ticks || "0",
      playheadSeconds: pos.seconds || 0
    };
  } catch(e) {
    return { sequenceAvailable: false };
  }
};

export const bbImportFiles = (filePaths: string[]) => {
  if (!app.project) throw new Error("No active Premiere project.");
  var anyOk = false;
  for (var i = 0; i < filePaths.length; i++) {
    var p = filePaths[i];
    if (!findItem(app.project.rootItem, p)) {
      var targetBin = getTargetBinForFile(p);
      if (safeImportFiles([p], targetBin)) anyOk = true;
    } else {
      anyOk = true;
    }
  }
  if (!anyOk) throw new Error("Import failed — none of the Premiere import methods succeeded.");
  return true;
};

export const bbEnsureImported = (nativePath: string) => {
  if (!app.project) throw new Error("No active Premiere project.");
  var targetItem = findItem(app.project.rootItem, nativePath);
  if (targetItem) return false;
  var targetBin = getTargetBinForFile(nativePath);
  var ok = safeImportFiles([nativePath], targetBin);
  if (!ok) throw new Error("Failed to import file into project.");
  return true;
};

export const bbPlaceOnTimeline = (nativePath: string, placement: any) => {
  if (!app.project) throw new Error("No active Premiere project.");
  var seq = app.project.activeSequence;
  if (!seq) throw new Error("No active sequence.");
  var time = safeGetPlayerPosition(seq);
  var placeTime: number = time.seconds || 0;

  if (placement.mode !== "playhead" && placement.customTimecode) {
    var parts = placement.customTimecode.split(':');
    if (parts.length === 4) {
      var h = parseInt(parts[0], 10) || 0;
      var m2 = parseInt(parts[1], 10) || 0;
      var s = parseInt(parts[2], 10) || 0;
      var f = parseInt(parts[3], 10) || 0;
      var fps = 30;
      try { fps = 254016000000 / parseInt(seq.timebase, 10); } catch(e) {}
      placeTime = (h * 3600) + (m2 * 60) + s + (f / fps);
    }
  }

  var placeTimeObj = safeGetPlayerPosition(seq);
  try { placeTimeObj.seconds = placeTime; } catch(e) {}

  // MOGRT
  if (nativePath.toLowerCase().indexOf('.mogrt') > -1) {
    var vt = placement.videoTrackIndex !== undefined ? placement.videoTrackIndex : 0;
    var at = placement.audioTrackIndex !== undefined ? placement.audioTrackIndex : 0;
    var mogrtOk = false;
    try { //@ts-ignore
      var r1 = seq.importMGT(nativePath, placeTimeObj.ticks, vt, at); if (r1) mogrtOk = true; } catch(e) {}
    if (!mogrtOk) { try { //@ts-ignore
      var r2 = seq.importMGT(nativePath, placeTimeObj, vt, at); if (r2) mogrtOk = true; } catch(e) {} }
    if (!mogrtOk) { try { //@ts-ignore
      if (typeof seq.importMGTFromLibrary === 'function') { //@ts-ignore
        var r3 = seq.importMGTFromLibrary(nativePath, placeTimeObj.ticks, vt, at); if (r3) mogrtOk = true; } } catch(e) {} }
    if (!mogrtOk) throw new Error("Failed to place MOGRT on timeline.");
    return;
  }

  var targetItem = findItem(app.project.rootItem, nativePath);
  if (!targetItem) {
    safeImportFiles([nativePath], getTargetBinForFile(nativePath));
    //@ts-ignore
    try { $.sleep(200); } catch(e) {}
    targetItem = findItem(app.project.rootItem, nativePath);
  }
  if (!targetItem) throw new Error("Failed to resolve project item after import.");

  var clipDuration = 0;
  try {
    var outPt = targetItem.getOutPoint(); var inPt = targetItem.getInPoint();
    if (outPt && inPt) clipDuration = (outPt.seconds || 0) - (inPt.seconds || 0);
    if (clipDuration <= 0) try { clipDuration = outPt.seconds || 0; } catch(e) {}
  } catch(e) {}
  if (clipDuration <= 0) clipDuration = 10;
  var placeEnd = placeTime + clipDuration;

  var vt2 = placement.videoTrackIndex !== undefined ? placement.videoTrackIndex : 0;
  var at2 = placement.audioTrackIndex !== undefined ? placement.audioTrackIndex : 0;

  if (placement.autoTrack || placement.videoTrackIndex === 'auto') {
    vt2 = 0;
    try { for (var i = 0; i < seq.videoTracks.numTracks; i++) {
      var track = seq.videoTracks[i]; var isOcc = false;
      var nc = 0; try { nc = track.clips.numItems || 0; } catch(e) {}
      for (var c = 0; c < nc; c++) { try { var cl = track.clips[c];
        if ((cl.start.seconds || 0) < placeEnd && (cl.end.seconds || 0) > placeTime) { isOcc = true; break; }
      } catch(e) {} }
      if (!isOcc) { vt2 = i; break; } vt2 = i;
    } } catch(e) {}
  }

  if (placement.autoTrack || placement.audioTrackIndex === 'auto') {
    at2 = 0;
    try { for (var i = 0; i < seq.audioTracks.numTracks; i++) {
      var track = seq.audioTracks[i]; var isOcc = false;
      var nc = 0; try { nc = track.clips.numItems || 0; } catch(e) {}
      for (var c = 0; c < nc; c++) { try { var cl = track.clips[c];
        if ((cl.start.seconds || 0) < placeEnd && (cl.end.seconds || 0) > placeTime) { isOcc = true; break; }
      } catch(e) {} }
      if (!isOcc) { at2 = i; break; } at2 = i;
    } } catch(e) {}
  }

  var inserted = false; var lastError = "";
  var ext = nativePath.split('.').pop().toLowerCase();
  var isAudioOnly = (ext === 'mp3' || ext === 'wav' || ext === 'aac' || ext === 'm4a' || ext === 'aif' || ext === 'aiff' || ext === 'flac');

  if (!isAudioOnly) {
    try { var vTrack = seq.videoTracks[vt2]; if (vTrack) {
      try { inserted = !!(placement.editMode === "overwrite" ? vTrack.overwriteClip(targetItem, placeTimeObj) : vTrack.insertClip(targetItem, placeTimeObj)); } catch(e) { lastError = (e as any).message || String(e); }
      if (!inserted) { try { inserted = !!vTrack.insertClip(targetItem, placeTimeObj.ticks); } catch(e) {} }
      if (!inserted) { try { inserted = !!vTrack.insertClip(targetItem, placeTime); } catch(e) {} }
    } } catch(e) { lastError = lastError || ((e as any).message || String(e)); }
  }

  if (!inserted) {
    try { var aTrack = seq.audioTracks[at2]; if (aTrack) {
      try { inserted = !!(placement.editMode === "overwrite" ? aTrack.overwriteClip(targetItem, placeTimeObj) : aTrack.insertClip(targetItem, placeTimeObj)); } catch(e) { lastError = lastError || ((e as any).message || String(e)); }
      if (!inserted) { try { inserted = !!aTrack.insertClip(targetItem, placeTimeObj.ticks); } catch(e) {} }
      if (!inserted) { try { inserted = !!aTrack.insertClip(targetItem, placeTime); } catch(e) {} }
    } } catch(e) { lastError = lastError || ((e as any).message || String(e)); }
  }

  if (!inserted) {
    try { //@ts-ignore
      if (typeof qe !== 'undefined' && qe.project) { //@ts-ignore
        var qeSeq = qe.project.getActiveSequence(); if (qeSeq) { //@ts-ignore
          var qeTrack = isAudioOnly ? qeSeq.getAudioTrackAt(at2) : qeSeq.getVideoTrackAt(vt2);
          if (qeTrack) { //@ts-ignore
            qeTrack.insertClip(nativePath, placeTimeObj.ticks || "0"); inserted = true;
          }
        }
      }
    } catch(e) {}
  }

  if (!inserted) throw new Error("Failed to place on timeline: " + lastError);
};

export const bbApplyColorToSelection = (hexColor: string) => {
  if (!app.project) throw new Error("No active Premiere project.");
  var seq = app.project.activeSequence;
  if (!seq) throw new Error("No active sequence.");
  var selection: any[] = [];
  try { selection = seq.getSelection() || []; } catch(e) {}
  if (!selection || selection.length === 0) throw new Error("No clips selected.");

  var hex = hexColor.replace("#", "");
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);
  var colorArr = [r, g, b, 255]; var colorNorm = [r/255, g/255, b/255, 1.0];
  var applied = false; var foundNativeText = false;

  for (var i = 0; i < selection.length; i++) {
    var clip = selection[i];
    if (clip.components) {
      var nc = 0; try { nc = clip.components.numItems || 0; } catch(e) {}
      for (var c = 0; c < nc; c++) { try {
        var comp = clip.components[c];
        if (comp.matchName === "AE.ADBE Text") foundNativeText = true;
        if (comp.matchName === "AE.ADBE Motion" || comp.matchName === "AE.ADBE Opacity" || comp.matchName === "AE.ADBE Audio Volume" || comp.matchName === "PR.TimeRemapping") continue;
        var props = comp.properties; if (!props) continue;
        var np = 0; try { np = props.numItems || 0; } catch(e) {}
        for (var p = 0; p < np; p++) { try {
          var param = props[p]; var val = param.getValue();
          if (val && typeof val.fontFamily !== 'undefined') {
            if (typeof val.setFillColor === 'function') { val.setFillColor(r, g, b); applied = true; }
            else if (typeof val.fillColor !== 'undefined') { val.fillColor = colorArr; applied = true; }
            else if (typeof val.color !== 'undefined') { val.color = colorArr; applied = true; }
            if (applied) param.setValue(val);
          }
          var pName = ""; try { pName = (param.displayName || "").toLowerCase(); } catch(e) {}
          if (!applied && (pName.indexOf("color") !== -1 || pName.indexOf("fill") !== -1)) {
            try { param.setValue(colorArr); applied = true; } catch(e) {
              try { param.setValue(colorNorm); applied = true; } catch(e2) {
                try { param.setValue(hexColor); applied = true; } catch(e3) {} } }
          }
        } catch(e) {} }
      } catch(e) {} }
    }
  }
  if (!applied) {
    if (foundNativeText) throw new Error("Cannot apply color: Adobe Premiere Pro does not allow extensions to change the color of Native Graphics (Type Tool). You must use an After Effects MOGRT to apply colors programmatically.");
    throw new Error("Could not apply color directly to the selected graphic layer. Ensure a compatible Essential Graphic is selected.");
  }
};

export const bbApplyFontToSelection = (fontName: string) => {
  if (!app.project) throw new Error("No active Premiere project.");
  var seq = app.project.activeSequence;
  if (!seq) throw new Error("No active sequence.");
  var selection: any[] = [];
  try { selection = seq.getSelection() || []; } catch(e) {}
  if (!selection || selection.length === 0) throw new Error("No clips selected.");
  var applied = false; var foundNativeText = false;

  for (var i = 0; i < selection.length; i++) {
    var clip = selection[i];
    if (clip.components) {
      var nc = 0; try { nc = clip.components.numItems || 0; } catch(e) {}
      for (var c = 0; c < nc; c++) { try {
        var comp = clip.components[c];
        if (comp.matchName === "AE.ADBE Text") foundNativeText = true;
        if (comp.matchName === "AE.ADBE Motion" || comp.matchName === "AE.ADBE Opacity" || comp.matchName === "AE.ADBE Audio Volume" || comp.matchName === "PR.TimeRemapping") continue;
        var props = comp.properties; if (!props) continue;
        var np = 0; try { np = props.numItems || 0; } catch(e) {}
        for (var p = 0; p < np; p++) { try {
          var param = props[p]; var val = param.getValue();
          if (val && typeof val.fontFamily !== 'undefined') { val.fontFamily = fontName; param.setValue(val); applied = true; }
        } catch(e) {} }
      } catch(e) {} }
    }
  }
  if (!applied) {
    if (foundNativeText) throw new Error("Cannot apply typography: Adobe Premiere Pro does not allow extensions to change the font of Native Graphics (Type Tool). You must use an After Effects MOGRT to apply fonts programmatically.");
    throw new Error("Could not apply font directly to the selected graphic layer. Ensure a compatible Essential Graphic is selected.");
  }
};

export const bbCreateTextLayer = (fontFamily: string, fontWeight: string, fontSize: number, text: string, hexColor: string) => {
  if (!app.project) throw new Error("No active Premiere project.");
  var seq = app.project.activeSequence;
  if (!seq) throw new Error("No active sequence. Open a sequence first.");
  var hex = hexColor.replace("#", "");
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);
  var created = false;
  try { //@ts-ignore
    if (typeof qe !== 'undefined' && qe.project && qe.project.getActiveSequence) { //@ts-ignore
      var qeSeq = qe.project.getActiveSequence(); //@ts-ignore
      if (qeSeq && typeof qeSeq.addGraphicsLayer === 'function') { //@ts-ignore
        qeSeq.addGraphicsLayer(); created = true; } }
  } catch(e) {}
  if (created) {
    try {
      var selection: any[] = [];
      try { selection = seq.getSelection() || []; } catch(e) {}
      if (selection && selection.length > 0) {
        var newClip = selection[selection.length - 1];
        if (newClip && newClip.components) {
          var nc = 0; try { nc = newClip.components.numItems || 0; } catch(e) {}
          for (var c = 0; c < nc; c++) { try {
            var comp = newClip.components[c]; if (!comp.properties) continue;
            var np = 0; try { np = comp.properties.numItems || 0; } catch(e) {}
            for (var p = 0; p < np; p++) { try {
              var param = comp.properties[p]; var val = param.getValue();
              if (val && typeof val.fontFamily !== 'undefined') {
                val.fontFamily = fontFamily;
                if (typeof val.fontSize !== 'undefined') val.fontSize = fontSize;
                if (typeof val.text !== 'undefined') val.text = text;
                if (typeof val.setFillColor === 'function') { val.setFillColor(r, g, b); }
                else if (typeof val.fillColor !== 'undefined') { val.fillColor = [r, g, b, 255]; }
                param.setValue(val);
              }
            } catch(e) {} }
          } catch(e) {} }
        }
      }
    } catch(e) {}
    return { success: true, method: "graphicsLayer" };
  }
  throw new Error(
    "Premiere Pro's ExtendScript API does not support creating Essential Graphics text layers programmatically in this version. " +
    "Workaround: Use the Type Tool (T) in Premiere Pro to create a text layer on the timeline, select it, then click the typography style to apply the font."
  );
};
