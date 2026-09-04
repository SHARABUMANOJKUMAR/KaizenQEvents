import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Target, Zap, Users, Globe, Heart, BookOpen } from 'lucide-react';
import { Button } from '../components/ui';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <Target size={24} className="text-[#4285F4]" />,
      title: 'Our Mission',
      color: '#EBF3FF',
      content: 'Kaizen Q Events exists to democratize access to technology education and community. We believe every developer, student and tech enthusiast — regardless of geography — deserves access to world-class learning experiences, mentorship and a supportive professional network.',
    },
    {
      icon: <Zap size={24} className="text-[#34A853]" />,
      title: 'What We Do',
      color: '#E8F5E9',
      content: 'We organize and facilitate technology events across India — from intensive bootcamps and hands-on workshops to large conferences, hackathons and career fairs. Every event is designed to deliver real, practical value to participants.',
    },
    {
      icon: <Users size={24} className="text-[#EA4335]" />,
      title: 'Our Community',
      color: '#FFEBEE',
      content: 'KQE brings together over 6,000 developers, students, founders and tech professionals across 12+ cities in India. Our community chapters are led by passionate local organizers who understand their community\'s unique needs and opportunities.',
    },
    {
      icon: <Globe size={24} className="text-[#FBBC04]" />,
      title: 'Our Vision',
      color: '#FFF8E1',
      content: 'We envision a future where every young developer in India — from Pulivendula to Patna — has access to the same quality of mentorship, learning and community that drives innovation in the world\'s leading tech hubs.',
    },
  ];

  const stats = [
    { value: '6,000+', label: 'Community Members' },
    { value: '120+', label: 'Events Hosted' },
    { value: '12+', label: 'Cities' },
    { value: '50+', label: 'Speakers' },
  ];

  return (
    <div className="fade-in bg-white min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#EBF3FF] to-white border-b border-[#E8EAED] py-16 sm:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#4285F4]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#34A853]/5 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-[#E8EAED] text-[#4285F4] text-sm font-semibold px-4 py-2 rounded-full mb-6 shadow-sm">
            <Heart size={14} className="text-[#EA4335]" />
            About Kaizen Q Events
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1A1A2E] leading-tight mb-6 tracking-tight">
            Building India's Most Vibrant<br />
            <span className="text-[#4285F4]">Tech Community</span>
          </h1>
          <p className="text-lg text-[#5F6368] leading-relaxed max-w-2xl mx-auto">
            Kaizen Q Events (KQE) is a community-first platform that brings together technology events, bootcamps, workshops and developer communities across India. We believe in continuous improvement — <em>Kaizen</em> — for every developer's journey.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-[#E8EAED] bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-[#4285F4]">{stat.value}</p>
                <p className="text-sm text-[#5F6368] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 space-y-6">
        {sections.map((s) => (
          <div key={s.title} className="border border-[#E8EAED] rounded-2xl p-6 sm:p-8 bg-white flex gap-5 sm:gap-7 items-start card-hover">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: s.color }}
            >
              {s.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">{s.title}</h2>
              <p className="text-[#5F6368] leading-relaxed">{s.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="bg-[#F8F9FA] border-y border-[#E8EAED] py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: 'Openness', desc: 'We welcome everyone — students, professionals, beginners and experts — to be part of our community.', icon: <BookOpen size={20} className="text-[#4285F4]" /> },
              { title: 'Impact', desc: 'Every event, bootcamp and workshop we run must deliver real, measurable value to participants.', icon: <Zap size={20} className="text-[#34A853]" /> },
              { title: 'Community', desc: 'We grow together. When one developer grows, the whole community benefits.', icon: <Users size={20} className="text-[#EA4335]" /> },
            ].map((v) => (
              <div key={v.title} className="bg-white border border-[#E8EAED] rounded-xl p-6 text-center card-hover">
                <div className="w-10 h-10 rounded-full bg-[#F8F9FA] flex items-center justify-center mx-auto mb-3">
                  {v.icon}
                </div>
                <h3 className="font-bold text-[#1A1A2E] mb-2">{v.title}</h3>
                <p className="text-sm text-[#5F6368] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#4285F4] py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to be part of KQE?</h2>
          <p className="text-[#DBEAFE] text-lg mb-8">
            Join thousands of developers and tech enthusiasts building the future together.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="secondary" size="lg" onClick={() => navigate('/events')} rightIcon={<ArrowRight size={18} />} id="about-explore-btn">
              Explore Events
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/communities')}
              className="bg-white/20 text-white hover:bg-white/30 border border-white/30"
              id="about-communities-btn"
            >
              Find a Community
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
