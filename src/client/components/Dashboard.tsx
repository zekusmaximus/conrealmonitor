// Checkpoint: Test with devvit playtest in private sub. Verify dashboard data loading and UI rendering.
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GroupDataResponse } from '../../shared/types/api';

interface Fragment {
  id: string;
  content: string;
  author: string;
}

const Dashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId') || localStorage.getItem('groupId') || 'default-group';
  const [fragmentationIndex, setFragmentationIndex] = useState<number | null>(null);
  const [consensus, setConsensus] = useState<number | null>(null);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/internal/group-data/${groupId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch group data');
        }
        const data: GroupDataResponse = await response.json();
        setFragmentationIndex(data.fragmentation);
        setConsensus(1 - data.fragmentation); // Assuming consensus is inverse of fragmentation
        setFragments(data.fragmentedRealities.slice(0, 3).map((content, index) => ({
          id: index.toString(),
          content,
          author: 'Anonymous',
        })));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [groupId]);

  const handleShareGroup = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/internal/share-group/${groupId}`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to share group');
      }
      const data = await response.json();
      if (data.status === 'success') {
        setToast({ message: 'Group shared to the multiverse!', type: 'success' });
      } else {
        throw new Error(data.error || 'Failed to share group');
      }
    } catch (err) {
      setToast({ message: 'Reality rejected by the matrix!', type: 'error' });
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


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--primary-bg)] border border-[var(--accent-color)] rounded-lg p-4 glow-card">
            <h2 className="text-xl font-orbitron text-[var(--highlight)] mb-2">Fragmentation Index</h2>
            <p className="text-2xl font-orbitron text-[var(--highlight)] text-center">
              {fragmentationIndex !== null ? fragmentationIndex.toFixed(2) : 'N/A'}
            </p>
            <p className="text-sm font-roboto-mono mt-2">Measure of reality divergence</p>
          </div>

          <div className="bg-[var(--primary-bg)] border border-[var(--accent-color)] rounded-lg p-4 glow-card">
            <h2 className="text-xl font-roboto-mono text-[var(--highlight)] mb-2">Consensus Reality</h2>
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
          <h2 className="text-2xl font-orbitron text-[var(--highlight)] mb-4">Fragmented Realities</h2>
          <div className="space-y-4">
            {fragments.map((fragment) => (
              <div key={fragment.id} className="bg-[var(--primary-bg)] border border-[var(--accent-color)] rounded-lg p-4 glow-card">
                <p className="font-roboto-mono mb-2 underline decoration-[var(--highlight)] decoration-2">{fragment.content}</p>
                <p className="text-sm text-[var(--accent-color)]">- {fragment.author}</p>
              </div>
            ))}
          </div>
        </div>


        <div className="mt-8 text-center">
          <button
            onClick={handleShareGroup}
            disabled={loading}
            className="px-6 py-3 bg-[var(--accent-color)] text-[var(--primary-bg)] font-orbitron text-lg rounded-lg hover:shadow-[0_0_20px_var(--accent-color)] transition-all duration-300 glow-button disabled:opacity-50"
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

        {toast && (
          <div
            className={`mt-8 px-4 py-2 rounded-lg text-center font-orbitron text-lg ${
              toast.type === 'success' ? 'bg-green-400 text-black' : 'bg-red-400 text-white'
            }`}
            role="alert"
            aria-live="assertive"
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

// Checkpoint: Verify flair updates in subreddit.
export default Dashboard;
