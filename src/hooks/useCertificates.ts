
import { useState, useEffect, useCallback } from 'react';
import { Certificate } from '@/types/certificate';
import { fetchCertificates } from '@/utils/supabaseData';
import { toast } from 'sonner';

export const useCertificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadCertificates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCertificates();
      setCertificates(data);
    } catch (error) {
      const errorMessage = "Failed to load certificates";
      console.error("Error loading certificates:", error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);
  
  return { certificates, loading, error, refetch: loadCertificates };
};
