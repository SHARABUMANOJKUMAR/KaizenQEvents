import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { organizerService } from '../services';
import type { OrganizerProfile } from '../types';
import { Input, Skeleton } from '../components/ui';
import { OrganizerCard } from '../components/organizer/OrganizerCard';
import { SEO } from '../components/SEO';

const OrganizerCardSkeleton: React.FC = () => (
  <div className="bg-white border border-[#E8EAED] rounded-xl p-6 flex flex-col items-center gap-4">
    <Skeleton className="w-20 h-20" rounded />
    <Skeleton className="h-5 w-32" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-9 w-24" />
  </div>
);

const OrganizersPage: React.FC = () => {
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>([]);
  const [filtered, setFiltered] = useState<OrganizerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    organizerService.getAll().then((orgs) => {
      setOrganizers(orgs);
      setFiltered(orgs);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(organizers);
      return;
    }
    const q = query.toLowerCase();
    setFiltered(
      organizers.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.company.toLowerCase().includes(q) ||
          o.role.toLowerCase().includes(q)
      )
    );
  }, [query, organizers]);

  return (
    <div className="fade-in bg-white min-h-screen">
      <SEO 
        title="Kaizen Q Events Organizers | Meet the Tech Community Leaders"
        description="Meet the passionate organizers and leaders behind Kaizen Q Events who power technology bootcamps, hackathons, and developer communities across India."
        canonical="/organizers"
      />
      {/* Page header */}
      <div className="bg-[#F8F9FA] border-b border-[#E8EAED] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A2E] mb-2">
            Meet the Organizers
          </h1>
          <p className="text-[#5F6368] text-base max-w-xl">
            The passionate people who power KQE events across India — building communities and creating opportunities for everyone.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Search */}
        <Input
          id="organizers-search"
          type="search"
          placeholder="Search by name, company or role…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          leftIcon={<Search size={18} />}
          className="max-w-md py-3"
        />

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <OrganizerCardSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((org) => <OrganizerCard key={org.id} organizer={org} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-[#9AA0A6]">
            No organizers match your search.
          </div>
        )}

        {/* Mentor Talks Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-extrabold text-[#1A1A2E] mb-8 border-b border-[#E8EAED] pb-4">
            Mentor Talks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <OrganizerCard
              organizer={{
                id: 'mentor-001',
                name: 'Harshith Sai Tunuguntla',
                company: 'LinkedIn Top Voice',
                role: 'Backend Software Engineer',
                imageUrl: 'https://res.cloudinary.com/dwv8kc9vb/image/upload/v1789981646/harshith_sai_kmbmmq.jpg',
                bio: 'Harshith Sai Tunuguntla is an Indian backend software engineer, tech content creator, and public speaker. He is widely recognized as a LinkedIn Top Voice focused on personal branding, career growth, and networking strategies for students and tech professionals.',
                linkedin: 'https://in.linkedin.com/in/harshithtunuguntla',
              }}
            />
            <OrganizerCard
              organizer={{
                id: 'mentor-002',
                name: 'Bhadri',
                company: 'Apexx Global Fintech',
                role: 'Portal Architect',
                imageUrl: 'https://res.cloudinary.com/dwv8kc9vb/image/upload/v1789987449/badri_mt_zg3xil.jpg',
                bio: 'Bhadri is a Portal Architect at Apexx Global Fintech, with experience in designing and developing scalable digital platforms and enterprise-level solutions. He brings practical industry knowledge and a strong understanding of modern software development, architecture, and technology. He is passionate about sharing real-world insights, helping developers understand industry practices, and guiding learners toward building strong technical skills and professional careers.',
                linkedin: 'https://www.linkedin.com/in/badri-nath-1b5a9b217/',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizersPage;
