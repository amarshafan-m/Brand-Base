const child_process = require('child_process');
const macCmd = `echo \\\"Hello World\\\"`;
const osaCommand = `osascript -e 'do shell script "${macCmd}"'`;
child_process.exec(osaCommand, (error, stdout) => {
    console.log("OUT:", stdout.trim());
});
