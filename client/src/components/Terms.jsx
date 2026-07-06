import React from 'react'
import { Link } from 'react-router-dom';
import '../Css/Terms.css'

export default function Terms() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>Terms and Conditions</h1>
        <p className="last-updated">Last Updated: April 2026</p>
        
        <section className="terms-section">
          <h2>1. Acceptance of Terms</h2>
          <p> 
            By accessing this website, you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our Privacy Policy govern HUNGRY KOREAN's relationship with you in relation to this website. If you disagree with any part of these terms and conditions, please do not use our website.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. Definitions</h2>
          <p>
            The term "Hungry Korean" or "us" or "we" refers to the owner of the website, Hungry Korean. The term "you" refers to the user or viewer of our website.
          </p>
        </section>

        <section className="terms-section">
          <h2>3. Use of Website</h2>
          <p>The use of this website is subject to the following terms of use:</p>
          <ul>
            <li>
              The content of the pages of this website is for your general information and use only. It is subject to change without notice.
            </li>
            <li>  
              Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.
            </li>
            <li>
              Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through this website meet your specific requirements.
            </li>
            <li>
              This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
            </li>
            <li>
              All trademarks reproduced in this website, which are not the property of, or licensed to the operator, are acknowledged on the website.
            </li>
            <li>
              Unauthorized use of this website may give rise to a claim for damages and/or be a criminal offence. From time to time, this website may also include links to other websites. These links are provided for your convenience to provide further information. They do not signify that we endorse the website(s). We have no responsibility for the content of the linked website(s).
            </li>
            <li>
              Your use of this website and any dispute arising out of such use of the website is subject to the laws of the Hong Kong SAR.
            </li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>4. Privacy Policy</h2>
          <p>
            We respect the privacy of visitors to this website. Any personally identifiable information on site visitors is collected only for the purpose of providing requested information to them. We may also use IP addresses and other anonymous data for the purpose of maintaining and enhancing our website. Data on individuals will not be sold or passed on to any third party for marketing purposes.
          </p>
        </section>

        <section className="terms-section">
          <h2>5. Policy Changes</h2>
          <p>
            In the event of any changes to our Privacy Policy, whether required by law or otherwise, we shall post such changes on our website.
          </p>
        </section>

        <div className="back-link">
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}