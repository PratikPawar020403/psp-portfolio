
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
    <div
      className={cn(
        "group relative select-none transform-gpu transition-transform duration-300 ease-out hover:scale-[1.04] hover:z-20",
        isMobile ? "w-full h-[500px] mx-auto" : "w-full h-[520px]",
      )}
      role="figure"
      aria-label={`${title} by ${issuer}`}
    >
      <div className="shader-frame w-full h-full relative">
        <ThreeDPaper variant="certificate" imageUrl={image} />
      </div>
    </div>
  );
});

CertificateCard.displayName = 'CertificateCard';
export default CertificateCard;
