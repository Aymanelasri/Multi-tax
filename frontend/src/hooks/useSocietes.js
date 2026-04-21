// hooks/useSocietes.js
// ✅ Fetch only current user's societes from API

import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const useSocietes = () => {
  const { user } = useAuth();
  const [societes, setSocietes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSocietes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getSocietes();
      setSocietes(response.data || []);
    } catch (err) {
      setError(err.message);
      setSocietes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSocietes();
    }
  }, [user?.id]);

  return { societes, loading, error, refetch: fetchSocietes };
};
