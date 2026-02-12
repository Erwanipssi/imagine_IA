import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function Feed() {
  const queryClient = useQueryClient();
  const [ageBand, setAgeBand] = useState('');
  const [theme, setTheme] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['feed', ageBand, theme],
    queryFn: () => api.feed.list({ ageBand: ageBand || undefined, theme: theme || undefined }),
  });
  const stories = data?.stories ?? [];

  const likeMutation = useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      liked ? api.stories.unlike(id) : api.stories.like(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-10 h-10 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">Chargement du feed...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">🌍 Feed public</h1>
      <div className="card p-4 mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tranche d'âge</label>
          <select
            value={ageBand}
            onChange={(e) => setAgeBand(e.target.value)}
            className="input-field py-2.5 max-w-[140px]"
          >
            <option value="">Toutes</option>
            <option value="3-5">3-5 ans</option>
            <option value="6-8">6-8 ans</option>
            <option value="9-12">9-12 ans</option>
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Rechercher par thème</label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="ex: dinosaures, forêt..."
            className="input-field py-2.5"
          />
        </div>
      </div>
      {stories.length === 0 ? (
        <div className="card p-10 md:p-12 text-center">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-gray-600 text-lg">Aucune histoire publiée pour le moment.</p>
          <p className="text-gray-500 mt-2">Publiez la vôtre depuis votre bibliothèque !</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {stories.map((s, i) => (
            <li key={s._id} className="card p-6 hover:shadow-card-hover transition-all duration-300 animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/story/${s._id}`}
                    className="font-display font-semibold text-primary-800 hover:text-primary-600 text-lg transition-colors"
                  >
                    {s.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    {s.type === 'story' ? 'Histoire' : 'Comptine'} · {s.ageBand} ans
                    {s.childProfileId && typeof s.childProfileId === 'object' && 'name' in s.childProfileId && (
                      <> · {(s.childProfileId as { name: string }).name}</>
                    )}
                  </p>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap line-clamp-3 leading-relaxed">
                    {s.content}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => likeMutation.mutate({ id: s._id, liked: s.liked })}
                    disabled={likeMutation.isPending}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      s.liked
                        ? 'bg-primary-500 text-white shadow-soft'
                        : 'bg-surface-100 text-gray-600 hover:bg-surface-200'
                    }`}
                  >
                    ♥ {s.likeCount}
                  </button>
                  <Link
                    to={`/story/${s._id}`}
                    className="btn-secondary py-2 text-sm"
                  >
                    Lire
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
