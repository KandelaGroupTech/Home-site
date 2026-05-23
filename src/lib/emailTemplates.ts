/**
 * Branded email templates for The Kandela Group investor platform.
 * Used by AdminDocumentUpload and AdminAnnouncements to generate
 * consistent, professional notification emails.
 */

const PLATFORM_URL = 'https://thekandelagroup.com';

const emailWrapper = (bodyContent: string) => `
<!DOCTYPE html>
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
              ${bodyContent}
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
                      &copy; ${new Date().getFullYear()} The Kandela Group LLC. All Rights Reserved.
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

/**
 * Generates a branded email for a new document upload notification.
 */
export function buildDocumentUploadEmail(docTitle: string, recipientFirstName?: string): string {
  const greeting = recipientFirstName ? `Dear ${recipientFirstName},` : 'Dear Investor,';

  const body = `
    <p style="margin:0 0 20px;color:#334155;font-size:14px;line-height:1.7;font-weight:300;">
      ${greeting}
    </p>
    <p style="margin:0 0 24px;color:#334155;font-size:14px;line-height:1.7;font-weight:300;">
      A new document has been uploaded to your investor portal and is ready for your review.
    </p>

    <!-- Document Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#f0fdfa;border:1px solid #ccfbf1;border-left:4px solid #006464;border-radius:8px;padding:20px 24px;">
          <p style="margin:0 0 4px;color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">
            New Document
          </p>
          <p style="margin:0;color:#0f172a;font-size:16px;font-weight:600;">
            ${docTitle}
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 28px;color:#334155;font-size:14px;line-height:1.7;font-weight:300;">
      Please log in to the Kandela Portal to view and download your document.
    </p>

    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
      <tr>
        <td style="background-color:#006464;border-radius:8px;">
          <a href="${PLATFORM_URL}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
            View on Kandela Portal &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  return emailWrapper(body);
}

/**
 * Generates a branded email for a new announcement notification.
 */
export function buildAnnouncementEmail(announcementTitle: string, announcementContent: string, authorName: string, recipientFirstName?: string): string {
  const greeting = recipientFirstName ? `Dear ${recipientFirstName},` : 'Dear Investor,';

  // Convert newlines to <br> for the announcement content
  const formattedContent = announcementContent.replace(/\n/g, '<br>');

  const body = `
    <p style="margin:0 0 20px;color:#334155;font-size:14px;line-height:1.7;font-weight:300;">
      ${greeting}
    </p>
    <p style="margin:0 0 24px;color:#334155;font-size:14px;line-height:1.7;font-weight:300;">
      A new announcement has been posted by <strong style="color:#0f172a;">${authorName}</strong>.
    </p>

    <!-- Announcement Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#f0fdfa;border:1px solid #ccfbf1;border-left:4px solid #006464;border-radius:8px;padding:24px;">
          <p style="margin:0 0 4px;color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">
            Announcement
          </p>
          <p style="margin:0 0 16px;color:#0f172a;font-size:18px;font-weight:600;">
            ${announcementTitle}
          </p>
          <div style="width:32px;height:1px;background-color:#006464;margin-bottom:16px;"></div>
          <p style="margin:0;color:#334155;font-size:14px;line-height:1.7;font-weight:300;">
            ${formattedContent}
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
      <tr>
        <td style="background-color:#006464;border-radius:8px;">
          <a href="${PLATFORM_URL}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
            View on Kandela Portal &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  return emailWrapper(body);
}

/**
 * Generates a branded email to welcome a new user and provide their temporary password.
 */
export function buildWelcomeEmail(email: string, tempPassword: string, recipientFirstName?: string): string {
  const greeting = recipientFirstName ? `Dear ${recipientFirstName},` : 'Dear Investor,';

  const body = `
    <p style="margin:0 0 20px;color:#334155;font-size:14px;line-height:1.7;font-weight:300;">
      ${greeting}
    </p>
    <p style="margin:0 0 24px;color:#334155;font-size:14px;line-height:1.7;font-weight:300;">
      Welcome to <strong>The Kandela Group</strong> platform. An investor account has been created for you.
    </p>

    <!-- Credentials Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#f0fdfa;border:1px solid #ccfbf1;border-left:4px solid #006464;border-radius:8px;padding:24px;">
          <p style="margin:0 0 4px;color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">
            Your Login Credentials
          </p>
          <p style="margin:0 0 8px;color:#0f172a;font-size:14px;font-weight:500;">
            Email: <span style="font-weight:300;">${email}</span>
          </p>
          <p style="margin:0 0 16px;color:#0f172a;font-size:14px;font-weight:500;">
            Temporary Password:
          </p>
          <div style="background-color:#ffffff;border:1px dashed #94a3b8;border-radius:6px;padding:16px;text-align:center;margin-bottom:20px;">
            <code style="font-family:monospace;font-size:20px;color:#0f172a;letter-spacing:3px;background:none;padding:0;user-select:all;">${tempPassword}</code>
          </div>
          <div style="width:32px;height:1px;background-color:#006464;margin-bottom:16px;"></div>
          <p style="margin:0;color:#334155;font-size:12px;line-height:1.7;font-weight:300;">
            For your security, you will be required to change this password when you first log in.
          </p>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
      <tr>
        <td style="background-color:#006464;border-radius:8px;">
          <a href="${PLATFORM_URL}/login" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
            Log in to Portal &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;

  return emailWrapper(body);
}
