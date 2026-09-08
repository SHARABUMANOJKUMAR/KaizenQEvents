import React, { useEffect } from 'react';
import { Shield } from 'lucide-react';
import { SEO } from '../components/ui';

const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-12">
      <SEO 
        title="Privacy Policy | Kaizen Q Events"
        description="Learn how Kaizen Q Events collects, uses, and protects your personal data and Google account information."
        canonical="/privacy-policy"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-[#E8EAED] p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-8 border-b border-[#E8EAED] pb-6">
            <div className="w-12 h-12 bg-[#E8F0FE] rounded-2xl flex items-center justify-center text-[#4285F4]">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A2E]">Privacy Policy</h1>
              <p className="text-[#5F6368] mt-1">Last Updated: September 2026</p>
            </div>
          </div>

          <div className="prose prose-blue max-w-none text-[#5F6368] space-y-6">
            <p>
              Welcome to <strong>Kaizen Q Events</strong>. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
            </p>

            <h2 className="text-xl font-bold text-[#1A1A2E] mt-8 mb-4">1. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
              <li><strong>Educational Data:</strong> includes your college, university, branch, and year of study.</li>
            </ul>

            <h2 className="text-xl font-bold text-[#1A1A2E] mt-8 mb-4">2. Google Account Data (OAuth)</h2>
            <p>
              When you choose to <strong>Continue with Google</strong> to sign in or register for our events, we use Google's secure OAuth 2.0 authentication system.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>What we request:</strong> We only request access to your basic profile information (Name and Profile Picture) and your Email Address.</li>
              <li><strong>How we use it:</strong> This information is strictly used to create your Kaizen Q Events account, verify your identity, and pre-fill your event registration forms to save you time.</li>
              <li><strong>Storage and Protection:</strong> Your Google Account data is stored securely in our Google Firebase database. We do not sell, rent, or share your Google account data with any third parties.</li>
            </ul>

            <h2 className="text-xl font-bold text-[#1A1A2E] mt-8 mb-4">3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To register you as a new user and attendee for our events and bootcamps.</li>
              <li>To manage our relationship with you, including sending event updates, tickets, and notifications.</li>
              <li>To improve our website, services, marketing, and user experiences.</li>
            </ul>

            <h2 className="text-xl font-bold text-[#1A1A2E] mt-8 mb-4">4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. We use enterprise-grade security provided by Google Firebase to encrypt and protect your data.
            </p>

            <h2 className="text-xl font-bold text-[#1A1A2E] mt-8 mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at: <br/>
              <strong>Email:</strong> kaizenqlms@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
