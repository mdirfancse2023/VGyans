import { useState, useEffect } from 'react';
import { jobService } from '../services/jobService';

export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadJobs() {
      setLoading(true);
      const data = await jobService.getJobs();
      if (isMounted) {
        setJobs(data || []);
        setLoading(false);
      }
    }
    loadJobs();
    return () => { isMounted = false; };
  }, []);

  const filteredJobs = jobs.filter(j => 
    (j.title || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
    (j.company || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
    (j.location || '').toLowerCase().includes(filterQuery.toLowerCase())
  );

  return {
    jobs: filteredJobs,
    filterQuery,
    setFilterQuery,
    loading
  };
}
