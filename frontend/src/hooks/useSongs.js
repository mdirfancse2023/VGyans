import { useState, useEffect } from 'react';
import { songService } from '../services/songService';

export function useSongs(initialQuery = 'Kesariya') {
  const [query, setQuery] = useState(initialQuery);
  const [songs, setSongs] = useState([]);
  const [activeSong, setActiveSong] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSongs() {
      setLoading(true);
      const data = await songService.searchSongs(query);
      if (isMounted) {
        setSongs(data || []);
        if (data && data.length > 0 && !activeSong) {
          setActiveSong(data[0]);
        }
        setLoading(false);
      }
    }
    loadSongs();
    return () => { isMounted = false; };
  }, [query]);

  return {
    query,
    setQuery,
    songs,
    activeSong,
    setActiveSong,
    loading
  };
}
