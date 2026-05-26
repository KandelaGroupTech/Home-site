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
    <div style="text-align:center;margin:32px 0 12px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="background-color:#006464;border-radius:50px;box-shadow:0 4px 12px rgba(0,100,100,0.3);">
            <a href="${PLATFORM_URL}" target="_blank" style="display:inline-block;padding:16px 42px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">
              View on Kandela Portal
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;

  return emailWrapper(body);
}

/**
 * Generates a branded email for a new announcement notification.
 */
export function buildAnnouncementEmail(announcementTitle: string, announcementContent: string, authorName: string, recipientFirstName?: string, attachments?: {name: string; url: string}[]): string {
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

    ${attachments && attachments.length > 0 ? `
    <!-- Attachments Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #64748b;border-radius:8px;padding:20px 24px;">
          <p style="margin:0 0 12px;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">
            Attached Documents
          </p>
          <ul style="margin:0;padding:0 0 0 16px;color:#334155;font-size:14px;line-height:1.7;">
            ${attachments.map(att => `
              <li style="margin-bottom:8px;">
                <a href="${att.url}" target="_blank" style="color:#006464;text-decoration:none;font-weight:500;">${att.name}</a>
              </li>
            `).join('')}
          </ul>
        </td>
      </tr>
    </table>
    ` : ''}

    <!-- CTA Button -->
    <div style="text-align:center;margin:32px 0 12px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="background-color:#006464;border-radius:50px;box-shadow:0 4px 12px rgba(0,100,100,0.3);">
            <a href="${PLATFORM_URL}" target="_blank" style="display:inline-block;padding:16px 42px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">
              View on Kandela Portal
            </a>
          </td>
        </tr>
      </table>
    </div>
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
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td style="background-color:#f0fdfa;border:1px solid #ccfbf1;border-left:4px solid #006464;border-radius:8px;padding:20px 24px;">
          <p style="margin:0 0 4px;color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">
            Your Login Email
          </p>
          <p style="margin:0;color:#0f172a;font-size:15px;font-weight:500;">
            ${email}
          </p>
        </td>
      </tr>
    </table>

    <!-- Password Block (separate card for easy copying) -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background-color:#ffffff;border:2px solid #006464;border-radius:8px;padding:24px;text-align:center;">
          <p style="margin:0 0 12px;color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">
            Your Temporary Password
          </p>
          <p style="margin:0 0 12px;font-family:'Courier New',Courier,monospace;font-size:26px;font-weight:bold;color:#006464;letter-spacing:3px;word-spacing:0;line-height:1;">
            ${tempPassword}
          </p>
          <p style="margin:0;color:#64748b;font-size:11px;font-weight:300;line-height:1.5;">
            Copy the password above exactly as shown.<br>You will be asked to change it on first login.
          </p>
        </td>
      </tr>
    </table>


    <!-- CTA Button -->
    <div style="text-align:center;margin:32px 0 12px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="background-color:#006464;border-radius:50px;box-shadow:0 4px 12px rgba(0,100,100,0.3);">
            <a href="${PLATFORM_URL}/login" target="_blank" style="display:inline-block;padding:16px 42px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">
              Log in to Portal
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;

  return emailWrapper(body);
}
