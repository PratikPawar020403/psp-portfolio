export type ProjectSize = 'small' | 'medium' | 'large';

export type Project = {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  githubUrl?: string;
  demoUrl?: string;
  details: string;
  techStack: string[];
  size?: ProjectSize;
};