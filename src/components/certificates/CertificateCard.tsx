
import { memo } from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ThreeDPaper } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export function Scene() {
  return (
    <div className="shader-frame w-full h-full relative">
      <ThreeDPaper variant="certificate" />
    </div>
  );
}

interface CertificateCardProps {
  title?: string;
  image?: string;
  issuer?: string;
  date?: string;
  isActive?: boolean;
  isMobile?: boolean;
  color?: string;
}

export const CertificateCard = memo(({
  title = "Certificate",
  issuer = "Professional Certification",
  isMobile = false,
  image,
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
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className={cn(
        "group relative",
        isMobile ? "w-full h-[500px] mx-auto" : "w-full h-[520px]",
        "transition-all duration-500 ease-in-out transform-gpu",
      )}
      role="figure"
      aria-label={`${title} by ${issuer}`}
    >
      <div className="shader-frame w-full h-full relative">
        <ThreeDPaper variant="certificate" imageUrl={image} />
      </div>
    </motion.div>
  );
});

CertificateCard.displayName = 'CertificateCard';
export default CertificateCard;
