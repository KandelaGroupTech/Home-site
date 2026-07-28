const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Read token from firebase-tools config
const configPath = path.join(process.env.USERPROFILE, '.config', 'configstore', 'firebase-tools.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const refreshToken = config.tokens.refresh_token;

fs.writeFileSync('refresh.json', JSON.stringify({
  refresh_token: refreshToken,
  client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
  client_secret: 'not-needed',
  type: 'authorized_user'
}));

admin.initializeApp({
  credential: admin.credential.refreshToken('refresh.json'),
  projectId: 'kandela-group-database'
});

async function enableMfa() {
  try {
    const auth = admin.auth();
    console.log("Updating MFA Config...");
    
    await auth.projectConfigManager().updateProjectConfig({
      multiFactorConfig: {
        state: 'ENABLED',
        providerConfigs: [
          {
            state: 'ENABLED',
            totpProviderConfig: {
              adjacentIntervals: 5
            }
          }
        ]
      }
    });
    console.log("Successfully enabled TOTP MFA!");
  } catch (error) {
    console.error("Error updating MFA config:", error);
  }
}

enableMfa();
