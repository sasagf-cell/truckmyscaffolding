
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { confirmPasswordReset } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pass) => {
    if (pass.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(pass)) return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(pass)) return "Password must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one special character";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      toast.error('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(token, password, passwordConfirm);
      toast.success('Password reset successfully. You can now log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password. The link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Invalid Reset Link</h2>
          <p className="text-muted-foreground mb-6">No reset token was provided in the URL. Please request a new password reset link.</p>
          <Link to="/forgot-password" className="btn-primary">Request new link</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Reset Password - TrackMyScaffolding</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-1 text-2xl font-bold mb-6">
              <span className="text-primary">Track</span>
              <span className="text-secondary">MyScaffolding</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Set new password</h1>
            <p className="text-muted-foreground">Please enter your new password below</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field text-foreground"
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Must be at least 8 characters and include an uppercase letter, a number, and a special character.
                </p>
              </div>

              <div>
                <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="passwordConfirm"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  className="input-field text-foreground"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
