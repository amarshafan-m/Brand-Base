import Foundation
import CoreText

let fontCollection = CTFontCollectionCreateFromAvailableFonts(nil)
if let fontDescriptors = CTFontCollectionCreateMatchingFontDescriptors(fontCollection) as? [CTFontDescriptor] {
    var fonts = Set<String>()
    for descriptor in fontDescriptors {
        if let fontName = CTFontDescriptorCopyAttribute(descriptor, kCTFontFamilyNameAttribute) as? String {
            fonts.insert(fontName)
        }
    }
    
    let sortedFonts = fonts.sorted()
    for font in sortedFonts {
        print(font)
    }
}
