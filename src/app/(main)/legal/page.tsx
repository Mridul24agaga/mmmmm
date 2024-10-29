import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LegalTerms() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="mr-4 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Terms of Service and Privacy Policy</h1>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="prose prose-sm sm:prose lg:prose-lg mx-auto">
          <h2>Introduction</h2>
          <p>Welcome to MemoriesLived.com (the &quot;Website&quot;), a service provided by CJM Ashton, LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By creating an account and accessing or using our Website, you agree to be bound by the following Terms of Service (&quot;Terms&quot;) and Privacy Policy. Please read them carefully before using the Website.</p>
          <p>Your use of the Website is subject to these Terms and our Privacy Policy, which govern your access to and use of the Website, and you agree to be bound by them. If you do not agree to these Terms, do not access or use the Website.</p>

          <h2>1. Use of the Website</h2>
          <p>You agree to use the Website in accordance with applicable laws and regulations. You will not use the Website for any unlawful or prohibited purpose.</p>
          <p>By creating an account, you represent that you are at least 18 years of age (or the legal age of consent in your jurisdiction) and have the legal authority to agree to these Terms.</p>

          <h2>2. User Content</h2>
          <p>You retain ownership of any content you post on the Website, including photos, videos, text, and other materials (&quot;User Content&quot;). However, by posting User Content, you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, distribute, reproduce, modify, adapt, publish, translate, publicly display, and create derivative works of such User Content.</p>
          <p>You are responsible for the content you post and agree not to post any content that is unlawful, defamatory, or violates the rights of others. We reserve the right to remove any User Content that violates these Terms.</p>

          <h2>3. Data Privacy and CCPA Compliance</h2>
          <p>We take your privacy seriously. Our collection, use, and disclosure of personal information is governed by our Privacy Policy.</p>
          <p>For California residents, we comply with the California Consumer Privacy Act (CCPA). As a user, you have the following rights under the CCPA:</p>
          <ul>
            <li>The right to know what personal information is being collected about you.</li>
            <li>The right to request the deletion of your personal information.</li>
            <li>The right to opt-out of the sale of your personal information (note: we do not sell your personal information).</li>
            <li>The right to not be discriminated against for exercising your CCPA rights.</li>
          </ul>
          <p>To exercise any of these rights, please contact us at support@memorieslived.com.</p>

          <h2>4. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, CJM Ashton, LLC and its officers, directors, employees, and agents shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Website; (ii) any unauthorized access to or use of our servers; (iii) any interruption or cessation of transmission to or from our Website; (iv) any bugs, viruses, Trojan horses, or the like that may be transmitted to or through our Website by any third party; or (v) any errors or omissions in any content posted or made available through the Website.</p>

          <h2>5. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless CJM Ashton, LLC, its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, or expenses, including reasonable attorneys&apos; fees and costs, arising out of or in any way connected with your access to or use of the Website, your violation of these Terms, or your violation of any third-party rights.</p>

          <h2>6. Arbitration Agreement</h2>
          <p>Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach, termination, enforcement, interpretation, or validity thereof, including the determination of the scope or applicability of this agreement to arbitrate, shall be determined by arbitration in [insert location]. The arbitration shall be administered by the American Arbitration Association (&quot;AAA&quot;) in accordance with its Commercial Arbitration Rules and Mediation Procedures.</p>
          <p><strong>Class Action Waiver:</strong> You agree that any arbitration shall be conducted in your individual capacity only and not as a class action or other representative action. You expressly waive your right to file a class action or seek relief on a class basis.</p>
          <p><strong>Opt-Out:</strong> You have the right to opt out of this Arbitration Agreement by sending written notice of your decision to opt out to support@memorieslived.com within 30 days of first accepting these Terms.</p>

          <h2>7. Intellectual Property</h2>
          <p>The Website and all of its original content, features, and functionality are and will remain the exclusive property of CJM Ashton, LLC and its licensors. You may not use, reproduce, or distribute any content from the Website without our express written permission.</p>

          <h2>8. Termination</h2>
          <p>We reserve the right to suspend or terminate your access to the Website at our sole discretion, without notice or liability, for any reason, including if you breach these Terms.</p>

          <h2>9. Changes to the Terms</h2>
          <p>We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes by posting the new Terms on the Website or by other means as appropriate. Your continued use of the Website following any changes constitutes your acceptance of the new Terms.</p>

          <h2>10. Governing Law</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of the state of [insert state], without regard to its conflict of law provisions.</p>

          <h2>11. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at support@memorieslived.com.</p>
        </div>
      </main>
    </div>
  )
}