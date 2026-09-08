import React, { useEffect } from 'react';
import { FileText } from 'lucide-react';
import { SEO } from '../components/ui';

const TermsOfServicePage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-12">
      <SEO 
        title="Terms of Service | Kaizen Q Events"
        description="Read the terms and conditions for using Kaizen Q Events platform."
        canonical="/terms"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-[#E8EAED] p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-8 border-b border-[#E8EAED] pb-6">
            <div className="w-12 h-12 bg-[#E8F0FE] rounded-2xl flex items-center justify-center text-[#4285F4]">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A2E]">Terms of Service</h1>
              <p className="text-[#5F6368] mt-1">Last Updated: September 2026</p>
            </div>
          </div>

          <div className="prose prose-blue max-w-none text-[#5F6368] space-y-6">
            <p>
              By accessing and using Kaizen Q Events, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-xl font-bold text-[#1A1A2E] mt-8 mb-4">1. Use of the Platform</h2>
            <p>
              Kaizen Q Events provides a platform for discovering, registering for, and managing attendance to various educational and tech events. You agree to use the platform only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the website.
            </p>

            <h2 className="text-xl font-bold text-[#1A1A2E] mt-8 mb-4">2. Account Registration</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
            
            <h2 className="text-xl font-bold text-[#1A1A2E] mt-8 mb-4">3. Event Registrations</h2>
            <p>
              Tickets and registrations are subject to availability. Event organizers reserve the right to modify event details, cancel events, or refuse entry. Refunds, if applicable, are handled on a per-event basis according to the organizer's policies.
            </p>

            <h2 className="text-xl font-bold text-[#1A1A2E] mt-8 mb-4">4. Intellectual Property</h2>
            <p>
              The Service and its original content, features and functionality are and will remain the exclusive property of Kaizen Q Events and its licensors.
            </p>

            <h2 className="text-xl font-bold text-[#1A1A2E] mt-8 mb-4">5. Termination</h2>
            <p>
              We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            
            <h2 className="text-xl font-bold text-[#1A1A2E] mt-8 mb-4">6. Changes</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
            </p>
            
             <h2 className="text-xl font-bold text-[#1A1A2E] mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at: <br/>
              <strong>Email:</strong> kaizenqlms@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
