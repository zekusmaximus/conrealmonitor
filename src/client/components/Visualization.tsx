// Checkpoint: Test with devvit playtest in private sub. Verify D3 visualization rendering and data fetching.
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GroupData, GroupDataResponse } from '../../shared/types/api';

// Props interface for the Visualization component
interface VisualizationProps {
  groupId: string;
}

// Main Visualization component: A responsive D3 horizontal timeline
const Visualization: React.FC<VisualizationProps> = ({ groupId }) => {
  // Ref for the SVG element to attach D3
  const svgRef = useRef<SVGSVGElement>(null);

  // State for fetched data, loading, and error handling
  const [response, setResponse] = useState<GroupDataResponse | null>(null);
  const [data, setData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fragmentation, setFragmentation] = useState(0);

  // Fetch data from the API endpoint
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/internal/group-data/${groupId}`);
        if (!response.ok) throw new Error('Failed to fetch group data');
        const groupDataResponse: GroupDataResponse = await response.json();
        setResponse(groupDataResponse);
        // Convert to GroupData for visualization
        const now = new Date().toISOString();
        const groupData: GroupData = {
          consensus: [{ time: now, value: 1 - groupDataResponse.fragmentation }],
          fragments: groupDataResponse.fragmentedRealities.map((content, index) => ({
            id: index.toString(),
            time: now,
            userCount: 1,
            branch: index % 3,
          })),
        };
        setData(groupData);
        setFragmentation(groupDataResponse.fragmentation);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [groupId]);

  // Render the D3 visualization with dynamic animations
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

    // Limit to 3 branches: sort by total user count
    const branchTotals = d3.rollup(data.fragments, v => d3.sum(v, d => d.userCount), d => d.branch);
    const topBranches = Array.from(branchTotals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(d => d[0]);

    // Draw central line for consensus reality with animation
    const consensusLine = d3.line<GroupData['consensus'][0]>()
      .x(d => xScale(new Date(d.time)))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const consensusPath = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .append('path')
      .datum(data.consensus)
      .attr('fill', 'none')
      .attr('stroke', 'var(--accent-color)')
      .attr('stroke-width', 2)
      .attr('d', consensusLine)
      .attr('aria-label', 'Consensus reality timeline line');

    // Animate consensus path drawing
    const pathLength = consensusPath.node()?.getTotalLength() || 0;
    consensusPath
      .attr('stroke-dasharray', pathLength)
      .attr('stroke-dashoffset', pathLength)
      .transition()
      .duration(500)
      .delay(500)
      .attr('stroke-dashoffset', 0);

    // Draw fragment branches with growth animations
    topBranches.forEach((branch, index) => {
      const fragments = data.fragments.filter(d => d.branch === branch);
      const maxUserCount = d3.max(fragments, d => d.userCount) || 1;
      const thicknessScale = d3.scaleLinear().domain([0, maxUserCount]).range([1, 10]);

      fragments.forEach(fragment => {
        const g = svg.append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        const line = g.append('line')
           .attr('x1', xScale(new Date(fragment.time)))
           .attr('y1', branchY(index))
           .attr('x2', xScale(new Date(fragment.time)))
           .attr('y2', branchY(index)) // Start at same Y for growth animation
           .attr('stroke', 'var(--highlight)')
           .attr('stroke-width', thicknessScale(fragment.userCount))
           .attr('aria-label', `Fragment branch ${index + 1} at ${new Date(fragment.time).toLocaleString()} with ${fragment.userCount} users`)
           .attr('tabindex', '0');

        // Add hover, touch, and keyboard tooltip
        const tooltip = d3.select('#tooltip');
        line.on('mouseover', function(event) {
             tooltip.classed('visible', true)
               .style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 10) + 'px')
               .text(fragment.id);
           })
           .on('mouseout', function() {
             tooltip.classed('visible', false);
           })
           .on('focus', function(event) {
             const rect = this.getBoundingClientRect();
             tooltip.classed('visible', true)
               .style('left', (rect.left + rect.width / 2) + 'px')
               .style('top', (rect.top - 10) + 'px')
               .text(fragment.id);
           })
           .on('blur', function() {
             tooltip.classed('visible', false);
           })
           .on('touchstart', function(event) {
             event.preventDefault();
             const touch = event.touches[0];
             tooltip.classed('visible', true)
               .style('left', (touch.pageX + 10) + 'px')
               .style('top', (touch.pageY - 10) + 'px')
               .text(fragment.id);
           });

        // Hide tooltip on touch outside
        d3.select('body').on('touchstart', function(event) {
          if (!event.target.closest('line')) {
            tooltip.classed('visible', false);
          }
        });

        // Animate branch growth through the reality matrix
        line.transition()
           .duration(500)
           .delay(500 + index * 200) // Staggered delay for each branch
           .attr('y2', branchY(index) + 20);
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

  // Main render with scanlines filter and glitch effect for high fragmentation
  return (
    <>
      <style>{`
        .glitch {
          animation: shake 2s;
          filter: contrast(1.2) brightness(1.1) hue-rotate(5deg);
          will-change: transform;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-1px); }
          20%, 40%, 60%, 80% { transform: translateX(1px); }
        }
        #tooltip {
          position: absolute;
          background: var(--primary-bg);
          border: 2px solid var(--accent-color);
          color: var(--text-color);
          padding: 8px;
          border-radius: 4px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s;
          font-size: 12px;
          max-width: 200px;
          word-wrap: break-word;
        }
        #tooltip.visible {
          opacity: 1;
        }
      `}</style>
      <div className={`scanlines ${fragmentation > 0.8 ? 'glitch' : ''}`} style={{ width: '100%', maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
        <div id="tooltip"></div>
        <svg
          ref={svgRef}
          width="100%"
          height="400"
          viewBox="0 0 600 400"
          role="img"
          aria-label="Animated reality fracture timeline"
        />
      </div>
    </>
  );
};

// Checkpoint: Test animations for smoothness in devvit playtest.
export default Visualization;
