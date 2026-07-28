const admin = require('firebase-admin');

// We need to use the default credentials or a service account key.
// Assuming the user has firebase-tools logged in, we can use the default credential if we initialize without args.
// However, to be safe, let's just require the service account if needed.
// Actually, since we are in the functions directory, we might not have the credentials set up for default app. Let's try.

admin.initializeApp({
  projectId: 'kandela-group-database'
});

async function enableMfa() {
  try {
    const auth = admin.auth();
    const currentConfig = await auth.projectConfigManager().getProjectConfig();
    console.log("Current MFA Config:", JSON.stringify(currentConfig.multiFactorConfig, null, 2));

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
