import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');

  const handleCreateGroup = async () => {
    console.log('Starting group creation');
    console.log('Fetching /internal/groups');

    try {
      const response = await fetch('/internal/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },  // Only if sending body data
        // body: JSON.stringify({})  // Add if needed; empty for now
      });

      console.log('Fetch response received:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to create group: ${response.status}`);
      }

      const data = await response.json();
      console.log('Group created:', data.groupId);
      // e.g., set state or navigate
    } catch (error) {
      console.error('Error in handleCreateGroup:', error);
    } finally {
      console.log('Group creation process finished');
    }
  };

  const handleJoinGroup = () => {
    if (!joinCode.trim()) {
      setError('Please enter a code.');
      return;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(joinCode)) {
      setError('Invalid UUID format.');
      return;
    }
    localStorage.setItem('groupId', joinCode);
    void navigate('/logger');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--primary-bg)] text-[var(--text-color)] p-4">
      <div className="bg-[var(--primary-bg)] border border-[var(--accent-color)] rounded-lg p-8 glow-card max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-orbitron text-[var(--highlight)] mb-4 glow">
            Consensus Reality Monitor
          </h1>
          <p className="text-lg md:text-xl font-roboto-mono">
            Welcome to the future of shared realities
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <button
            onClick={handleCreateGroup}
            disabled={loading}
            className="px-6 py-3 bg-[var(--accent-color)] text-[var(--primary-bg)] font-orbitron text-lg rounded-lg hover:bg-opacity-80 transition-all duration-300 glow-button disabled:opacity-50"
            aria-label="Create a new monitoring group"
            role="button"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="spinner mr-2"></div>
                Creating...
              </div>
            ) : (
              'Create New Monitoring Group'
            )}
          </button>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter your reality's code, traveler."
              className="px-4 py-2 bg-[var(--primary-bg)] border border-[var(--accent-color)] text-[var(--text-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
              aria-label="Enter group code to join"
            />
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
                'Join Existing Group'
              )}
            </button>
          </div>
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
    </div>
  );
};

export default Welcome;
