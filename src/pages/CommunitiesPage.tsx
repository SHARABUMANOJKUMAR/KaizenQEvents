import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { communityService } from '../services';
import type { Community } from '../types';
import { Input, Skeleton } from '../components/ui';
import { CommunityCard } from '../components/community/CommunityCard';

const STATES = ['All', 'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Maharashtra'];

const CommunitiesPage: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('All');

  useEffect(() => {
    communityService.search(query, stateFilter).then((coms) => {
      setCommunities(coms);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    communityService.search(query, stateFilter).then((coms) => {
      setCommunities(coms);
      setLoading(false);
    });
  }, [query, stateFilter]);

  return (
    <div className="fade-in bg-white min-h-screen">
      {/* Header */}
      <div className="bg-[#F8F9FA] border-b border-[#E8EAED] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A2E] mb-2">
            Explore KQE Communities
          </h1>
          <p className="text-[#5F6368] text-base max-w-xl">
            Find a local KQE chapter near you. Join, learn, build and grow together.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Search + filter row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            id="communities-search"
            type="search"
            placeholder="Search communities by name, city or state…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search size={18} />}
            className="py-3"
          />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="sm:w-52 shrink-0 rounded-xl border border-[#E8EAED] bg-white py-2.5 px-3 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
            id="communities-state-filter"
          >
            {STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-sm text-[#5F6368]">
            {communities.length} communit{communities.length !== 1 ? 'ies' : 'y'} found
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-[#E8EAED] rounded-xl overflow-hidden">
                <Skeleton className="w-full h-44 rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : communities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {communities.map((c) => <CommunityCard key={c.id} community={c} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-[#9AA0A6]">
            No communities found for your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunitiesPage;
