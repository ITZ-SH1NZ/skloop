import { SupabaseClient } from "@supabase/supabase-js";

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  language?: string;
  parentId: string | null;
  isExpanded?: boolean;
}

export interface FreeCodeProject {
  id: string;
  user_id: string;
  name: string;
  description: string;
  slug: string;
  files: FileNode[];
  template: string;
  color: string;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Project</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>

  <h1>Hello, World!</h1>

  <script src="script.js"></script>
</body>
</html>`;

const DEFAULT_CSS = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, sans-serif;
  background: #fff;
  color: #111;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
}`;

const DEFAULT_JS = `// Your JavaScript goes here
console.log('Hello from script.js');`;

export function getDefaultFiles(): FileNode[] {
  return [
    { id: 'index.html', name: 'index.html', type: 'file', content: DEFAULT_HTML, language: 'html', parentId: null },
    { id: 'style.css',  name: 'style.css',  type: 'file', content: DEFAULT_CSS,  language: 'css',  parentId: null },
    { id: 'script.js',  name: 'script.js',  type: 'file', content: DEFAULT_JS,   language: 'javascript', parentId: null },
  ];
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
  color: string = '#A3E635',
  thumbnail_url: string | null = null
) {
  const slug = generateSlug(name);
  const files = getDefaultFiles();

  const { data, error } = await supabase
    .from("freecode_projects")
    .insert([
      {
        user_id: userId,
        name,
        description,
        slug,
        template: 'vanilla',
        files,
        color,
        thumbnail_url
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data as FreeCodeProject;
}

export async function updateProjectFiles(supabase: SupabaseClient, projectId: string, files: FileNode[]) {
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

export async function updateProjectMeta(
  supabase: SupabaseClient,
  projectId: string,
  meta: { name?: string; color?: string; thumbnail_url?: string | null }
) {
  const { data, error } = await supabase
    .from("freecode_projects")
    .update({
      ...meta,
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

  const { error } = await supabase
    .from("user_projects")
    .insert([{
      user_id: userId,
      title: project.name,
      description: project.description || `A vanilla HTML/CSS/JS project built with FreeCode Sandbox.`,
      website_url: `https://skloop.app/${username}/${project.slug}`,
      is_pinned: false
    }]);

  if (error) throw error;
  return true;
}
