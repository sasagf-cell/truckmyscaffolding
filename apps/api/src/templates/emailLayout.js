export function getEmailLayout(content, ctaUrl, ctaText, unsubscribeToken) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TrackMyScaffolding</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
  <div style="background-color: #f8fafc; padding: 20px 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #0EA5A0 0%, #0d9488 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <div style="font-size: 28px; font-weight: 300; color: #ffffff; letter-spacing: 1px;">
          <span style="font-family: 'Inter', Arial, sans-serif; font-weight: 300; color: #ffffff;">Track</span><span style="font-family: 'Inter', Arial, sans-serif; font-weight: 700; color: #ffffff;">MyScaffolding</span>
        </div>
      </div>

      <!-- Body Content -->
      <div style="padding: 40px 30px; color: #1E3A5F; font-size: 16px; line-height: 1.6;">
        {{content}}
      </div>

      <!-- CTA Button -->
      {{#if cta_url}}
      <div style="padding: 0 30px 30px 30px; text-align: center;">
        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td style="background-color: #0EA5A0; border-radius: 6px; padding: 12px 24px;">
              <a href="{{cta_url}}" style="color: #ffffff; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px;">
                {{cta_text}}
              </a>
            </td>
          </tr>
        </table>
      </div>
      {{/if}}

      <!-- Footer -->
      <div style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0; text-align: center; border-radius: 0 0 8px 8px;">
        <div style="color: #64748B; font-size: 14px; margin-bottom: 10px;">
          TrackMyScaffolding · <a href="https://trackmyscaffolding.com" style="color: #0EA5A0; text-decoration: none;">trackmyscaffolding.com</a>
        </div>
        <div style="color: #64748B; font-size: 12px;">
          <a href="https://trackmyscaffolding.com/privacy" style="color: #0EA5A0; text-decoration: none; margin-right: 15px;">Privacy Policy</a>
          <a href="https://trackmyscaffolding.com/unsubscribe?token={{unsubscribe_token}}" style="color: #0EA5A0; text-decoration: none;">Unsubscribe</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
