import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { chord, ribbon } from 'd3-chord';
import { zoom } from 'd3-zoom';

const ChordDiagramComponent = ({ dimensions }) => {
    // Data matrix representing the flow between sectors
    const matrix = [
        [0, 50, 20, 30],   // Resources allocated from Sector 1 to Sector 1, 2, 3, 4
        [40, 0, 10, 25],   // Resources allocated from Sector 2 to Sector 1, 2, 3, 4
        [15, 30, 0, 20],   // Resources allocated from Sector 3 to Sector 1, 2, 3, 4
        [25, 20, 35, 0]    // Resources allocated from Sector 4 to Sector 1, 2, 3, 4
    ];

    // References for SVG, groups, and tooltip
    const svgRef = useRef(null);
    const gRef = useRef(null);
    const tooltipRef = useRef(null);

    useEffect(() => {
        if (!dimensions.width || !dimensions.height) return;

        const width = dimensions.width;
        const height = dimensions.height;
        const innerRadius = Math.min(width, height) * 0.5 - 40;
        const outerRadius = innerRadius + 10;

        // Define arc generator for sectors
        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        // Define ribbon generator for chord connections
        const ribbonGenerator = ribbon()
            .radius(innerRadius);

        // Create chord layout
        const chordLayout = chord()
            .padAngle(0.05)
            .sortSubgroups(d3.descending)
            .sortChords(d3.descending);

        // Generate chords based on matrix data
        const chords = chordLayout(matrix).groups;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        let g = d3.select(gRef.current);
        if (g.empty()) {
            g = svg.append('g');
        } else {
            g.selectAll('*').remove();
        }

        // Position the chord diagram in the center
        g.attr('transform', `translate(${width / 2},${height / 2})`);

        // Render arcs for each sector
        const group = g.append('g')
            .selectAll('g')
            .data(chords)
            .join('g');

        group.append('path')
            .attr('fill', (d, i) => d3.schemeCategory10[i])
            .attr('stroke', (d, i) => d3.schemeCategory10[i])
            .attr('d', arc);

        // Render sector labels
        group.append('text')
            .each(d => (d.angle = (d.startAngle + d.endAngle) / 2))
            .attr('dy', '.35em')
            .attr('transform', d => `
                rotate(${(d.angle * 180 / Math.PI - 90)})
                translate(${innerRadius + 26})
                ${d.angle > Math.PI ? 'rotate(180)' : ''}
            `)
            .attr('text-anchor', d => d.angle > Math.PI ? 'end' : null)
            .text((d, i) => `Sector ${i + 1}`);

        // Render ribbons connecting sectors and add labels
        const ribbons = g.append('g')
            .attr('fill-opacity', 0.67)
            .selectAll('path')
            .data(chordLayout(matrix).flat())
            .join('path')
            .attr('d', ribbonGenerator)
            .attr('fill', d => d3.schemeCategory10[d.source.index])
            .attr('stroke', d => d3.schemeCategory10[d.source.index])
            .on('mouseover', (event, d) => {
                const tooltip = d3.select(tooltipRef.current);
                tooltip.style('visibility', 'visible')
                    .html(`From Sector ${d.source.index + 1} to Sector ${d.target.index + 1}: ${matrix[d.source.index][d.target.index]}`);
            })
            .on('mousemove', event => {
                const tooltip = d3.select(tooltipRef.current);
                tooltip.style('top', event.pageY - 10 + 'px')
                    .style('left', event.pageX + 10 + 'px');
            })
            .on('mouseout', () => {
                const tooltip = d3.select(tooltipRef.current);
                tooltip.style('visibility', 'hidden');
            });

        // Add labels to the chords
        ribbons.append('title')
            .text(d => `From Sector ${d.source.index + 1} to Sector ${d.target.index + 1}: ${matrix[d.source.index][d.target.index]}`);

        // Define zoom behavior
        const zoomHandler = zoom()
            .scaleExtent([0.5, 10])
            .on('zoom', function(event) {
                g.attr('transform', event.transform);
            });

        // Apply zoom behavior to SVG
        svg.call(zoomHandler);

    }, [dimensions, matrix]);

    // Return SVG element for rendering the chord diagram
    return (
        <svg ref={svgRef}>
            <g ref={gRef}></g>
            <div ref={tooltipRef} style={{ position: 'absolute', visibility: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '0.5rem', borderRadius: '0.25rem', boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)', zIndex: '999' }}></div>
        </svg>
    );
}

export default ChordDiagramComponent;
