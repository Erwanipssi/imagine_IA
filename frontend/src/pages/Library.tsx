import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function Library() {
  const { data, isLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: () => api.stories.list(),
  });
  const stories = data?.stories ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-10 h-10 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">Chargement de la bibliothèque...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">📚 Ma bibliothèque</h1>
      {stories.length === 0 ? (
        <div className="card p-10 md:p-12 text-center">
          <span className="text-5xl block mb-4">📖</span>
          <p className="text-gray-600 text-lg">
            Aucune histoire sauvegardée.
          </p>
          <p className="text-gray-500 mt-2">
            Créez-en une depuis l'onglet{' '}
            <Link to="/create" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
              Créer
            </Link>
            .
          </p>
          <Link to="/create" className="btn-primary mt-6 inline-flex">
            Créer ma première histoire
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s, i) => (
            <li key={s._id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <Link
                to={`/story/${s._id}`}
                className="block card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <span className="text-2xl block mb-2">
                  {s.type === 'story' ? '📖' : '🎵'}
                </span>
                <h2 className="font-display font-semibold text-primary-800 group-hover:text-primary-700">
                  {s.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {s.type === 'story' ? 'Histoire' : 'Comptine'}
                  {s.status === 'draft' ? ' · Brouillon' : ' · Publiée'}
                  {s.childProfileId && typeof s.childProfileId === 'object' && 'name' in s.childProfileId && (
                    <> · {(s.childProfileId as { name: string }).name}</>
                  )}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
