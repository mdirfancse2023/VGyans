import { fetchJson, BASE_API_URL } from './apiConfig';

export const resumeService = {
  async getCategories() {
    try {
      return await fetchJson('/api/resume/categories');
    } catch (err) {
      return [
        { id: 'technical', name: 'Technical / Software Engineering', icon: '💻' },
        { id: 'management', name: 'Management / Product / Non-Tech', icon: '📊' }
      ];
    }
  },

  async analyzeResume({ text, category = 'technical', targetRole = 'Software Engineer', file = null }) {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    if (text) {
      formData.append('resume_text', text);
    }
    formData.append('category', category);
    formData.append('target_role', targetRole);

    const res = await fetch(`${BASE_API_URL}/api/analyze-resume`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error(`Resume analysis failed with status ${res.status}`);
    }

    return await res.json();
  }
};
