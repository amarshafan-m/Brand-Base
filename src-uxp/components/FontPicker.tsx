import { useState, useRef, useEffect } from "react";

const POPULAR_FONTS = [
  // Comprehensive System & Standard Fonts (Simulating macOS/Windows OS lists for Premiere)
  "Academy Engraved LET", "Al Bayan", "Al Nile", "Al Tarikh", "American Typewriter", "Andale Mono", "Apple Braille", 
  "Apple Chancery", "Apple Color Emoji", "Apple SD Gothic Neo", "Apple Symbols", "AppleGothic", "AppleMyungjo", 
  "Arial", "Arial Black", "Arial Hebrew", "Arial Narrow", "Arial Rounded MT Bold", "Arial Unicode MS", "Athelas", 
  "Avenir", "Avenir Next", "Avenir Next Condensed", "Ayuthaya", "Baghdad", "Bangla MN", "Bangla Sangam MN", 
  "Baskerville", "Beirut", "BiauKai", "Big Caslon", "BlinkMacSystemFont", "Bodoni 72", "Bodoni 72 Oldstyle", "Bodoni 72 Smallcaps", 
  "Bodoni Ornaments", "Bradley Hand", "Brush Script MT", "Chalkboard", "Chalkboard SE", "Chalkduster", "Charter", 
  "Cochin", "Comic Sans MS", "Copperplate", "Corsiva Hebrew", "Courier", "Courier New", "Damascus", "DecoType Naskh", 
  "Devanagari MT", "Devanagari Sangam MN", "Didot", "DIN Alternate", "DIN Condensed", "Diwan Kufi", "Diwan Thuluth", 
  "Euphemia UCAS", "Farah", "Farisi", "Futura", "Galvji", "Geeza Pro", "Geneva", "Georgia", "Gill Sans", 
  "Gujarati MT", "Gujarati Sangam MN", "Gurmukhi MN", "Gurmukhi MT", "Gurmukhi Sangam MN", "Heiti SC", "Heiti TC", 
  "Helvetica", "Helvetica Neue", "Herculanum", "Hiragino Maru Gothic ProN", "Hiragino Mincho ProN", 
  "Hiragino Sans", "Hiragino Sans GB", "Hoefler Text", "Impact", "InaiMathi", "Iowan Old Style", "ITF Devanagari", 
  "Kailasa", "Kanna MN", "Kannada Sangam MN", "Kefa", "Kefa III", "Khmer MN", "Khmer Sangam MN", "Kohinoor Bangla", 
  "Kohinoor Devanagari", "Kohinoor Telugu", "Kokonor", "Krungthep", "KufiStandardGK", "League Gothic", 
  "Libre Caslon Text", "Lucida Console", "Lucida Grande", "Lucida Sans Unicode", "Luminari", "Malayalam MN", "Malayalam Sangam MN", "Marion", "Marker Felt", 
  "Menlo", "Microsoft Sans Serif", "Mishafi", "Mishafi Gold", "Monaco", "Mshtakan", "Mukta Mahee", "Muna", 
  "Myanmar MN", "Myanmar Sangam MN", "Nadeem", "New Peninim MT", "Noteworthy", "Optima", "Oriya MN", "Oriya Sangam MN", 
  "OSF", "Palatino", "Papyrus", "Phosphate", "PingFang HK", "PingFang SC", "PingFang TC", "Plantagenet Cherokee", 
  "PT Mono", "PT Sans", "PT Serif", "PT Serif Caption", "Raanana", "Rockwell", "Sana", "Sathu", "Savoye LET", 
  "Seravek", "Shree Devanagari 714", "SignPainter", "Silom", "Sinhala MN", "Sinhala Sangam MN", "Skia", 
  "Snell Roundhand", "Songti SC", "Songti TC", "STIXGeneral", "STIXIntegralsD", "STIXIntegralsSm", "STIXIntegralsUp", 
  "STIXIntegralsUpD", "STIXIntegralsUpSm", "STIXNonUnicode", "STIXSizeFiveSym", "STIXSizeFourSym", "STIXSizeOneSym", 
  "STIXSizeThreeSym", "STIXSizeTwoSym", "STIXVariants", "Superclarendon", "Symbol", "system-ui", "-apple-system", "Tahoma", "Tamil MN", 
  "Tamil Sangam MN", "Telugu MN", "Telugu Sangam MN", "Thonburi", "Times", "Times New Roman", "Trattatello", 
  "Trebuchet MS", "Verdana", "Waseem", "Webdings", "Wingdings", "Wingdings 2", "Wingdings 3", "Zapf Dingbats", 
  "Zapfino",
  // Popular Google Fonts
  "Inter", "Inter Tight", "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins", "Oswald", "Source Sans Pro", "Slabo 27px", "Raleway", "Merriweather", "Ubuntu", "Playfair Display", "Lora", "Nunito", "Titillium Web", "Quicksand", "Work Sans", "Fira Sans", "Barlow", "Inconsolata", "Josefin Sans", "Oxygen", "Dosis", "Cabin", "Anton", "Cairo", "Mukta", "Hind"
].sort();

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export function FontPicker({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter fonts
  const filteredFonts = POPULAR_FONTS.filter(f => f.toLowerCase().includes(search.toLowerCase()));

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={isOpen ? search : value}
        onChange={(e) => {
          setSearch(e.target.value);
          onChange(e.target.value); // Sync custom typing immediately
        }}
        onClick={() => { setIsOpen(true); setSearch(""); }}
        placeholder="Search or type custom font..."
        style={{
          padding: '8px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #444',
          color: '#fff',
          borderRadius: '4px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      />
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: '#1a1a1a',
          border: '1px solid #444',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {filteredFonts.length > 0 ? (
            filteredFonts.map(font => (
              <div
                key={font}
                onClick={() => {
                  onChange(font);
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '13px',
                  fontFamily: font,
                  borderBottom: '1px solid #2a2a2a'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2a2a2a'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {font}
              </div>
            ))
          ) : (
            <div style={{ padding: '8px 12px', color: '#888', fontSize: '13px' }}>
              Press Save to use "{search}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
