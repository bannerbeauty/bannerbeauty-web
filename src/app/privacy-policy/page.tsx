export const metadata = {
  title: 'Privacy Policy | Banner Beauty',
  description: 'How Banner Beauty collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ background: '#1B2A4A', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '1rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#C5A028',
          margin: '0 0 16px',
        }}>
          ★ Your Privacy Matters ★
        </p>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 700,
          color: '#FFFFFF',
          margin: '0 0 16px',
        }}>
          Privacy Policy
        </h1>
        <p style={{
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.6)',
          margin: 0,
        }}>
          Last updated: June 5, 2026
        </p>
      </section>

      {/* Content */}
      <section style={{ background: '#FAF7F2', padding: '72px 24px' }}>
        <div style={{
          maxWidth: 760,
          margin: '0 auto',
          fontFamily: 'Trebuchet MS, sans-serif',
          fontSize: '1rem',
          color: '#333333',
          lineHeight: 1.8,
        }}>

          <p>
            Banner Beauty, LLC (&ldquo;Banner Beauty,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is a California limited liability company. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website at <a href="https://www.bannerbeauty.com" style={{ color: '#B22234' }}>www.bannerbeauty.com</a> and related services (collectively, the &ldquo;Service&rdquo;). We operate exclusively within the United States.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including:</p>
          <ul style={{ paddingLeft: 24 }}>
            <li><strong>Account information:</strong> your first and last name, email address, phone number, and mailing address when you create an account or update your profile.</li>
            <li><strong>Banner Bump information:</strong> the address of the flag you are reporting, notes you write to the recipient, and any photos you upload.</li>
            <li><strong>Payment information:</strong> billing details processed securely through Stripe. We do not store your credit card number — Stripe handles all payment data.</li>
            <li><strong>Communication preferences:</strong> whether you have opted in to email or SMS updates.</li>
            <li><strong>Location data:</strong> the latitude and longitude of banner locations, derived from the addresses you submit, used to display banners on our interactive map.</li>
          </ul>

          <p>We also collect limited technical information automatically, including your IP address, browser type, and pages visited, for the purposes of security and site performance.</p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul style={{ paddingLeft: 24 }}>
            <li>Create and manage your account</li>
            <li>Process Banner Bump orders and payments</li>
            <li>Deliver letters, gift certificates, and flags to recipients</li>
            <li>Display banner locations on our public map</li>
            <li>Send order confirmations, receipts, and service updates</li>
            <li>Send marketing emails or SMS messages if you have opted in</li>
            <li>Respond to your support requests</li>
            <li>Improve and maintain our Service</li>
          </ul>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>3. How We Share Your Information</h2>
          <p>We do not sell your personal information. We share your information only in these limited circumstances:</p>
          <ul style={{ paddingLeft: 24 }}>
            <li><strong>Service providers:</strong> We share information with third-party vendors who help us operate the Service, including Stripe (payments), Twilio (SMS), Microsoft Azure (cloud infrastructure and authentication), and Google (address autocomplete). These providers are contractually required to protect your information.</li>
            <li><strong>Recipients of Banner Bumps:</strong> When you send a Banner Bump, the recipient&apos;s name and address are shared with our fulfillment process. Your name is shared with the recipient only if you choose to include it.</li>
            <li><strong>Legal requirements:</strong> We may disclose your information if required by law or to protect the rights and safety of Banner Beauty or others.</li>
          </ul>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>4. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as needed to provide the Service. You may request deletion of your account and associated data at any time by contacting us at <a href="mailto:support@bannerbeauty.com" style={{ color: '#B22234' }}>support@bannerbeauty.com</a>.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>5. Security</h2>
          <p>
            We take reasonable technical and organizational measures to protect your personal information from unauthorized access, loss, or misuse. Payment data is handled exclusively by Stripe, which is PCI-DSS compliant. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>6. Your Choices</h2>
          <ul style={{ paddingLeft: 24 }}>
            <li><strong>Account information:</strong> You may update your name, address, and phone number at any time from your Profile page.</li>
            <li><strong>Email and SMS:</strong> You may opt out of marketing communications at any time by updating your Communication Preferences on your Profile page, or by replying STOP to any SMS message.</li>
            <li><strong>Account deletion:</strong> To request deletion of your account and data, email us at <a href="mailto:support@bannerbeauty.com" style={{ color: '#B22234' }}>support@bannerbeauty.com</a>.</li>
          </ul>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>7. Children&apos;s Privacy</h2>
          <p>
            The Service is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us and we will promptly delete it.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will update the &ldquo;Last updated&rdquo; date at the top of this page. We encourage you to review this page periodically. Continued use of the Service after changes constitutes your acceptance of the updated policy.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <p>
            <strong>Banner Beauty, LLC</strong><br />
            <a href="mailto:support@bannerbeauty.com" style={{ color: '#B22234' }}>support@bannerbeauty.com</a>
          </p>
        </div>
      </section>
    </>
  );
}
