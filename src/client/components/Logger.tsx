import React, { useState } from 'react';

const Logger: React.FC = () => {
  const [realityLog, setRealityLog] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!realityLog.trim()) {
      setError('Please enter a reality log.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setScore(prev => prev + 15);
      setRealityLog('');
      // Handle success
    } catch (err) {
      setError('Failed to log reality. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--primary-bg)] text-[var(--text-color)] p-4">
      <div className="w-full max-w-md bg-[var(--primary-bg)] border border-[var(--accent-color)] rounded-lg p-6 shadow-lg glow-card">
        <h2 className="text-2xl font-orbitron text-[var(--highlight)] text-center mb-4 glow">
          Log Your Reality
        </h2>
        <p className="text-sm font-roboto-mono text-center mb-4">
          Share your perception of reality to contribute to consensus.
        </p>
        <div className="mb-4 text-[var(--accent-color)] text-center">
          Gamification Score: {score} points
        </div>

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
              placeholder="Describe your reality..."
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

        {error && (
          <div
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}
      </div>

    </div>
  );
};

export default Logger;
