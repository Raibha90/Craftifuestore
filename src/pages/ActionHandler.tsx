import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { KeyRound, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function ActionHandler() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  const token = searchParams.get('token');
  const actionType = window.location.pathname.split('/').pop()?.replace(/-/g, '_');

  useEffect(() => {
    if (!token || !actionType) {
      setError('Invalid or missing action token.');
      setLoading(false);
      return;
    }

    verifyToken();
  }, [token, actionType]);

  const verifyToken = async () => {
    try {
      const res = await fetch(`/api/action/verify-token?token=${token}&type=${actionType}`);
      const data = await res.json();
      
      if (data.valid) {
        setVerifiedData(data);
      } else {
        setError(data.reason === 'expired' ? 'This link has expired.' : 'This link is no longer valid.');
      }
    } catch (err) {
      setError('Failed to verify security token.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 12) {
      showToast('Password must be at least 12 characters.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/action/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: newPassword,
          passwordConfirm: confirmPassword
        })
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
        showToast(data.message, 'success');
        setTimeout(() => navigate('/admin/login'), 3000);
      } else {
        showToast(data.error || 'Failed to reset password.', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  let content;

  if (loading) {
    content = (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    );
  } else if (error) {
    content = (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-brand-olive mb-4">Security Error</h2>
          <p className="text-gray-500 mb-8">{error}</p>
          <button 
            onClick={() => navigate('/admin/login')}
            className="w-full py-4 bg-brand-olive text-white rounded-2xl font-bold uppercase tracking-widest text-[10px]"
          >
            Back to Safety
          </button>
        </motion.div>
      </div>
    );
  } else if (success) {
    content = (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-brand-olive mb-4">Success!</h2>
          <p className="text-gray-500 mb-8">{success}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest animate-pulse">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  } else {
    content = (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {actionType === 'password_reset' ? <KeyRound className="w-6 h-6 text-brand-gold" /> : <Mail className="w-6 h-6 text-brand-gold" />}
            </div>
            <h2 className="text-2xl font-serif font-bold text-brand-olive uppercase tracking-tight">
              {actionType === 'password_reset' ? 'New Credential' : 'Verifying Action'}
            </h2>
          </div>

          {actionType === 'password_reset' && (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-4">New Password</label>
                <input 
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                  placeholder="••••••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-4">Confirm New Password</label>
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                  placeholder="••••••••••••"
                />
              </div>

              <button 
                disabled={submitting}
                className="w-full py-4 bg-brand-olive text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-brand-olive/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Set New Password'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  return content;
}
