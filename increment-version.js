// Script para incrementar automaticamente o valor da versão em src/version.json
const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, 'src', 'version.json');

function incrementVersion() {
    if (!fs.existsSync(versionFile)) {
        fs.writeFileSync(versionFile, JSON.stringify({ version: 1 }, null, 2));
        return;
    }
    const data = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
    data.version = (data.version || 0) + 1;
    fs.writeFileSync(versionFile, JSON.stringify(data, null, 2));
}

incrementVersion();
