export const metadata = {
  title: 'Copyright | Banner Beauty',
  description: 'Copyright notice and intellectual property policy for Banner Beauty.',
};

export default function CopyrightPage() {
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
          ★ Intellectual Property ★
        </p>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 700,
          color: '#FFFFFF',
          margin: '0 0 16px',
        }}>
          Copyright Notice
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
            All content on this website, including but not limited to text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of Banner Beauty, LLC or its content suppliers and is protected by United States and international copyright law.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>Ownership</h2>
          <p>
            &copy; 2026 Banner Beauty, LLC. All rights reserved. The Banner Beauty name, logo, and tagline &ldquo;Building Patriotic Neighborhoods&rdquo; are trademarks of Banner Beauty, LLC. Unauthorized use of any Banner Beauty trademark, service mark, or logo is strictly prohibited.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>Permitted Use</h2>
          <p>
            You may view, download, and print content from this website for your own personal, non-commercial use, provided that you:
          </p>
          <ul style={{ paddingLeft: 24 }}>
            <li>Do not modify or alter the content in any way</li>
            <li>Retain all copyright and proprietary notices</li>
            <li>Do not use the content in a manner that suggests an association with Banner Beauty without our express written consent</li>
          </ul>
          <p>
            Any other use &mdash; including reproduction, modification, distribution, transmission, republication, or display of the content on this site &mdash; without the prior written permission of Banner Beauty, LLC is strictly prohibited.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>User-Submitted Content</h2>
          <p>
            By submitting photos, notes, or other content to Banner Beauty, you represent that you own the rights to that content or have obtained all necessary permissions. You grant Banner Beauty, LLC a non-exclusive, royalty-free license to use, display, and reproduce your submitted content in connection with the Service. Banner Beauty does not claim ownership of content you submit.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>DMCA Notice</h2>
          <p>
            If you believe that any content on this website infringes your copyright, please notify us in writing at the address below. Your notice must include:
          </p>
          <ul style={{ paddingLeft: 24 }}>
            <li>A description of the copyrighted work you claim has been infringed</li>
            <li>The URL or location of the allegedly infringing content on our site</li>
            <li>Your contact information (name, address, phone number, and email)</li>
            <li>A statement that you have a good-faith belief that the use is not authorized by the copyright owner</li>
            <li>A statement that the information in your notice is accurate and, under penalty of perjury, that you are the copyright owner or authorized to act on their behalf</li>
            <li>Your physical or electronic signature</li>
          </ul>
          <p>
            DMCA notices should be sent to:
          </p>
          <p>
            <strong>Banner Beauty, LLC &mdash; Copyright Agent</strong><br />
            <a href="mailto:support@bannerbeauty.com" style={{ color: '#B22234' }}>support@bannerbeauty.com</a>
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>Contact</h2>
          <p>
            For all other copyright or intellectual property inquiries, please contact us at <a href="mailto:support@bannerbeauty.com" style={{ color: '#B22234' }}>support@bannerbeauty.com</a>.
          </p>

        </div>
      </section>
    </>
  );
}
