export const metadata = {
  title: 'Terms of Service | Banner Beauty',
  description: 'Terms and conditions for using the Banner Beauty platform and purchasing products.',
};

export default function TermsOfServicePage() {
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
          ★ Please Read Carefully ★
        </p>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 700,
          color: '#FFFFFF',
          margin: '0 0 16px',
        }}>
          Terms of Service
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
            Welcome to Banner Beauty. These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the Banner Beauty website at <a href="https://www.bannerbeauty.com" style={{ color: '#B22234' }}>www.bannerbeauty.com</a> and all related services (collectively, the &ldquo;Service&rdquo;) operated by Banner Beauty, LLC, a California limited liability company (&ldquo;Banner Beauty,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>1. Eligibility</h2>
          <p>
            You must be at least 18 years of age and a resident of the United States to use the Service. By using the Service, you represent and warrant that you meet these requirements. The Service is intended for personal, non-commercial use only.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>2. Accounts</h2>
          <p>
            To access certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to keep your account information up to date. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately at <a href="mailto:support@bannerbeauty.com" style={{ color: '#B22234' }}>support@bannerbeauty.com</a> if you suspect unauthorized use of your account.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>3. The Banner Bump Service</h2>
          <p>
            Banner Beauty allows users (&ldquo;Initiators&rdquo;) to send letters, gift certificates, and American flags to neighbors (&ldquo;Recipients&rdquo;) whose flags are in need of replacement. By submitting a Banner Bump, you represent that:
          </p>
          <ul style={{ paddingLeft: 24 }}>
            <li>The flag you are reporting is visible from a public area and is in a genuinely worn or tattered condition.</li>
            <li>You have a good-faith belief that the recipient would welcome the gesture.</li>
            <li>The address you provide for the recipient is accurate to the best of your knowledge.</li>
            <li>You are not using the Service to harass, target, or harm any individual.</li>
          </ul>
          <p>
            Banner Beauty reserves the right to decline or cancel any Banner Bump order at our sole discretion, including if we believe the submission violates these Terms or the spirit of the Service.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>4. Products and Orders</h2>
          <p>
            Banner Beauty sells American flags, flag accessories, and patriotic products (collectively, &ldquo;Products&rdquo;), as well as letter and gift certificate services. All orders are subject to availability. We reserve the right to limit quantities, discontinue products, or refuse orders at any time.
          </p>
          <p>
            Product descriptions, images, and pricing are subject to change without notice. We make reasonable efforts to display Products accurately, but we do not warrant that descriptions or images are error-free. If a Product you receive is materially different from its description, please contact us within 30 days of receipt.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>5. Pricing and Payment</h2>
          <p>
            All prices are listed in U.S. dollars and are exclusive of applicable taxes and shipping unless otherwise stated. We reserve the right to correct pricing errors at any time. If an order is placed at an incorrect price due to a typographical error, we will notify you and give you the option to proceed at the correct price or cancel your order.
          </p>
          <p>
            Payment is processed securely through Stripe. By providing your payment information, you authorize Banner Beauty to charge the applicable amount to your payment method. You represent that you are authorized to use the payment method provided.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>6. Shipping and Delivery</h2>
          <p>
            We ship to addresses within the United States only. Estimated delivery times are provided at checkout and are estimates only — we are not responsible for delays caused by carriers, weather, or other circumstances outside our control. Risk of loss and title for Products pass to you upon delivery to the carrier.
          </p>
          <p>
            For Banner Bump letters, delivery is handled via USPS First Class Mail. For flag and gift certificate orders, delivery timelines will vary by product and are displayed at checkout.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>7. Returns and Refunds</h2>
          <p>
            We want you to be completely satisfied with your purchase. Our return policy is as follows:
          </p>
          <ul style={{ paddingLeft: 24 }}>
            <li><strong>Physical products (flags and accessories):</strong> Unused, unopened items may be returned within 30 days of delivery for a full refund of the product price, excluding shipping. To initiate a return, contact us at <a href="mailto:support@bannerbeauty.com" style={{ color: '#B22234' }}>support@bannerbeauty.com</a>.</li>
            <li><strong>Letters:</strong> Because letters are personalized and mailed upon order, they are non-refundable once sent.</li>
            <li><strong>Gift certificates:</strong> Gift certificates are non-refundable once delivered to the recipient.</li>
            <li><strong>Defective or damaged items:</strong> If you receive a defective or damaged product, contact us within 14 days of receipt and we will arrange a replacement or refund at no cost to you.</li>
          </ul>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>8. Flag Handling and Patriotic Standards</h2>
          <p>
            Banner Beauty is committed to the proper handling and display of the American flag in accordance with the U.S. Flag Code (4 U.S.C. § 1 et seq.). All flags sold by Banner Beauty are manufactured to meet or exceed standard quality guidelines for outdoor display. We encourage all customers to follow proper flag etiquette, including respectful retirement of worn flags through organizations such as the American Legion or Veterans of Foreign Wars (VFW).
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>9. User Content</h2>
          <p>
            You may submit photos, notes, and other content (&ldquo;User Content&rdquo;) through the Service. By submitting User Content, you grant Banner Beauty a non-exclusive, royalty-free, worldwide license to use, display, and reproduce that content in connection with operating and promoting the Service (for example, featuring a Banner Bump story on the home page). You represent that you own or have the right to submit all User Content and that it does not violate any third-party rights or applicable law.
          </p>
          <p>
            You agree not to submit User Content that is false, defamatory, harassing, obscene, or otherwise objectionable. Banner Beauty reserves the right to remove any User Content at our sole discretion.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>10. Prohibited Uses</h2>
          <p>You agree not to:</p>
          <ul style={{ paddingLeft: 24 }}>
            <li>Use the Service for any unlawful purpose or in violation of these Terms</li>
            <li>Submit false, misleading, or fraudulent Banner Bump reports</li>
            <li>Use the Service to harass, stalk, or harm any individual</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Use automated tools to scrape, crawl, or otherwise extract data from the Service</li>
            <li>Resell or commercially exploit any part of the Service without our written consent</li>
          </ul>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>11. Intellectual Property</h2>
          <p>
            All content on the Service, including text, graphics, logos, images, and software, is the property of Banner Beauty or its licensors and is protected by U.S. copyright and trademark law. You may not reproduce, distribute, or create derivative works from any content on the Service without our express written permission.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>12. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE AND ALL PRODUCTS ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. BANNER BEAUTY DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>13. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, BANNER BEAUTY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE OR PRODUCTS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING OUT OF THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>14. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Banner Beauty, LLC and its members, officers, employees, and agents from any claims, damages, losses, and expenses (including reasonable attorneys&apos; fees) arising out of your use of the Service, your User Content, or your violation of these Terms.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>15. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms are governed by the laws of the State of California, without regard to its conflict of law principles. Any dispute arising out of or relating to these Terms or the Service shall be resolved exclusively in the state or federal courts located in San Luis Obispo County, California, and you consent to personal jurisdiction in those courts.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>16. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. When we do, we will update the &ldquo;Last updated&rdquo; date at the top of this page. Your continued use of the Service after changes are posted constitutes your acceptance of the updated Terms. We encourage you to review these Terms periodically.
          </p>

          <h2 style={{ fontFamily: 'Georgia, serif', color: '#1B2A4A', marginTop: 48 }}>17. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
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
