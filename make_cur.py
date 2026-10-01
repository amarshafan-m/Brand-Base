import struct
import base64

# Create a 16x16 cursor with a hotspot at (0, 15) - bottom left
# AND mask, XOR mask
width = 16
height = 16
# XOR mask (pixels): 16 * 16 * 4 bytes (if 32bpp) or just 1bpp. Let's do 32bpp ARGB for simplicity.
# Tip at (0, 15) bottom left.
xor_mask = bytearray(16 * 16 * 4)
and_mask = bytearray(16 * 4) # 4 bytes per row

for y in range(16):
    for x in range(16):
        idx = (y * 16 + x) * 4
        # Draw a diagonal line from bottom-left (0, 15) to top-right (15, 0)
        # Eyedropper shape:
        if abs((15-y) - x) <= 1 and x < 12 and (15-y) < 12:
            xor_mask[idx:idx+4] = b'\x00\x00\x00\xFF' # Black
        elif abs((15-y) - x) <= 2 and x >= 10 and (15-y) >= 10:
            xor_mask[idx:idx+4] = b'\x00\x00\x00\xFF' # Black handle

# Header: reserved(0), type(2=cursor), count(1)
header = struct.pack('<HHH', 0, 2, 1)

# Directory: width(16), height(16), colors(0), reserved(0), hotspotX(0), hotspotY(15), size, offset
size = len(xor_mask) + len(and_mask) + 40
offset = 22
directory = struct.pack('<BBBBHHII', 16, 16, 0, 0, 0, 15, size, offset)

# BMP Header: size(40), w(16), h(32), planes(1), bpp(32), comp(0), img_size(size), 0,0,0,0
bmp_header = struct.pack('<IiiHHIIiiII', 40, 16, 32, 1, 32, 0, size, 0, 0, 0, 0)

cur_data = header + directory + bmp_header + xor_mask + and_mask

with open("dropper.cur", "wb") as f:
    f.write(cur_data)

print(base64.b64encode(cur_data).decode('utf-8'))
