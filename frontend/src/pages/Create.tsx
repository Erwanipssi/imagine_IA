import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

const tones = ['joyeux', 'rassurant', 'drôle', 'éducatif'] as const;
const schema = z.object({
  childProfileId: z.string().optional(),
  ageBand: z.enum(['3-5', '6-8', '9-12']),
  type: z.enum(['story', 'rhyme']),
  theme: z.string().min(1, 'Thème obligatoire'),
  characters: z.string().min(1, 'Personnages obligatoires'),
  emotion: z.string().min(1, 'Émotion obligatoire'),
  moral: z.string().optional(),
  situation: z.string().optional(),
  tone: z.enum(tones).optional(),
});
type FormData = z.infer<typeof schema>;

export default function Create() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [generated, setGenerated] = useState<{
    title: string;
    content: string;
    inputs: Record<string, string>;
    childProfileId: string;
    type: string;
    ageBand: string;
  } | null>(null);
  const [error, setError] = useState('');
  const { speak, stop, isSpeaking, supported } = useSpeechSynthesis({ rate: 0.9 });

  const { data: profilesData } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => api.profiles.list(),
  });
  const children = (profilesData?.profiles ?? []).filter((p) => p.type === 'child');

  const generateMutation = useMutation({
    mutationFn: (body: FormData) => api.generate(body),
    onSuccess: (data) => setGenerated(data),
    onError: (e) => setError(e instanceof Error ? e.message : 'Erreur'),
  });

  const saveMutation = useMutation({
    mutationFn: (body: { title: string; content: string; childProfileId: string; type: string; inputs: Record<string, string>; ageBand: string }) =>
      api.stories.create({ ...body, type: body.type as 'story' | 'rhyme' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      navigate(`/story/${data.story._id}`);
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Erreur'),
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'story', tone: 'joyeux', ageBand: '6-8' },
  });

  const onGenerate = (data: FormData) => {
    setError('');
    setGenerated(null);
    generateMutation.mutate(data);
  };

  const onSave = () => {
    if (!generated) return;
    setError('');
    saveMutation.mutate({
      title: generated.title,
      content: generated.content,
      childProfileId: generated.childProfileId,
      type: generated.type,
      inputs: generated.inputs,
      ageBand: generated.ageBand,
    });
  };

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">
        {generated ? '✨ Résultat & sauvegarde' : 'Créer une histoire ou une comptine'}
      </h1>

      {!generated ? (
        <form onSubmit={handleSubmit(onGenerate)} className="card p-6 md:p-8 max-w-2xl space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tranche d'âge *</label>
              <select {...register('ageBand')} className="input-field">
                <option value="3-5">3 - 5 ans</option>
                <option value="6-8">6 - 8 ans</option>
                <option value="9-12">9 - 12 ans</option>
              </select>
              {errors.ageBand && <p className="mt-1.5 text-sm text-red-600">{errors.ageBand.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Profil enfant (optionnel)</label>
              <select {...register('childProfileId')} className="input-field">
                <option value="">Aucun</option>
                {children.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} ({c.ageBand} ans)</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <span className="block text-sm font-semibold text-gray-700 mb-2">Type</span>
            <div className="flex gap-4 p-2 bg-surface-50 rounded-xl">
              <label className="flex items-center gap-2 cursor-pointer flex-1 justify-center py-2 rounded-lg transition-colors has-[:checked]:bg-primary-100 has-[:checked]:text-primary-800">
                <input type="radio" {...register('type')} value="story" className="sr-only" />
                📖 Histoire
              </label>
              <label className="flex items-center gap-2 cursor-pointer flex-1 justify-center py-2 rounded-lg transition-colors has-[:checked]:bg-primary-100 has-[:checked]:text-primary-800">
                <input type="radio" {...register('type')} value="rhyme" className="sr-only" />
                🎵 Comptine
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Thème *</label>
            <input
              {...register('theme')}
              placeholder="ex: la forêt, les dinosaures"
              className="input-field"
            />
            {errors.theme && <p className="mt-1.5 text-sm text-red-600">{errors.theme.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Personnages *</label>
              <input
                {...register('characters')}
                placeholder="ex: un lapin, une fée"
                className="input-field"
              />
              {errors.characters && <p className="mt-1.5 text-sm text-red-600">{errors.characters.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Émotion *</label>
              <input
                {...register('emotion')}
                placeholder="ex: la joie, le courage"
                className="input-field"
              />
              {errors.emotion && <p className="mt-1.5 text-sm text-red-600">{errors.emotion.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Ton</label>
              <select {...register('tone')} className="input-field">
                {tones.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Morale (optionnel)</label>
              <input {...register('moral')} placeholder="ex: l'amitié est précieuse" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Situation (optionnel)</label>
            <input {...register('situation')} placeholder="ex: un matin d'automne" className="input-field" />
          </div>
          <button
            type="submit"
            disabled={generateMutation.isPending}
            className="btn-primary px-8 py-3.5 text-base"
          >
            {generateMutation.isPending ? '⏳ Génération en cours...' : "✨ Générer avec l'IA"}
          </button>
        </form>
      ) : (
        <div className="card p-6 md:p-8 max-w-3xl space-y-6 animate-slide-up">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
              {error}
            </div>
          )}
          <h2 className="text-xl font-display font-bold text-primary-800">{generated.title}</h2>
          <div className="prose prose-lg max-w-none whitespace-pre-wrap text-gray-700 rounded-xl bg-surface-50/80 p-6 border border-surface-200/80 leading-relaxed">
            {generated.content}
          </div>
          <div className="flex flex-wrap gap-3">
            {supported && (
              <button
                type="button"
                onClick={isSpeaking ? stop : () => speak(generated.content)}
                className={isSpeaking ? 'btn-secondary' : 'btn-secondary'}
              >
                {isSpeaking ? '⏹ Arrêter la lecture' : '🔊 Écouter'}
              </button>
            )}
            <button
              type="button"
              onClick={onSave}
              disabled={saveMutation.isPending}
              className="btn-accent"
            >
              {saveMutation.isPending ? 'Sauvegarde...' : '💾 Sauvegarder dans la bibliothèque'}
            </button>
            <button type="button" onClick={() => setGenerated(null)} className="btn-secondary">
              Modifier et régénérer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
