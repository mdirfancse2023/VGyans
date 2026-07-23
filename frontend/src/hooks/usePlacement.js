import { useState, useEffect } from 'react';
import { placementService } from '../services/placementService';

export function usePlacement(initialCategory = 'dsa') {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [categories, setCategories] = useState([]);
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      const cats = await placementService.getCategories();
      if (isMounted) setCategories(cats);
    }
    loadCategories();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const data = await placementService.getPlacementByCategory(activeCategory);
      if (isMounted) {
        setCategoryData(data?.data || null);
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [activeCategory]);

  return {
    activeCategory,
    setActiveCategory,
    categories,
    categoryData,
    loading
  };
}
