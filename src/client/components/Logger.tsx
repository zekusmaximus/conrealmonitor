import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Logger: React.FC = () => {
  const [realityLog, setRealityLog] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!realityLog.trim()) {
      toast.error('Reality rejected by the matrix!', {
        style: {
          background: '#dc2626',
          color: '#ffffff',
        },
      });
      return;
    }
    setLoading(true);
    try {
      const groupId = localStorage.getItem('groupId');
      const response = await fetch('/internal/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: realityLog, groupId }),
      });
      if (!response.ok) {
        throw new Error('Failed to log reality');
      }
      toast.success('Reality logged!', {
        style: {
          background: '#16a34a',
          color: '#ffffff',
        },
      });
      setRealityLog('');
      void navigate(`/dashboard${groupId ? `?groupId=${groupId}` : ''}`);
    } catch (err) {
      toast.error('Reality rejected by the matrix!', {
        style: {
          background: '#dc2626',
          color: '#ffffff',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--primary-bg)] text-[var(--text-color)] p-4">
      <div className="w-full max-w-md bg-[var(--primary-bg)] border border-[var(--accent-color)] rounded-lg p-6 shadow-lg glow-card">
        <h2 className="text-2xl font-orbitron text-[var(--highlight)] text-center mb-4 glow neon-underline">
          Log Today's Reality
        </h2>
        <p className="text-sm font-roboto-mono text-center mb-4">
          Share your perception of reality to contribute to consensus.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reality-textarea" className="block text-sm font-roboto-mono mb-2">
              Reality Log:
            </label>
            <textarea
              id="reality-textarea"
              value={realityLog}
              onChange={(e) => setRealityLog(e.target.value)}
              className="w-full h-32 p-3 bg-[var(--primary-bg)] border border-[var(--accent-color)] rounded-lg text-[var(--text-color)] font-roboto-mono focus:outline-none focus:ring-2 focus:ring-[var(--highlight)] resize-none"
              placeholder="Describe your glitchy day"
              aria-describedby="reality-help"
              required
            />
            <p id="reality-help" className="text-xs text-[var(--text-color)] mt-1">
              Be honest and detailed for better consensus.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-[var(--accent-color)] text-[var(--primary-bg)] font-orbitron rounded-lg hover:bg-opacity-80 transition-all duration-300 glow-button disabled:opacity-50"
            aria-label="Submit reality log"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="spinner mr-2"></div>
                Logging...
              </div>
            ) : (
              'Submit Log'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Logger;
