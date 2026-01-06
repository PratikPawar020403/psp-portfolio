import { Github, Linkedin, Twitter } from 'lucide-react';

export const SocialLinks = () => {
  return (
    <div className="flex justify-center space-x-6 mt-8">
      <a
        href="https://github.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white/80 hover:text-accent transition-colors duration-300 transform hover:scale-110"
      >
        <Github className="w-6 h-6 animate-pulse" />
      </a>
      <a
        href="https://linkedin.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white/80 hover:text-accent transition-colors duration-300 transform hover:scale-110"
      >
        <Linkedin className="w-6 h-6 animate-pulse" />
      </a>
      <a
        href="https://twitter.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white/80 hover:text-accent transition-colors duration-300 transform hover:scale-110"
      >
        <Twitter className="w-6 h-6 animate-pulse" />
      </a>
    </div>
  );
};