import { fetchJson } from './apiConfig';

export const newsService = {
  async getNews() {
    try {
      return await fetchJson('/api/news');
    } catch (err) {
      return [
        { id: 'news-1', title: 'IT Hiring Surge 2026: Top 10 Tech Skills in High Demand', category: 'Placements', source: 'VGyans News', time: '2 hours ago', summary: 'Software engineering recruitment sees a 35% jump in Spring Boot and System Design roles.' },
        { id: 'news-2', title: 'Google Off-Campus Hiring Drive Announced for 2026 Graduates', category: 'Campus Drive', source: 'Tech Pulse', time: '5 hours ago', summary: 'Registration opens for off-campus software engineering roles across Bangalore and Hyderabad.' }
      ];
    }
  }
};
