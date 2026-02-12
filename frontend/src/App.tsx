import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profiles from './pages/Profiles';
import Create from './pages/Create';
import Library from './pages/Library';
import Feed from './pages/Feed';
import StoryView from './pages/StoryView';
import Admin from './pages/Admin';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Chargement...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Chargement...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/create" replace />} />
          <Route path="profiles" element={<Profiles />} />
          <Route path="create" element={<Create />} />
          <Route path="library" element={<Library />} />
          <Route path="feed" element={<Feed />} />
          <Route path="story/:id" element={<StoryView />} />
        </Route>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout />
            </AdminRoute>
          }
        >
          <Route index element={<Admin />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
