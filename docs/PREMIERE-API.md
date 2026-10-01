# Premiere Pro UXP API Verification

## Verified Phase 0 baseline

Brand Base targets Premiere Pro UXP only. It does not use CEP, `CSInterface`, ExtendScript, `evalScript`, ZXP, Electron, or undocumented Premiere APIs.

Adobe's current Premiere UXP reference documents the Premiere module as `require("premierepro")`. Premiere host method calls are asynchronous. The checked-in `@adobe/premierepro` type package is version 26.5.0.

The manifest minimum host version is **25.6**. This is the earliest documented version for the verified project APIs below.

| Capability | Verification | Planned use | Phase 0 result |
| --- | --- | --- | --- |
| Active project | `Project.getActiveProject()` — since 25.6 | runtime project check | verified; not implemented |
| Active sequence | `Project.getActiveSequence()` — since 25.6 | settings capability display | verified; not implemented |
| Media import | `Project.importFiles(filePaths, suppressUI?, targetBin?, asNumberedStills?)` — since 25.6 | first Premiere integration | verified; not implemented |
| UXP folder picker and entries | `storage.localFileSystem.getFolder()` and `Folder` entry APIs | library selection | verified; not implemented |
| Drag-and-drop into Premiere | no Phase 0 verification | do not offer as functional | unsupported until documented and tested |
| Template use, MOGRT insertion, preview/waveform generation | no Phase 0 verification | do not offer as functional | unsupported until documented and tested |

Sources: [Premiere UXP API overview](https://developer.adobe.com/premiere-pro/uxp/ppro-reference/), [Project API](https://developer.adobe.com/premiere-pro/uxp/ppro-reference/classes/project), and [UXP filesystem operations](https://developer.adobe.com/premiere-pro/uxp/resources/recipes/filesystem-operations/).

## Required implementation sequence

Before every Premiere feature:

1. Verify the exact API in Adobe's current reference and its minimum version.
2. Add the finding and source URL to this document.
3. Implement a small `src/premiere/` adapter with explicit input/output types.
4. Make the service call a runtime capability check and report an unsupported state when unavailable.
5. Test in a supported Premiere build with a project open and closed, valid and invalid files, and denied or missing file access.

`Import into Project` must validate a resolved file entry, verify that the module and active project are available, call only `Project.importFiles`, check its result, and translate errors into a user-facing result. No API call is introduced in Phase 0.

## Capability model

Phase 10 will provide a `CapabilityService` that distinguishes `available`, `unavailable`, `notDetected`, and `error`. The Settings page must derive its status from this service; it must never hard-code “Connected.”

## Phase 6A: Project Integration

1. `Project.getActiveProject()` is confirmed in the types and returns `Promise<Project>`.
2. `Project.name` and `Project.path` are confirmed available on the `Project` type.
3. `Project.getActiveSequence()` is confirmed and returns `Promise<Sequence>`.
4. `Sequence.name` and `Sequence.guid` are confirmed available.
5. `Project.importFiles(filePaths, suppressUI, targetBin, asNumberedStills)` is confirmed. It returns `Promise<boolean>`.

Brand Base safely uses the dynamic `require('premierepro')` to load the module. Missing environments safely fallback.
OS Paths are correctly derived via UXP's `Entry.nativePath` to pass into `importFiles`.

## Phase 6B: Timeline & Sequence Integration

1. `Project.executeTransaction(callback, description)` works securely wrapping compound actions.
2. `Sequence.getVideoTrackCount()` and `Sequence.getAudioTrackCount()` accurately report total available tracks.
3. `Sequence.getPlayerPosition()` safely retrieves the playhead as `TickTime`.
4. `SequenceEditor.getEditor(sequence)` retrieves the editor context.
5. `SequenceEditor.createInsertProjectItemAction(projectItem, time, vTrackIndex, aTrackIndex, limitShift)` returns an `Action`.
6. `SequenceEditor.createOverwriteItemAction(projectItem, time, vTrackIndex, aTrackIndex)` returns an `Action`.
7. **Track Locking:** No explicit `isLocked` track inspection was discovered on `Sequence` or `SequenceEditor`. We rely on the Action commit failing and surface the error if Premiere blocks the locked insertion.
8. **ProjectItem Deduping:** To avoid repetitive asset import duplication, we check `Project.getRootItem().getItems()` for existing clips matching `getMediaFilePath()`. Due to potentially heavy performance constraints on deeply nested bins, we currently only scan the root level.
