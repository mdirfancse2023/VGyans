import { fetchJson } from './apiConfig';

export const placementService = {
  async getCategories() {
    try {
      return await fetchJson('/api/placement/categories');
    } catch (err) {
      return [
        { id: 'dsa', name: 'DSA & Problem Solving', icon: '⚡' },
        { id: 'cs-fundamentals', name: 'CS Core Fundamentals', icon: '🧠' },
        { id: 'jobs', name: 'Off-Campus Jobs & Hiring', icon: '💼' },
        { id: 'interviews', name: 'Mock Interviews & Experiences', icon: '🎯' }
      ];
    }
  },

  async getPlacementByCategory(categoryId = 'dsa') {
    try {
      return await fetchJson(`/api/placement/category?category=${categoryId}`);
    } catch (err) {
      return { category: categoryId, data: {} };
    }
  },

  async getRoadmap() {
    try {
      return await fetchJson('/api/placement/roadmap');
    } catch (err) {
      return [];
    }
  },

  async getExperiences() {
    try {
      return await fetchJson('/api/placement/experiences');
    } catch (err) {
      return [];
    }
  },

  async getMockInterviews() {
    try {
      return await fetchJson('/api/placement/mock-interviews');
    } catch (err) {
      return [];
    }
  }
};
