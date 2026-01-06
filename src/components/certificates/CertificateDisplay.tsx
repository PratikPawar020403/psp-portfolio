
import React from 'react';
import { motion } from 'framer-motion';
import { Certificate } from '@/types/certificate';

interface CertificateDisplayProps {
  certificates: Certificate[];
  loading: boolean;
}

export const CertificateDisplay = ({ certificates, loading }: CertificateDisplayProps) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="text-center py-12"
        variants={itemVariants}
      >
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-purple-300 motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p className="mt-4 text-white">Loading certificates...</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={itemVariants} className="relative">
      {/* Certificate content will be rendered here */}
      <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {certificates.map((certificate) => (
          <div key={certificate.id} className="certificate-item">
            {/* Individual certificate rendering logic can be added here if needed */}
          </div>
        ))}
      </div>
    </motion.div>
  );
};
