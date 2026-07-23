import { useState, useEffect } from 'react';
import { newsService } from '../services/newsService';

export function useNews() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadNews() {
      setLoading(true);
      const data = await newsService.getNews();
      if (isMounted) {
        setNewsList(data || []);
        setLoading(false);
      }
    }
    loadNews();
    return () => { isMounted = false; };
  }, []);

  return {
    newsList,
    loading
  };
}
