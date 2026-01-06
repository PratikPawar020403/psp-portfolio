import React from 'react';
import { motion } from 'framer-motion';
import CircularOrbit from './circular-orbit/CircularOrbit';
import { creatorSkills, builderSkills } from '@/data/skillsData';

const SkillsSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    >
      <CircularOrbit
        creatorSkills={creatorSkills}
        builderSkills={builderSkills}
      />
    </motion.div>
  );
};

export default SkillsSection;