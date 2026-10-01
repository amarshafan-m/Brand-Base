const fs = require('fs');
const htmlPath = 'src/js/main/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

const script = `
<script>
  window.addEventListener('DOMContentLoaded', function() {
    if (window.__adobe_cep__) {
        try {
            var menuXML = '<Menu><MenuItem Id="reload" Label="Reload" Enabled="true" Checked="false"/><MenuItem Id="forceReload" Label="Force Reload" Enabled="true" Checked="false"/></Menu>';
            window.__adobe_cep__.addEventListener("com.adobe.csxs.events.internal.contextmenu.popup", function (e) {
                if (e.data.menuId === "reload") window.location.reload();
                if (e.data.menuId === "forceReload") window.location.href = window.location.href;
            });
            window.__adobe_cep__.invokeSync("setContextMenu", menuXML);
        } catch(e) {}
    }
  });
</script>
`;

if (!html.includes('setContextMenu')) {
  html = html.replace('</head>', script + '\n</head>');
  fs.writeFileSync(htmlPath, html);
  console.log("Injected context menu script.");
} else {
  console.log("Already injected.");
}
