import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

const schema = z
  .object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Minimum 8 caractères'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await api.auth.register(data.email, data.password);
      queryClient.setQueryData(['auth'], { user: res.user });
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md card p-8 md:p-10 animate-slide-up">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-2">✨</span>
          <h1 className="text-2xl font-display font-bold text-primary-700">Imagine AI</h1>
          <p className="text-gray-500 mt-1">Histoires et comptines pour enfants</p>
        </div>
        <h2 className="text-lg font-display font-semibold text-gray-800 mb-6">Inscription</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              {...register('email')}
              className="input-field"
              placeholder="vous@exemple.fr"
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              {...register('password')}
              className="input-field"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="input-field"
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5">
            {isSubmitting ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
