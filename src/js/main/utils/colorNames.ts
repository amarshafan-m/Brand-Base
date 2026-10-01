export const CSS_COLORS: Record<string, string> = {
  "#000000": "Black",
  "#FFFFFF": "White",
  "#FF0000": "Red",
  "#00FF00": "Green",
  "#0000FF": "Blue",
  "#FFFF00": "Yellow",
  "#00FFFF": "Cyan",
  "#FF00FF": "Magenta",
  "#808080": "Gray",
  "#C0C0C0": "Silver",
  "#800000": "Maroon",
  "#808000": "Olive",
  "#008000": "Dark Green",
  "#800080": "Purple",
  "#008080": "Teal",
  "#000080": "Navy",
  "#FFA500": "Orange",
  "#A52A2A": "Brown",
  "#FFC0CB": "Pink",
  "#FFD700": "Gold",
  "#F5F5DC": "Beige",
  "#4B0082": "Indigo",
  "#40E0D0": "Turquoise",
  "#EE82EE": "Violet",
  "#E6E6FA": "Lavender",
  "#FF7F50": "Coral",
  "#FA8072": "Salmon",
  "#F5DEB3": "Wheat",
  "#D2B48C": "Tan",
  "#90EE90": "Light Green",
  "#ADD8E6": "Light Blue",
  "#FFB6C1": "Light Pink",
  "#2E8B57": "Sea Green",
  "#DDA0DD": "Plum",
  "#87CEEB": "Sky Blue",
  "#20B2AA": "Light Sea Green",
  "#778899": "Light Slate Gray",
  "#B0C4DE": "Light Steel Blue",
  "#FFFFE0": "Light Yellow",
  "#32CD32": "Lime Green",
  "#FAF0E6": "Linen",
  "#66CDAA": "Medium Aquamarine",
  "#0000CD": "Medium Blue",
  "#BA55D3": "Medium Orchid",
  "#9370DB": "Medium Purple",
  "#3CB371": "Medium Sea Green",
  "#7B68EE": "Medium Slate Blue",
  "#00FA9A": "Medium Spring Green",
  "#48D1CC": "Medium Turquoise",
  "#C71585": "Medium Violet Red",
  "#191970": "Midnight Blue",
  "#F5FFFA": "Mint Cream",
  "#FFE4E1": "Misty Rose",
  "#FFE4B5": "Moccasin",
  "#FFDEAD": "Navajo White",
  "#FDF5E6": "Old Lace",
  "#6B8E23": "Olive Drab",
  "#FF4500": "Orange Red",
  "#DA70D6": "Orchid",
  "#EEE8AA": "Pale Goldenrod",
  "#98FB98": "Pale Green",
  "#AFEEEE": "Pale Turquoise",
  "#DB7093": "Pale Violet Red",
  "#FFEFD5": "Papaya Whip",
  "#FFDAB9": "Peach Puff",
  "#CD853F": "Peru",
  "#D8BFD8": "Thistle",
  "#FF6347": "Tomato",
  "#F5F5F5": "White Smoke",
  "#9ACD32": "Yellow Green"
};

export function hexToRgb(hex: string) {
  let c = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  const color = parseInt(c.join(''), 16);
  return {
    r: (color >> 16) & 255,
    g: (color >> 8) & 255,
    b: color & 255
  };
}

export function guessColorName(hex: string): string {
  if (!hex || !hex.startsWith('#')) return "";
  
  try {
    const rgb = hexToRgb(hex);
    let minDistance = Infinity;
    let closestName = "Color";

    for (const [key, name] of Object.entries(CSS_COLORS)) {
      const targetRgb = hexToRgb(key);
      const dr = rgb.r - targetRgb.r;
      const dg = rgb.g - targetRgb.g;
      const db = rgb.b - targetRgb.b;
      // Using Euclidean distance
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist < minDistance) {
        minDistance = dist;
        closestName = name;
      }
    }
    
    // Add brightness adjective based on relative luminance (optional, simple logic)
    // Could just return the closest CSS color directly
    return closestName;
  } catch(e) {
    return "";
  }
}
