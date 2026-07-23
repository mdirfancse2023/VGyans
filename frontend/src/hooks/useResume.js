import { useState, useEffect } from 'react';
import { resumeService } from '../services/resumeService';

export function useResume(initialCategory = 'technical') {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [categories, setCategories] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      const cats = await resumeService.getCategories();
      if (isMounted) setCategories(cats);
    }
    loadCategories();
    return () => { isMounted = false; };
  }, []);

  const analyze = async ({ text, targetRole, file }) => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await resumeService.analyzeResume({
        text,
        category: activeCategory,
        targetRole,
        file
      });
      setAnalysisResult(res);
      return res;
    } catch (err) {
      setError(err.message || 'Resume analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    activeCategory,
    setActiveCategory,
    categories,
    analysisResult,
    analyzing,
    error,
    analyze
  };
}
