import re

with open('src/app.css', 'r') as f:
    css = f.read()

# Replace simple place-items: center
css = css.replace('display: grid; place-items: center;', 'display: flex; align-items: center; justify-content: center;')
css = css.replace('display: grid; justify-items: center;', 'display: flex; flex-direction: column; align-items: center;')
css = css.replace('display: grid; align-content: start;', 'display: flex; flex-direction: column; align-items: flex-start;')

# Specific block replacements
css = css.replace('display: grid; min-width: 0; line-height: 1.1; gap: 3px;', 'display: flex; flex-direction: column; min-width: 0; line-height: 1.1; gap: 3px;')
css = css.replace('display: grid; gap: 2px;', 'display: flex; flex-direction: column; gap: 2px;')
css = css.replace('display: grid; padding-top: 8px; border-top: 1px solid #30343b; gap: 6px;', 'display: flex; flex-direction: column; padding-top: 8px; border-top: 1px solid #30343b; gap: 6px;')
css = css.replace('display: grid; width: 170px; padding: 4px;', 'display: flex; flex-direction: column; width: 170px; padding: 4px;')
css = css.replace('display: grid; gap: 3px;', 'display: flex; flex-direction: column; gap: 3px;')

# Topbar
css = css.replace('display: grid; grid-template-columns: minmax(120px, .7fr) minmax(210px, 1.45fr) minmax(210px, .9fr);', 'display: flex; justify-content: space-between;')
css = css.replace('.topbar__title { min-width: 0; }', '.topbar__title { flex: 0.7; min-width: 0; }\n.global-search { flex: 1.45; }\n.runtime-status { flex: 0.9; justify-content: flex-end; }')

# Quick actions
css = css.replace('display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));', 'display: flex; flex-direction: row;')
css = css.replace('.quick-actions button { display: grid; grid-template-columns: 20px 1fr;', '.quick-actions button { display: flex; flex-direction: row; flex: 1;')
css = css.replace('.quick-actions small { grid-column: 2; margin-top: 2px;', '.quick-actions small { margin-top: 2px; width: 100%;')
# The button needs flex-wrap or column inside
css = css.replace('.quick-actions button { display: flex; flex-direction: row; flex: 1; align-items: center;', '.quick-actions button { display: flex; flex-direction: row; flex: 1; align-items: center; flex-wrap: wrap;')

# Metrics grid
css = css.replace('.metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));', '.metrics-grid { display: flex; flex-direction: row;')
css = css.replace('.metric-card { display: flex; align-items: center; padding: 13px; border: 1px solid #353a43; border-radius: 6px; background: #202329; gap: 11px; }', '.metric-card { display: flex; align-items: center; padding: 13px; border: 1px solid #353a43; border-radius: 6px; background: #202329; gap: 11px; flex: 1; }')

# Home lower grid
css = css.replace('display: grid; grid-template-columns: 1.3fr 1fr; margin-top: 25px; gap: 11px;', 'display: flex; flex-direction: row; margin-top: 25px; gap: 11px;')
css = css.replace('.active-brand-card {', '.active-brand-card { flex: 1.3; ')
css = css.replace('.recent-activity {', '.recent-activity { flex: 1; ')

# Settings page
css = css.replace('display: grid; grid-template-columns: 160px minmax(0, 1fr);', 'display: flex; flex-direction: row;')
css = css.replace('.settings-nav {', '.settings-nav { width: 160px; ')
css = css.replace('.settings-content {', '.settings-content { flex: 1; ')

# Media queries cleanup for grid
css = re.sub(r'grid-template-columns:[^;]+;', '', css)

with open('src/app.css', 'w') as f:
    f.write(css)

print("CSS Fixed")
