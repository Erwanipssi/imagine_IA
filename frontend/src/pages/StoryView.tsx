import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export default function StoryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [reportReason, setReportReason] = useState('');
  const [showReport, setShowReport] = useState(false);
  const { speak, stop, pause, resume, isSpeaking, isPaused, supported } = useSpeechSynthesis({ rate: 0.9 });

  const { data, isLoading } = useQuery({
    queryKey: ['story', id],
    queryFn: () => api.stories.get(id!),
    enabled: !!id,
  });

  const likeMutation = useMutation({
    mutationFn: (liked: boolean) => (liked ? api.stories.unlike(id!) : api.stories.like(id!)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['story', id] }),
  });

  const publishMutation = useMutation({
    mutationFn: () => api.stories.publish(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['story', id] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const reportMutation = useMutation({
    mutationFn: () => api.stories.report(id!, reportReason),
    onSuccess: () => { setShowReport(false); setReportReason(''); },
  });

  if (!id || isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-10 h-10 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">Chargement...</p>
      </div>
    );
  }

  const { story } = data;
  const isOwner = user?.id && story.userId?.toString() === user.id;
  const isPublished = story.status === 'published';
  const pdfUrl = api.stories.pdf(id);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm font-semibold text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-1"
      >
        ← Retour
      </button>
      <div className="card p-6 md:p-8">
        <div className="flex items-start gap-3 mb-2">
          <span className="text-3xl">
            {story.type === 'story' ? '📖' : '🎵'}
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary-800">
              {story.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {story.type === 'story' ? 'Histoire' : 'Comptine'}
              {story.status && ` · ${story.status === 'draft' ? 'Brouillon' : 'Publiée'}`}
            </p>
          </div>
        </div>
        <div className="mt-6 prose prose-lg max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed border-t border-surface-200 pt-6">
          {story.content}
        </div>

        <div className="mt-8 pt-6 border-t border-surface-200 flex flex-wrap gap-3">
          {supported && (
            <>
              {!isSpeaking ? (
                <button
                  type="button"
                  onClick={() => speak(story.content)}
                  className="btn-accent"
                >
                  🔊 Écouter l'histoire
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={isPaused ? resume : pause}
                    className="btn-secondary"
                  >
                    {isPaused ? '▶ Reprendre' : '⏸ Pause'}
                  </button>
                  <button type="button" onClick={stop} className="btn-secondary">
                    ⏹ Arrêter
                  </button>
                </>
              )}
            </>
          )}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            📄 Télécharger en PDF
          </a>
          {isOwner && story.status === 'draft' && (
            <button
              type="button"
              onClick={() => publishMutation.mutate()}
              disabled={publishMutation.isPending}
              className="btn-primary"
            >
              {publishMutation.isPending ? 'Publication...' : 'Publier'}
            </button>
          )}
          {isPublished && !isOwner && (
            <>
              <button
                type="button"
                onClick={() => likeMutation.mutate(story.liked ?? false)}
                disabled={likeMutation.isPending}
                className={story.liked ? 'btn-primary' : 'btn-secondary'}
              >
                ♥ Like
              </button>
              <button
                type="button"
                onClick={() => setShowReport(true)}
                className="px-4 py-2.5 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                Signaler
              </button>
            </>
          )}
        </div>

        {showReport && (
          <div className="mt-6 p-5 rounded-xl bg-surface-50 border border-surface-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Raison du signalement</label>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={3}
              className="input-field"
              placeholder="Décrivez le problème..."
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => reportMutation.mutate()}
                disabled={!reportReason.trim() || reportMutation.isPending}
                className="px-4 py-2.5 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Envoyer
              </button>
              <button
                type="button"
                onClick={() => setShowReport(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
