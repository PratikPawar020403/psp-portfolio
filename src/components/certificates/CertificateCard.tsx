
import { memo } from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Calendar, Award, BadgeCheck } from 'lucide-react';

interface CertificateCardProps {
  title: string;
  image: string;
  issuer: string;
  date: string;
  isActive?: boolean;
  isMobile?: boolean;
  color?: string;
}

export const CertificateCard = memo(({
  title,
  image,
  issuer,
  date,
  isActive = false,
  isMobile = false,
  color = "from-gray-900/90 to-gray-800/90"
}: CertificateCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
      }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{
        scale: 1.03,
        transition: { duration: 0.3 },
        boxShadow: "0 8px 32px rgba(107,75,255,0.3)"
      }}
      className={cn(
        "group relative overflow-hidden backdrop-blur-sm rounded-2xl",
        "border border-gray-700/50",
        "bg-gradient-to-r", color,
        isMobile ? "w-full h-[500px] mx-auto" : "w-full h-[520px]",
        "transition-all duration-500 ease-in-out transform-gpu",
        "hover:shadow-[0_8px_32px_rgba(107,75,255,0.3)]",
        "certificate-card-animation certificate-3d shine-effect",
      )}
      role="figure"
      aria-label={`${title} by ${issuer}`}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10 z-0" />
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#6B4BFF]/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#1EAEDB]/10 blur-3xl" />

      {/* Certificate content */}
      <div className="relative w-full h-full p-6 z-10">
        <div className="absolute top-3 right-3">
          <BadgeCheck className="w-6 h-6 text-[#6B4BFF] opacity-70" />
        </div>

        <motion.div
          className="h-[70%] overflow-hidden rounded-lg shadow-xl"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <div className="relative w-full h-full overflow-hidden rounded-lg">
            <img
              src={image}
              alt={title}
              className={cn(
                "w-full h-full",
                "transition-all duration-700 ease-out",
                "group-hover:scale-105 group-hover:brightness-110",
                "rounded-lg shadow-inner object-contain bg-white/10"
              )}
              loading="lazy"
              decoding="async"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={cn(
            "absolute bottom-0 left-0 right-0 p-6",
            "bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent",
            "backdrop-blur-sm"
          )}
        >
          <h3 className="text-xl md:text-2xl font-bold mb-3 font-space-grotesk bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            {title}
          </h3>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#1EAEDB]" />
              <p className="text-lg text-gray-300 font-medium">{issuer}</p>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#6B4BFF]" />
              <p className="text-sm text-gray-400">{date}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive hover effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1EAEDB]/10 to-[#6B4BFF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-[#6B4BFF]/30 transition-all duration-700" />
    </motion.div>
  );
});

CertificateCard.displayName = 'CertificateCard';
