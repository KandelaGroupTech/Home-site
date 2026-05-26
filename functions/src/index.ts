import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'kandela-group-database' });
}

const db = admin.firestore();

/**
 * Deletes an investor from Firebase Auth and Firestore.
 * Only callable by admins.
 */
export const deleteInvestor = functions.https.onCall(async (data, context) => {
    // 1. Verify caller is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to call this function.');
    }

    const targetUid = data.uid;
    if (!targetUid || typeof targetUid !== 'string') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The function must be called with one argument "uid" containing the user UID to delete.'
        );
    }

    // 2. Verify caller is an admin
    const callerDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only administrators can delete users.');
    }

    try {
        // 3. Delete from Firebase Auth
        await admin.auth().deleteUser(targetUid);

        // 4. Delete from Firestore
        await db.collection('users').doc(targetUid).delete();

        return { success: true, message: `Successfully deleted user ${targetUid}.` };
    } catch (error) {
        console.error('Error deleting user:', error);
        throw new functions.https.HttpsError('internal', 'An error occurred while deleting the user: ' + (error as any).message);
    }
});

/**
 * Sends a branded password reset email through the Resend-backed mail collection.
 * Generates a Firebase password reset link via Admin SDK and writes it to the
 * `mail` Firestore collection, which the Firebase Trigger Email extension picks up
 * and delivers via Resend — matching the style of welcome and announcement emails.
 */
export const sendPasswordResetEmailBranded = functions.https.onCall(async (data, _context) => {
    const { email } = data;

    if (!email || typeof email !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'A valid email address is required.');
    }

    try {
        // Look up the user to get their first name for the greeting
        let firstName: string | undefined;
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            const userDoc = await db.collection('users').doc(userRecord.uid).get();
            firstName = userDoc.data()?.firstName;
        } catch {
            // User not found or Firestore error — proceed without personalization
        }

        // Generate the Firebase password reset link (handles token generation securely)
        const actionCodeSettings = {
            url: 'https://thekandelagroup.com/update-password',
            handleCodeInApp: false,
        };
        const resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);

        // Build the branded HTML email body inline (mirrors emailTemplates.ts structure)
        const greeting = firstName ? `Dear ${firstName},` : 'Dear Investor,';
        const PLATFORM_URL = 'https://thekandelagroup.com';
        const year = new Date().getFullYear();

        const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Kandela Group</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;padding:32px 40px;border-radius:12px 12px 0 0;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width:12px;height:12px;background-color:#006464;border-radius:50%;display:inline-block;margin-bottom:12px;"></div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;color:#ffffff;letter-spacing:2px;">
                      THE KANDELA <span style="color:#006464;">GROUP</span>
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:12px;">
                    <div style="width:48px;height:1px;background:linear-gradient(to right,transparent,#006464,transparent);"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;">
              <p style="margin:0 0 20px;color:#334155;font-size:14px;line-height:1.7;font-weight:300;">${greeting}</p>
              <p style="margin:0 0 24px;color:#334155;font-size:14px;line-height:1.7;font-weight:300;">
                We received a request to reset the password for your <strong style="color:#0f172a;">The Kandela Group</strong> investor account.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:32px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td style="background-color:#006464;border-radius:50px;box-shadow:0 4px 12px rgba(0,100,100,0.3);">
                      <a href="${resetLink}" target="_blank" style="display:inline-block;padding:16px 42px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Security Notice -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #64748b;border-radius:8px;padding:16px 20px;">
                    <p style="margin:0 0 4px;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">Security Notice</p>
                    <p style="margin:0;color:#475569;font-size:13px;line-height:1.6;font-weight:300;">
                      This link will expire in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email — your password will remain unchanged.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#94a3b8;font-size:11px;">If the button above doesn't work, copy and paste this link into your browser:</p>
              <p style="margin:0;word-break:break-all;">
                <a href="${resetLink}" style="color:#006464;font-size:11px;text-decoration:none;">${resetLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0f172a;padding:28px 40px;border-radius:0 0 12px 12px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <a href="${PLATFORM_URL}" style="color:#5eead4;font-size:12px;text-decoration:none;letter-spacing:1px;font-weight:300;">
                      thekandelagroup.com
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:0 8px;">
                          <a href="https://x.com/TheKandelaGroup" style="color:#94a3b8;font-size:11px;text-decoration:none;">X</a>
                        </td>
                        <td style="color:#334155;font-size:11px;">|</td>
                        <td style="padding:0 8px;">
                          <a href="mailto:info@thekandelagroup.com" style="color:#94a3b8;font-size:11px;text-decoration:none;">Email</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;color:#475569;font-size:10px;letter-spacing:0.5px;">
                      &copy; ${year} The Kandela Group LLC. All Rights Reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        // Write to the `mail` collection — picked up by the Firebase Trigger Email extension → sent via Resend
        await db.collection('mail').add({
            to: email,
            message: {
                from: 'The Kandela Group <noreply@thekandelagroup.com>',
                subject: 'Reset Your Password — The Kandela Group',
                html: htmlBody,
            },
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error sending branded password reset email:', error);
        // If the error is user-not-found, Firebase still returns success to prevent email enumeration
        if (error.code === 'auth/user-not-found') {
            return { success: true };
        }
        throw new functions.https.HttpsError('internal', error.message || 'Failed to send password reset email.');
    }
});
