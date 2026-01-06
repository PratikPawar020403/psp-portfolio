
import { supabase } from "@/integrations/supabase/client";
import { Certificate } from "@/types/certificate";
import { Project, ProjectSize } from "@/types/project";
import { Database } from '@/integrations/supabase/types';

// Helper function to normalize and optimize URLs
function normalizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  let trimmedUrl = url.trim();
  if (!trimmedUrl) return undefined;

  // If URL doesn't start with http:// or https://, add https://
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    trimmedUrl = `https://${trimmedUrl}`;
  }

  // Optimize Supabase Storage Public URLs
  // We append transformation parameters for public bucket images
  if (trimmedUrl.includes('supabase.co/storage/v1/object/public') && !trimmedUrl.includes('?')) {
    return `${trimmedUrl}?width=800&quality=80&format=webp`;
  }

  return trimmedUrl;
}

// Fetch all projects from Supabase
export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data.map(project => ({
    id: parseInt(project.id.slice(0, 8), 16), // Convert UUID to number for compatibility
    title: project.title,
    description: project.description,
    category: project.category,
    image: normalizeUrl(project.image_url) || '', // Map image_url to image with optimization
    githubUrl: normalizeUrl(project.github_url),
    demoUrl: normalizeUrl(project.demo_url),
    details: project.details || '',
    techStack: Array.isArray(project.tech_stack) ? project.tech_stack : [], // Ensure techStack is always an array
    // Ensure size is a valid ProjectSize type or default to 'large'
    size: (project.size === 'small' || project.size === 'medium' || project.size === 'large'
      ? project.size as ProjectSize
      : 'large') as ProjectSize
  }));
}

// Fetch all certificates from Supabase
export async function fetchCertificates(): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching certificates:', error);
    return [];
  }

  return data.map(cert => ({
    id: parseInt(cert.id.slice(0, 8), 16), // Convert UUID to number for compatibility
    title: cert.title,
    image: cert.image_url,
    issuer: cert.issuer,
    date: cert.date,
    color: cert.color
  }));
}

