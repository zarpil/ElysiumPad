export interface ModrinthSearchResult {
  project_id: string;
  project_type: string;
  slug: string;
  author: string;
  title: string;
  description: string;
  categories: string[];
  display_categories: string[];
  versions: string[];
  downloads: number;
  follows: number;
  icon_url: string;
  date_created: string;
  date_modified: string;
  latest_version: string;
  license: string;
  gallery: string[];
}

export interface ModrinthVersionFile {
  hashes: {
    sha1: string;
    sha512: string;
  };
  url: string;
  filename: string;
  primary: boolean;
  size: number;
  file_type?: string;
}

export interface ModrinthVersion {
  id: string;
  project_id: string;
  author_id: string;
  name: string;
  version_number: string;
  game_versions: string[];
  loaders: string[];
  featured: boolean;
  status: string;
  requested_status: string;
  date_published: string;
  downloads: number;
  files: ModrinthVersionFile[];
  dependencies: {
    version_id: string | null;
    project_id: string | null;
    file_name: string | null;
    dependency_type: 'required' | 'optional' | 'incompatible' | 'embedded';
  }[];
}

const MODRINTH_API = 'https://api.modrinth.com/v2';
const USER_AGENT = 'ElysiumPad-SaaS/1.0 (contact@elysiumpad.local)';

export async function searchModrinthMods(params: {
  query: string;
  version?: string;
  loader?: string;
  limit?: number;
  offset?: number;
}) {
  const facets: string[][] = [['project_type:mod']];

  if (params.version) {
    facets.push([`versions:${params.version}`]);
  }
  if (params.loader) {
    facets.push([`categories:${params.loader.toLowerCase()}`]);
  }

  const searchParams = new URLSearchParams({
    query: params.query || '',
    limit: String(params.limit || 20),
    offset: String(params.offset || 0),
    facets: JSON.stringify(facets),
    index: 'relevance',
  });

  const res = await fetch(`${MODRINTH_API}/search?${searchParams.toString()}`, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`Modrinth API error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.hits as ModrinthSearchResult[];
}

export async function getModrinthProjectVersions(
  projectIdOrSlug: string,
  loaders?: string[],
  gameVersions?: string[]
) {
  const url = new URL(`${MODRINTH_API}/project/${projectIdOrSlug}/version`);
  if (loaders && loaders.length > 0) {
    url.searchParams.set('loaders', JSON.stringify(loaders.map((l) => l.toLowerCase())));
  }
  if (gameVersions && gameVersions.length > 0) {
    url.searchParams.set('game_versions', JSON.stringify(gameVersions));
  }

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!res.ok) {
    throw new Error(`Error fetching mod versions: ${res.statusText}`);
  }

  return (await res.json()) as ModrinthVersion[];
}
