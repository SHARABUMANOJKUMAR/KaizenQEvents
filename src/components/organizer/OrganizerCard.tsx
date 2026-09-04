import React from 'react';
import type { OrganizerProfile, Speaker } from '../../types';
import { Avatar, Button } from '../ui';
import { cn } from '../../utils';

// Inline brand SVG icons
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 5.987zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// ============================================================
// OrganizerCard (full)
// ============================================================
interface OrganizerCardProps {
  organizer: OrganizerProfile;
  className?: string;
}

export const OrganizerCard: React.FC<OrganizerCardProps> = ({ organizer, className }) => {
  return (
    <article
      className={cn(
        'bg-white border border-[#E8EAED] rounded-xl p-6 card-hover text-center flex flex-col items-center gap-4',
        className
      )}
      aria-label={`Organizer: ${organizer.name}`}
    >
      <Avatar src={organizer.imageUrl} alt={organizer.name} size="xl" />

      <div className="space-y-1">
        <h3 className="font-bold text-[#1A1A2E] text-base">{organizer.name}</h3>
        <p className="text-sm text-[#5F6368]">{organizer.role}</p>
        <p className="text-xs text-[#9AA0A6]">{organizer.company}</p>
      </div>

      <p className="text-sm text-[#5F6368] leading-relaxed line-clamp-3">{organizer.bio}</p>

      <div className="flex items-center gap-2">
        {organizer.linkedin && (
          <a
            href={organizer.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${organizer.name} LinkedIn`}
            className="w-8 h-8 rounded-full border border-[#E8EAED] flex items-center justify-center text-[#5F6368] hover:text-[#4285F4] hover:border-[#4285F4] transition-all"
          >
            <LinkedInIcon />
          </a>
        )}
        {organizer.twitter && (
          <a
            href={organizer.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${organizer.name} Twitter`}
            className="w-8 h-8 rounded-full border border-[#E8EAED] flex items-center justify-center text-[#5F6368] hover:text-[#4285F4] hover:border-[#4285F4] transition-all"
          >
            <TwitterIcon />
          </a>
        )}
      </div>

      <Button variant="outline" size="sm" id={`organizer-bio-${organizer.id}`}>
        See Bio
      </Button>
    </article>
  );
};

// ============================================================
// SpeakerCard
// ============================================================
interface SpeakerCardProps {
  speaker: Speaker;
  compact?: boolean;
  className?: string;
}

export const SpeakerCard: React.FC<SpeakerCardProps> = ({ speaker, compact = false, className }) => {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Avatar src={speaker.imageUrl} alt={speaker.name} size="md" />
        <div>
          <p className="font-semibold text-sm text-[#1A1A2E]">{speaker.name}</p>
          <p className="text-xs text-[#5F6368]">{speaker.designation}</p>
          <p className="text-xs text-[#9AA0A6]">{speaker.company}</p>
        </div>
      </div>
    );
  }

  return (
    <article
      className={cn(
        'bg-white border border-[#E8EAED] rounded-xl p-5 flex gap-4 items-start',
        className
      )}
      aria-label={`Speaker: ${speaker.name}`}
    >
      <Avatar src={speaker.imageUrl} alt={speaker.name} size="lg" className="shrink-0" />
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[#1A1A2E] text-sm">{speaker.name}</h4>
        <p className="text-sm text-[#5F6368]">{speaker.designation}</p>
        <p className="text-xs text-[#9AA0A6] mb-2">{speaker.company}</p>
        <p className="text-sm text-[#5F6368] leading-relaxed line-clamp-3">{speaker.bio}</p>
        {speaker.linkedin && (
          <a
            href={speaker.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${speaker.name} LinkedIn`}
            className="inline-flex items-center gap-1 mt-3 text-xs text-[#4285F4] hover:underline"
          >
            <LinkedInIcon />
            LinkedIn
          </a>
        )}
      </div>
    </article>
  );
};
