#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '.env.local');

function updateBackendPort(port, useDevBackend) {
  const content = `# Local development override - you can modify this to switch backends
# Set to 8080 to use production backend, 8081 to use development backend
VITE_BACKEND_PORT=${port}
VITE_USE_DEV_BACKEND=${useDevBackend}`;

  fs.writeFileSync(envLocalPath, content);
  
  const backendType = port === '8081' ? 'Development (port 8081)' : 'Production (port 8080)';
  console.log(`\n✅ Switched to ${backendType} backend`);
  console.log(`📝 Updated .env.local with VITE_BACKEND_PORT=${port}`);
  console.log(`\n🔄 Please restart your Vite dev server for changes to take effect.`);
  console.log(`   Run: npm run dev\n`);
}

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'dev':
  case 'development':
    updateBackendPort('8081', 'true');
    break;
  case 'prod':
  case 'production':
    updateBackendPort('8080', 'false');
    break;
  case 'status':
    try {
      const envContent = fs.readFileSync(envLocalPath, 'utf8');
      const portMatch = envContent.match(/VITE_BACKEND_PORT=(\d+)/);
      const port = portMatch ? portMatch[1] : '8081';
      const backendType = port === '8081' ? 'Development' : 'Production';
      console.log(`\n📊 Current backend configuration:`);
      console.log(`   Backend: ${backendType} (port ${port})`);
      console.log(`   Config file: .env.local\n`);
    } catch (error) {
      console.log(`\n❌ Could not read .env.local file. Run 'node switch-backend.js dev' or 'node switch-backend.js prod' first.\n`);
    }
    break;
  default:
    console.log(`
🔧 Backend Switcher for Furniture Store

Usage:
  node switch-backend.js [command]

Commands:
  dev, development    Switch to development backend (port 8081)
  prod, production    Switch to production backend (port 8080)
  status             Show current backend configuration

Examples:
  node switch-backend.js dev     # Use development backend
  node switch-backend.js prod    # Use production backend
  node switch-backend.js status  # Show current status

Note: Remember to restart your Vite dev server after switching backends.
`);
}