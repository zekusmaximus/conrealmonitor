// Checkpoint: Test with devvit playtest in private sub. Verify D3 visualization rendering and data fetching.
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GroupData } from '../../shared/types/api';

// Props interface for the Visualization component
interface VisualizationProps {
  groupId: string;
}

// Main Visualization component: A responsive D3 horizontal timeline
const Visualization: React.FC<VisualizationProps> = ({ groupId }) => {
  // Ref for the SVG element to attach D3
  const svgRef = useRef<SVGSVGElement>(null);

  // State for fetched data, loading, and error handling
  const [data, setData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from the API endpoint
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/internal/group-data/${groupId}`);
        if (!response.ok) throw new Error('Failed to fetch group data');
        const groupData: GroupData = await response.json();
        setData(groupData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [groupId]);

  // Render the D3 visualization
  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Responsive dimensions
    const width = svgRef.current.clientWidth;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales for time and values
    const allTimes = data.consensus.map(d => new Date(d.time)).concat(data.fragments.map(d => new Date(d.time)));
    const timeExtent = d3.extent(allTimes) as [Date, Date];
    const xScale = d3.scaleTime().domain(timeExtent).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]); // Consensus value 0-1

    // Function to calculate Y position for fragment branches
    const branchY = (branch: number) => {
      const branchHeight = innerHeight / 4;
      return branchHeight * (branch + 1);
    };

    // Draw central line for consensus reality
    const consensusLine = d3.line<GroupData['consensus'][0]>()
      .x(d => xScale(new Date(d.time)))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .append('path')
      .datum(data.consensus)
      .attr('fill', 'none')
      .attr('stroke', 'var(--highlight)')
      .attr('stroke-width', 2)
      .attr('d', consensusLine)
      .attr('aria-label', 'Consensus reality timeline line');

    // Draw fragment branches with thickness based on user count
    const fragmentGroups = d3.group(data.fragments, d => d.branch);
    fragmentGroups.forEach((fragments, branch) => {
      const maxUserCount = d3.max(fragments, d => d.userCount) || 1;
      const thicknessScale = d3.scaleLinear().domain([0, maxUserCount]).range([1, 10]);

      fragments.forEach(fragment => {
        svg.append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`)
          .append('line')
          .attr('x1', xScale(new Date(fragment.time)))
          .attr('y1', branchY(branch))
          .attr('x2', xScale(new Date(fragment.time)))
          .attr('y2', branchY(branch) + 20) // Vertical segment for branch
          .attr('stroke', 'var(--accent-color)')
          .attr('stroke-width', thicknessScale(fragment.userCount))
          .attr('aria-label', `Fragment branch ${branch + 1} at ${new Date(fragment.time).toLocaleString()} with ${fragment.userCount} users`);
      });
    });

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top + innerHeight})`)
      .call(xAxis);

    svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(yAxis);

  }, [data]);

  // Loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="spinner mr-4"></div>
        <span>Loading visualization...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4" role="alert">
        Error loading visualization: {error}
      </div>
    );
  }

  // Main render with scanlines filter applied
  return (
    <div className="scanlines" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="400"
        role="img"
        aria-label="Horizontal timeline visualization showing consensus reality and up to 3 fragment branches"
      />
    </div>
  );
};

export default Visualization;
