import { SupabaseClient } from "@supabase/supabase-js";

export interface FreeCodeProject {
  id: string;
  user_id: string;
  name: string;
  description: string;
  slug: string;
  files: Record<string, any>;
  template: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Slugify helper
function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + "-" + Math.random().toString(36).substring(2, 6);
}

export async function getUserProjects(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("freecode_projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data as FreeCodeProject[];
}

export async function getProject(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from("freecode_projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) throw error;
  return data as FreeCodeProject;
}

export async function createProject(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  description: string = "",
  template: 'vanilla' | 'react' | 'nextjs' = 'react'
) {
  const slug = generateSlug(name);
  
  // Provide basic default files based on template if Sandpack needs them
  // Standard Sandpack handles default files for templates automatically if we don't supply them,
  // but we initialize an empty files object to allow saving changes.
  const files = {};

  const { data, error } = await supabase
    .from("freecode_projects")
    .insert([
      {
        user_id: userId,
        name,
        description,
        slug,
        template,
        files
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data as FreeCodeProject;
}

export async function updateProjectFiles(supabase: SupabaseClient, projectId: string, files: any) {
  const { data, error } = await supabase
    .from("freecode_projects")
    .update({ 
      files,
      updated_at: new Date().toISOString()
    })
    .eq("id", projectId)
    .select()
    .single();

  if (error) throw error;
  return data as FreeCodeProject;
}

export async function updateProjectName(supabase: SupabaseClient, projectId: string, name: string) {
  const { data, error } = await supabase
    .from("freecode_projects")
    .update({ 
      name,
      updated_at: new Date().toISOString()
    })
    .eq("id", projectId)
    .select()
    .single();

  if (error) throw error;
  return data as FreeCodeProject;
}

export async function publishProject(supabase: SupabaseClient, projectId: string, is_published: boolean) {
  const { data, error } = await supabase
    .from("freecode_projects")
    .update({ 
      is_published,
      updated_at: new Date().toISOString()
    })
    .eq("id", projectId)
    .select()
    .single();

  if (error) throw error;
  return data as FreeCodeProject;
}

export async function deleteProject(supabase: SupabaseClient, projectId: string) {
  const { error } = await supabase
    .from("freecode_projects")
    .delete()
    .eq("id", projectId);

  if (error) throw error;
  return true;
}

// Note: Requires a join with auth.users or profiles if we search purely by handle/username. 
// For now, we fetch the userId first in the server component.
export async function getPublishedProjectByUserIdAndSlug(supabase: SupabaseClient, userId: string, slug: string) {
  const { data, error } = await supabase
    .from("freecode_projects")
    .select("*")
    .eq("user_id", userId)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) throw error;
  return data as FreeCodeProject;
}

export async function deployToArsenal(supabase: SupabaseClient, projectId: string, userId: string, username: string) {
  const project = await getProject(supabase, projectId);
  
  if (!project.is_published) {
    await publishProject(supabase, projectId, true);
  }

  const { data, error } = await supabase
    .from("user_projects")
    .insert([{
      user_id: userId,
      title: project.name,
      description: project.description || `A ${project.template} project built with FreeCode Sandbox.`,
      website_url: `https://skloop.app/${username}/${project.slug}`,
      is_pinned: false
    }]);

  if (error) throw error;
  return true;
}
