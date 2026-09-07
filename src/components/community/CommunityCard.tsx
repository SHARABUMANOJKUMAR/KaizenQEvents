import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar } from 'lucide-react';
import type { Community } from '../../types';
import { Button } from '../ui';
import { cn } from '../../utils';

interface CommunityCardProps {
  community: Community;
  className?: string;
}

export const CommunityCard: React.FC<CommunityCardProps> = memo(({ community, className }) => {
  const navigate = useNavigate();

  return (
    <article
      className={cn(
        'bg-white border border-[#E8EAED] rounded-xl overflow-hidden card-hover flex flex-col',
        className
      )}
      aria-label={`Community: ${community.name}`}
    >
      {/* Banner image */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={community.imageUrl}
          alt={community.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        {/* Overlay badge */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-[#1A1A2E] text-xs font-semibold px-2.5 py-1 rounded-full">
            {community.shortName}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="text-base font-bold text-[#1A1A2E] leading-snug">{community.name}</h3>
        <p className="text-xs text-[#5F6368]">{community.city}, {community.state}</p>
        <p className="text-sm text-[#5F6368] leading-relaxed line-clamp-2 flex-1">
          {community.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-[#5F6368]">
          <span className="flex items-center gap-1.5">
            <Users size={12} className="text-[#9AA0A6]" />
            {community.memberCount.toLocaleString()} members
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-[#9AA0A6]" />
            {community.eventCount} events
          </span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="mt-1 self-start"
          id={`explore-community-${community.id}`}
          onClick={() => navigate('/communities')}
        >
          Explore
        </Button>
      </div>
    </article>
  );
});

CommunityCard.displayName = 'CommunityCard';
