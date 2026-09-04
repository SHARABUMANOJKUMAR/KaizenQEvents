import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { organizerService } from '../services';
import type { OrganizerProfile } from '../types';
import { Input, Skeleton } from '../components/ui';
import { OrganizerCard } from '../components/organizer/OrganizerCard';

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
      </div>
    </div>
  );
};

export default OrganizersPage;
