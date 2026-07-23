import React from 'react';
import InterviewExperiences from '../InterviewExperiences';

export default function InterviewCard({ experiences, onSubmitExperience }) {
  return (
    <div>
      <InterviewExperiences 
        initialExperiences={experiences} 
        onSubmitExperience={onSubmitExperience} 
      />
    </div>
  );
}
