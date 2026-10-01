import re

with open('src/app.css', 'r') as f:
    css = f.read()

# 1. Color Palette Modernization
css = css.replace('#202329', '#14161a') # Topbar / Cards background
css = css.replace('#181a1f', '#0d0f12') # App background / Search background
css = css.replace('#28345a', '#1e40af') # Active nav background -> Modern Blue
css = css.replace('#3a4970', '#2563eb') # Active nav border -> Modern Blue Border
css = css.replace('#edf2ff', '#ffffff') # Active nav text
css = css.replace('#b2bac6', '#9ca3af') # Muted text
css = css.replace('#f2f4f8', '#f3f4f6') # Primary text
css = css.replace('#30343b', '#262a33') # Borders

# 2. Reset UXP Native Button Styles
reset_css = """
button {
  appearance: none;
  font-family: inherit;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
}
"""
css = reset_css + css

# 3. Sidebar Nav Items
css = css.replace('.nav-item { display: flex; align-items: center; width: 100%; min-height: 30px; padding: 0 8px; border: 1px solid transparent; border-radius: 5px; color: #9ca3af; background: transparent; gap: 9px; text-align: left; cursor: pointer; }',
                  '.nav-item { display: flex; align-items: center; width: 100%; min-height: 36px; padding: 0 12px; border: 1px solid transparent; border-radius: 8px; color: #9ca3af; background: transparent; gap: 12px; text-align: left; cursor: pointer; transition: all 0.2s; font-weight: 500; }')
css = css.replace('.nav-item.is-active { border-color: #2563eb; color: #ffffff; background: #1e40af; }',
                  '.nav-item.is-active { border-color: transparent; color: #ffffff; background: #2563eb; box-shadow: 0 2px 10px rgba(37, 99, 235, 0.2); }')
css = css.replace('.nav-item:hover { color: #e8ecf5; background: #262a30; }',
                  '.nav-item:hover:not(.is-active) { color: #f3f4f6; background: #262a33; }')

# 4. Brand Logo
css = css.replace('.brand-mark { display: flex; flex: 0 0 27px; width: 27px; height: 27px; align-items: center; justify-content: center; border: 1px solid #658df0; border-radius: 7px; color: #dbe5ff; background: #263a70; box-shadow: inset 0 0 0 1px #304b8c; }',
                  '.brand-mark { display: flex; flex: 0 0 32px; width: 32px; height: 32px; align-items: center; justify-content: center; border: none; border-radius: 8px; color: #ffffff; background: #2563eb; font-weight: bold; font-size: 18px; box-shadow: 0 2px 10px rgba(37, 99, 235, 0.3); }')

# 5. Buttons (Primary / Secondary)
css = css.replace('.bb-button { display: inline-flex; align-items: center; justify-content: center; min-height: 28px; padding: 0 13px; border: 1px solid transparent; border-radius: 5px; font-size: 11px; font-weight: 650; white-space: nowrap; cursor: pointer; gap: 6px; }',
                  '.bb-button { display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 0 16px; border: 1px solid transparent; border-radius: 6px; font-size: 12px; font-weight: 600; white-space: nowrap; cursor: pointer; gap: 8px; transition: all 0.2s; }')
css = css.replace('.bb-button--primary { color: #fff; background: #375bb5; box-shadow: inset 0 1px 0 #577edb, 0 1px 2px #00000040; text-shadow: 0 1px 1px #0000004d; }',
                  '.bb-button--primary { color: #ffffff; background: #2563eb; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25); }')
css = css.replace('.bb-button--primary:hover:not(:disabled) { background: #4267c7; }',
                  '.bb-button--primary:hover:not(:disabled) { background: #3b82f6; }')
css = css.replace('.bb-button--secondary { border-color: #484e59; color: #e1e5ee; background: #2a2e36; }',
                  '.bb-button--secondary { border-color: #374151; color: #e5e7eb; background: #1f2937; }')
css = css.replace('.bb-button--secondary:hover:not(:disabled) { background: #333842; }',
                  '.bb-button--secondary:hover:not(:disabled) { background: #374151; }')

# 6. Quick Actions Fix
css = css.replace('.quick-actions button { display: flex; flex-direction: row; flex: 1; align-items: center; flex-wrap: wrap; min-height: 62px; padding: 10px 12px; border: 0; border-right: 1px solid #353a43; color: #dce1ea; background: #14161a; column-gap: 8px; text-align: left; cursor: pointer; }',
                  '.quick-actions button { display: flex; flex-direction: column; flex: 1; align-items: flex-start; justify-content: center; min-height: 72px; padding: 12px 16px; border: 0; border-right: 1px solid #262a33; color: #f3f4f6; background: #14161a; gap: 4px; text-align: left; cursor: pointer; transition: background 0.2s; }')
css = css.replace('.quick-actions span { font-size: 11px; font-weight: 650; }',
                  '.quick-actions span { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px; }')
css = css.replace('.quick-actions small { margin-top: 2px; width: 100%; color: #858e9d; font-size: 10px; }',
                  '.quick-actions small { color: #9ca3af; font-size: 11px; font-weight: 400; }')

# 7. Metric Cards
css = css.replace('.metric-card { display: flex; align-items: center; padding: 13px; border: 1px solid #353a43; border-radius: 6px; background: #14161a; gap: 11px; flex: 1; }',
                  '.metric-card { display: flex; align-items: center; padding: 16px; border: 1px solid #262a33; border-radius: 8px; background: #14161a; gap: 14px; flex: 1; }')
css = css.replace('.metric-card__icon { display: flex; align-items: center; justify-content: center; width: 29px; height: 29px; border: 1px solid #3d4552; border-radius: 5px; color: #aabcf2; background: #272d38; }',
                  '.metric-card__icon { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: none; border-radius: 8px; color: #3b82f6; background: rgba(59, 130, 246, 0.1); }')

# 8. Premiere Status Indicator
css = css.replace('.section-status { padding: 3px 8px; border: 1px solid #353a43; border-radius: 20px; font-size: 9px; font-weight: 600; text-transform: uppercase; }',
                  '.section-status { padding: 4px 10px; border: 1px solid #059669; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #10b981; background: rgba(16, 185, 129, 0.1); display: flex; align-items: center; gap: 6px; }')
css = css.replace('.section-status::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #4caf50; margin-right: 6px; }',
                  '') # Already added gap and color above

with open('src/app.css', 'w') as f:
    f.write(css)

print("UI CSS Modernized")
