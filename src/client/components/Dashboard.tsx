// Checkpoint: Test with devvit playtest in private sub. Verify dashboard data loading and UI rendering.
import React, { useState, useEffect } from 'react';

interface Fragment {
  id: string;
  content: string;
  author: string;
}

interface Context {
  reddit: {
    submitPost: (options: { title: string; text: string }) => Promise<void>;
  };
}

const Dashboard: React.FC<{ context?: Context }> = ({ context }) => {
  const [fragmentationIndex, setFragmentationIndex] = useState<number | null>(null);
  const [consensus, setConsensus] = useState<number | null>(null);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setFragmentationIndex(0.75);
        setConsensus(0.85);
        setFragments([
          { id: '1', content: 'Reality is subjective.', author: 'User1' },
          { id: '2', content: 'Consensus builds truth.', author: 'User2' },
        ]);
        setScore(100);
        setBadges(['Reality Seeker', 'Consensus Builder', 'Fragment Collector']);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, []);

  const handleShareGroup = async () => {
    if (!context?.reddit?.submitPost) {
      setError('Reddit context not available.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await context.reddit.submitPost({
        title: 'Join our Reality Monitoring Group!',
        text: 'Dive into our parallel universe—join now! Group UUID: default-group',
      });
    } catch (err) {
      setError('Failed to share group post.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--primary-bg)] text-[var(--text-color)]">
        <div className="flex items-center">
          <div className="spinner mr-4"></div>
          <span className="font-roboto-mono">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--primary-bg)] text-[var(--text-color)] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-orbitron text-[var(--highlight)] text-center mb-8 glow">
          Consensus Dashboard
        </h1>

        <div className="mb-6 text-center text-[var(--accent-color)]">
          <p className="font-roboto-mono">Gamification Score: {score} points</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--primary-bg)] border border-[var(--accent-color)] rounded-lg p-4 glow-card">
            <h2 className="text-xl font-orbitron text-[var(--highlight)] mb-2">Fragmentation Index</h2>
            <p className="text-2xl font-roboto-mono text-[var(--accent-color)]">
              {fragmentationIndex !== null ? `${(fragmentationIndex * 100).toFixed(1)}%` : 'N/A'}
            </p>
            <p className="text-sm font-roboto-mono mt-2">Measure of reality divergence</p>
          </div>

          <div className="bg-[var(--primary-bg)] border border-[var(--accent-color)] rounded-lg p-4 glow-card">
            <h2 className="text-xl font-orbitron text-[var(--highlight)] mb-2">Consensus Level</h2>
            <p className="text-2xl font-roboto-mono text-[var(--accent-color)]">
              {consensus !== null ? `${(consensus * 100).toFixed(1)}%` : 'N/A'}
            </p>
            <p className="text-sm font-roboto-mono mt-2">Agreement on shared reality</p>
          </div>

          <div className="bg-[var(--primary-bg)] border border-[var(--accent-color)] rounded-lg p-4 glow-card">
            <h2 className="text-xl font-orbitron text-[var(--highlight)] mb-2">Fragments Count</h2>
            <p className="text-2xl font-roboto-mono text-[var(--accent-color)]">
              {fragments.length}
            </p>
            <p className="text-sm font-roboto-mono mt-2">Total reality logs submitted</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-orbitron text-[var(--highlight)] mb-4">Recent Fragments</h2>
          <div className="space-y-4">
            {fragments.map((fragment) => (
              <div key={fragment.id} className="bg-[var(--primary-bg)] border border-[var(--accent-color)] rounded-lg p-4 glow-card">
                <p className="font-roboto-mono mb-2">{fragment.content}</p>
                <p className="text-sm text-[var(--accent-color)]">- {fragment.author}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-orbitron text-[var(--highlight)] mb-4">Fun Badges</h2>
          <div className="flex flex-wrap gap-4">
            {badges.map((badge, index) => (
              <div
                key={index}
                className="bg-[var(--primary-bg)] border border-[var(--highlight)] rounded-lg px-4 py-2 glow-badge"
                role="img"
                aria-label={`Badge: ${badge}`}
              >
                <span className="font-orbitron text-[var(--highlight)]">{badge}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleShareGroup}
            disabled={loading || !context?.reddit?.submitPost}
            className="px-6 py-3 bg-[var(--highlight)] text-[var(--primary-bg)] font-orbitron text-lg rounded-lg hover:bg-opacity-80 transition-all duration-300 glow-button disabled:opacity-50"
            aria-label="Share group on Reddit"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="spinner mr-2"></div>
                Sharing...
              </div>
            ) : (
              'Share Group'
            )}
          </button>
        </div>

        {error && (
          <div
            className="mt-8 bg-red-600 text-white px-4 py-2 rounded-lg"
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

export default Dashboard;
