import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export default function Admin() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => api.admin.reports(),
  });
  const reports = data?.reports ?? [];

  const removeStory = useMutation({
    mutationFn: (id: string) => api.admin.removeStory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  });
  const blockUser = useMutation({
    mutationFn: (id: string) => api.admin.blockUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  });
  const dismissReport = useMutation({
    mutationFn: (id: string) => api.admin.dismissReport(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-10 h-10 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="page-title">🛡️ Back-office — Modération</h1>
      <h2 className="text-lg font-display font-semibold text-gray-700 mb-4">Signalements en attente</h2>
      {reports.length === 0 ? (
        <div className="card p-10 text-center">
          <span className="text-4xl block mb-3">✅</span>
          <p className="text-gray-600">Aucun signalement en attente.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li key={r._id} className="card p-5">
              <p className="font-display font-semibold text-primary-800">{r.storyId?.title ?? 'Histoire'}</p>
              <p className="text-sm text-gray-600 mt-1">Raison : {r.reason}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Signalé par{' '}
                {typeof r.reporterUserId === 'object' && r.reporterUserId && 'email' in r.reporterUserId
                  ? (r.reporterUserId as { email: string }).email
                  : '-'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const sid =
                      typeof r.storyId === 'object' && r.storyId && '_id' in r.storyId
                        ? (r.storyId as { _id: string })._id
                        : r.storyId;
                    if (sid) removeStory.mutate(String(sid));
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Retirer la publication
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const uid =
                      typeof r.storyId === 'object' && r.storyId && 'userId' in r.storyId
                        ? (r.storyId as { userId: string }).userId
                        : null;
                    if (uid) blockUser.mutate(String(uid));
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
                >
                  Bloquer l'auteur
                </button>
                <button
                  type="button"
                  onClick={() => dismissReport.mutate(r._id)}
                  className="btn-secondary py-2 text-sm"
                >
                  Classer sans suite
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
