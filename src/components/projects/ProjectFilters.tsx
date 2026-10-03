
import { Button } from "../ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProjectFiltersProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const ProjectFilters = ({
  categories,
  selectedCategory,
  setSelectedCategory,
}: ProjectFiltersProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start w-full overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
      {categories.map((category) => (
        <Button
          key={category}
          onClick={() => setSelectedCategory(category)}
          variant={selectedCategory === category ? "secondary" : "outline"}
          className={`
            transition-all duration-300 shadow-lg text-sm sm:text-base font-trebuchet
            whitespace-nowrap flex-shrink-0
            ${isMobile ? 'py-1 px-2 h-auto min-h-[32px]' : ''}
            ${selectedCategory === category 
              ? 'bg-gradient-to-r from-[#1EAEDB] to-[#33C3F0] text-white border-none hover:opacity-90'
              : 'bg-white/80 text-[#555555] hover:bg-white border-[#E5DEFF]'}
          `}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};
