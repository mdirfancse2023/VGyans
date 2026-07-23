import { fetchJson } from './apiConfig';

export const jobService = {
  async getJobs() {
    try {
      return await fetchJson('/api/jobs');
    } catch (err) {
      return [
        { id: 'job-1', title: 'Junior Software Engineer', company: 'TechCorp', location: 'Remote / Bangalore', salary: 'INR 12-18 LPA', type: 'Full-Time', link: 'https://virtualgyans.me' },
        { id: 'job-2', title: 'React Frontend Developer', company: 'ScaleUp AI', location: 'Remote', salary: 'INR 10-15 LPA', type: 'Full-Time', link: 'https://virtualgyans.me' }
      ];
    }
  }
};
