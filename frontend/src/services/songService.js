import { fetchJson } from './apiConfig';

export const songService = {
  async searchSongs(query = 'Lofi Study Beats') {
    try {
      return await fetchJson(`/api/songs?query=${encodeURIComponent(query)}`);
    } catch (err) {
      return [
        { id: 'song-1', title: 'Lofi Focus Beats', artist: 'VGyans Music', album: 'Chill Study', duration: '3:45', previewUrl: '' },
        { id: 'song-2', title: 'Deep Work Synthwave', artist: 'VGyans Audio', album: 'Coding Flow', duration: '4:12', previewUrl: '' }
      ];
    }
  }
};
