const API = (import.meta.env.VITE_API_URL ?? '') + '/api';

async function request<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, ...init } = options;
  const headers: HeadersInit = {
    ...(init.headers as Record<string, string>),
  };
  if (json !== undefined) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...init,
      credentials: 'include',
      headers,
      body: json !== undefined ? JSON.stringify(json) : init.body,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/fetch|network|failed|refused/i.test(msg) || e instanceof TypeError) {
      throw new Error(
        'Impossible de contacter le serveur. Vérifiez que le backend est démarré (terminal : npm run dev:backend ou npm run dev).'
      );
    }
    throw e;
  }
  const text = await res.text();
  let data: T;
  try {
    data = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    throw new Error(res.ok ? text : `Erreur ${res.status}`);
  }
  if (!res.ok) {
    const err = (data as { error?: string })?.error ?? `Erreur ${res.status}`;
    throw new Error(err);
  }
  return data;
}

export const api = {
  auth: {
    me: () => request<{ user: { id: string; email: string; role: string } }>('/auth/me'),
    login: (email: string, password: string) =>
      request<{ user: { id: string; email: string; role: string } }>('/auth/login', {
        method: 'POST',
        json: { email, password },
      }),
    register: (email: string, password: string) =>
      request<{ user: { id: string; email: string; role: string } }>('/auth/register', {
        method: 'POST',
        json: { email, password },
      }),
    logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
  },
  profiles: {
    list: () => request<{ profiles: Array<{ _id: string; type: string; name: string; ageBand?: string }> }>('/profiles'),
    create: (name: string, ageBand: string) =>
      request<{ profile: { _id: string; name: string; ageBand: string } }>('/profiles', {
        method: 'POST',
        json: { name, ageBand },
      }),
    update: (id: string, data: { name?: string; ageBand?: string }) =>
      request<{ profile: unknown }>(`/profiles/${id}`, { method: 'PATCH', json: data }),
    delete: (id: string) => request<{ ok: boolean }>(`/profiles/${id}`, { method: 'DELETE' }),
  },
  generate: (body: {
    ageBand: string;
    childProfileId?: string;
    type: 'story' | 'rhyme';
    theme: string;
    characters: string;
    emotion: string;
    moral?: string;
    situation?: string;
    tone?: string;
  }) =>
    request<{
      title: string;
      content: string;
      inputs: Record<string, string>;
      childProfileId: string;
      type: string;
      ageBand: string;
    }>('/generate', { method: 'POST', json: body }),
  stories: {
    list: () =>
      request<{
        stories: Array<{
          _id: string;
          title: string;
          type: string;
          status: string;
          childProfileId?: { name: string };
          updatedAt: string;
        }>;
      }>('/stories'),
    get: (id: string) =>
      request<{
        story: {
          _id: string;
          title: string;
          content: string;
          type: string;
          status: string;
          inputs?: Record<string, string>;
          liked?: boolean;
        };
      }>(`/stories/${id}`),
    create: (body: {
      childProfileId: string;
      type: 'story' | 'rhyme';
      title: string;
      content: string;
      inputs?: Record<string, string>;
      ageBand: string;
    }) => request<{ story: { _id: string } }>('/stories', { method: 'POST', json: body }),
    update: (id: string, body: { title?: string; content?: string; inputs?: Record<string, string> }) =>
      request<{ story: unknown }>(`/stories/${id}`, { method: 'PATCH', json: body }),
    publish: (id: string) =>
      request<{ story: unknown }>(`/stories/${id}/publish`, { method: 'POST' }),
    like: (id: string) => request<{ liked: boolean; count: number }>(`/stories/${id}/like`, { method: 'POST' }),
    unlike: (id: string) => request<{ liked: boolean; count: number }>(`/stories/${id}/like`, { method: 'DELETE' }),
    report: (id: string, reason: string) =>
      request<{ ok: boolean }>(`/stories/${id}/report`, { method: 'POST', json: { reason } }),
    pdf: (id: string) => `${API}/stories/${id}/pdf`,
  },
  feed: {
    list: (params?: { ageBand?: string; theme?: string }) => {
      const q = new URLSearchParams();
      if (params?.ageBand?.trim()) q.set('ageBand', params.ageBand.trim());
      if (params?.theme?.trim()) q.set('theme', params.theme.trim());
      const query = q.toString();
      return request<{
        stories: Array<{
          _id: string;
          title: string;
          content: string;
          type: string;
          ageBand: string;
          liked: boolean;
          likeCount: number;
          publishedAt: string;
          userId?: { email: string };
          childProfileId?: { name: string };
        }>;
      }>(`/feed${query ? `?${query}` : ''}`);
    },
  },
  admin: {
    reports: () =>
      request<{
        reports: Array<{
          _id: string;
          reason: string;
          storyId: { title: string; userId: string };
          reporterUserId: { email: string };
          createdAt: string;
        }>;
      }>('/admin/reports'),
    removeStory: (id: string) =>
      request<{ story: unknown }>(`/admin/stories/${id}/remove`, { method: 'POST' }),
    blockUser: (id: string) =>
      request<{ user: unknown }>(`/admin/users/${id}/block`, { method: 'POST' }),
    dismissReport: (id: string) =>
      request<{ report: unknown }>(`/admin/reports/${id}/dismiss`, { method: 'PATCH' }),
  },
};
