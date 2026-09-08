#!/usr/bin/env bash
set -e

mkdir -p /c/Users/kveld/AppData/Local/Temp/bash-shims

cat > /c/Users/kveld/AppData/Local/Temp/bash-shims/python3 <<'EOF'
#!/usr/bin/env bash
exec "/c/Program Files/Python313/python.exe" "$@"
EOF

cat > /c/Users/kveld/AppData/Local/Temp/bash-shims/node <<'EOF'
#!/usr/bin/env bash
exec "/c/Users/kveld/AppData/Local/Temp/nodejs-install/node-v20.20.2-win-x64/node.exe" "$@"
EOF

cat > /c/Users/kveld/AppData/Local/Temp/bash-shims/npm <<'EOF'
#!/usr/bin/env bash
exec "/c/Users/kveld/AppData/Local/Temp/nodejs-install/node-v20.20.2-win-x64/node.exe" "/c/Users/kveld/AppData/Local/Temp/nodejs-install/node-v20.20.2-win-x64/node_modules/npm/bin/npm-cli.js" "$@"
EOF

chmod +x /c/Users/kveld/AppData/Local/Temp/bash-shims/python3 /c/Users/kveld/AppData/Local/Temp/bash-shims/node /c/Users/kveld/AppData/Local/Temp/bash-shims/npm

export PATH="/c/Users/kveld/AppData/Local/Temp/bash-shims:/c/Program Files/Python313:/c/Program Files/Python313/Scripts:/c/Users/kveld/AppData/Local/Temp/nodejs-install/node-v20.20.2-win-x64:$PATH"

cd /c/Users/kveld/Downloads/files
./setup.sh
