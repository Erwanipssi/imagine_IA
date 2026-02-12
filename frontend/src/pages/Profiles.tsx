import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ageBands = ['3-5', '6-8', '9-12'] as const;
const schema = z.object({
  name: z.string().min(1, 'Nom requis').max(50),
  ageBand: z.enum(ageBands),
});
type FormData = z.infer<typeof schema>;

export default function Profiles() {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => api.profiles.list(),
  });

  const createMutation = useMutation({
    mutationFn: (d: FormData) => api.profiles.create(d.name, d.ageBand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      setShowForm(false);
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Erreur'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.profiles.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  });

  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ageBand: '6-8' },
  });

  const profiles = data?.profiles ?? [];
  const parent = profiles.find((p) => p.type === 'parent');
  const children = profiles.filter((p) => p.type === 'child');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-10 h-10 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">Chargement des profils...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">👤 Profils</h1>
      <div className="card p-6 mb-6">
        <h2 className="font-display font-semibold text-gray-800 mb-1">Profil parent</h2>
        <p className="text-gray-600">{parent?.name ?? 'Mon profil'}</p>
      </div>
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="font-display font-semibold text-gray-800">Profils enfants</h2>
          <button
            type="button"
            onClick={() => { setShowForm(true); setError(''); }}
            className="btn-primary"
          >
            + Ajouter un enfant
          </button>
        </div>
        {showForm && (
          <form
            onSubmit={handleSubmit((d) => createMutation.mutate(d))}
            className="mb-6 p-5 rounded-xl bg-primary-50/80 border border-primary-100 space-y-4"
          >
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom / Pseudo</label>
              <input
                {...register('name')}
                className="input-field"
                placeholder="Léo"
              />
              {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tranche d'âge</label>
              <select {...register('ageBand')} className="input-field">
                <option value="3-5">3 - 5 ans</option>
                <option value="6-8">6 - 8 ans</option>
                <option value="9-12">9 - 12 ans</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Créer</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        )}
        <ul className="space-y-2">
          {children.length === 0 ? (
            <li className="text-gray-500 py-4">Aucun profil enfant. Ajoutez-en un pour lier des histoires.</li>
          ) : (
            children.map((p) => (
              <li
                key={p._id}
                className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors"
              >
                <span className="font-medium text-gray-800">{p.name}</span>
                <span className="text-sm text-gray-500 shrink-0">{p.ageBand} ans</span>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(p._id)}
                  className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline"
                >
                  Supprimer
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
