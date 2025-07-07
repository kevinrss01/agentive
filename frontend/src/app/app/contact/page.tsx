'use client';

import React from 'react';
import { FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const teamMembers = [
  {
    name: 'Naomi',
    linkedin: 'https://www.linkedin.com/in/naomi-rose/',
    twitter: 'https://x.com/ia_nano_',
  },
  {
    name: 'Kevin',
    linkedin: 'https://www.linkedin.com/in/kevin-rousseau01/',
    twitter: 'https://x.com/kevinrss_',
  },
  {
    name: 'Alexandre Chs',
    linkedin: 'https://www.linkedin.com/in/alexandre-chanas-8b2399197/',
    twitter: 'https://x.com/AlexandreChsDev',
  },
];

const MemberCard = ({ member }: { member: (typeof teamMembers)[0] }) => (
  <div className="bg-white/50 border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center">
    <h3 className="text-xl font-semibold text-gray-900 mb-4">{member.name}</h3>
    <div className="flex space-x-4">
      {member.linkedin && (
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-blue-600 transition-colors"
        >
          <FaLinkedin size={24} />
        </a>
      )}
      {member.twitter && (
        <a
          href={member.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-sky-500 transition-colors"
        >
          <FaXTwitter size={24} />
        </a>
      )}
    </div>
  </div>
);

export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">Meet the Team</h1>
          <p className="text-gray-600 text-lg">The people behind the project.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <MemberCard key={member.name} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
}
