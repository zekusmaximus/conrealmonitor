import React, { useState } from 'react';

const Welcome: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const handleCreateGroup = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setScore(prev => prev + 10);
      // Navigate or handle success
    } catch (err) {
      setError('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setScore(prev => prev + 5);
      // Navigate or handle success
    } catch (err) {
      setError('Failed to join group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--primary-bg)] text-[var(--text-color)] p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-orbitron text-[var(--highlight)] mb-4 glow">
          Consensus Reality Monitor
        </h1>
        <p className="text-lg md:text-xl font-roboto-mono">
          Welcome to the future of shared realities
        </p>
        <div className="mt-4 text-[var(--accent-color)]">
          Gamification Score: {score} points
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={handleCreateGroup}
          disabled={loading}
          className="px-6 py-3 bg-[var(--accent-color)] text-[var(--primary-bg)] font-orbitron text-lg rounded-lg hover:bg-opacity-80 transition-all duration-300 glow-button disabled:opacity-50"
          aria-label="Create a new group"
          role="button"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="spinner mr-2"></div>
              Creating...
            </div>
          ) : (
            'Create Group'
          )}
        </button>
        <button
          onClick={handleJoinGroup}
          disabled={loading}
          className="px-6 py-3 bg-[var(--highlight)] text-[var(--primary-bg)] font-orbitron text-lg rounded-lg hover:bg-opacity-80 transition-all duration-300 glow-button disabled:opacity-50"
          aria-label="Join an existing group"
          role="button"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="spinner mr-2"></div>
              Joining...
            </div>
          ) : (
            'Join Group'
          )}
        </button>
      </div>

      {error && (
        <div
          className="bg-red-600 text-white px-4 py-2 rounded-lg mb-4"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

    </div>
  );
};

export default Welcome;
