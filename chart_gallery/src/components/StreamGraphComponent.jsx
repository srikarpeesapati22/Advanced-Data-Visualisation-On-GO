import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { zoom } from 'd3-zoom';
// Look at BubbleChartComponent to see how to fetch data from the API
const StreamGraphComponent = ({ dimensions }) => {
    const streamData = [
        { date: '2023-01-01', Health: 100, DisasterManagement: 50, Education: 30 },
        { date: '2023-02-01', Health: 120, DisasterManagement: 60, Education: 40 },
        { date: '2023-03-01', Health: 150, DisasterManagement: 70, Education: 50 },
        { date: '2023-04-01', Health: 200, DisasterManagement: 80, Education: 60 },
        { date: '2023-05-01', Health: 180, DisasterManagement: 90, Education: 70 },
        { date: '2023-06-01', Health: 160, DisasterManagement: 100, Education: 80 },
        { date: '2023-07-01', Health: 140, DisasterManagement: 110, Education: 90 }
    ];

    const svgRef = useRef(null);
    const gRef = useRef(null);
    const tooltipRef = useRef(null);

    useEffect(() => {
        if (!dimensions.width || !dimensions.height) return;

        const margin = { top: 70, right: 50, bottom: 100, left: 70 }; // Adjust margins
        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr('width', dimensions.width)
            .attr('height', dimensions.height);

        let g = d3.select(gRef.current);
        if (g.empty()) {
            g = svg.append('g')
        } else {
            g.selectAll('*').remove();
        }

        g.attr('transform', `translate(${margin.left * 2},${margin.top * 2}) scale(${0.5})`);


        const x = d3.scaleTime()
            .domain(d3.extent(streamData, d => new Date(d.date)))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(streamData, d => d.Health + d.DisasterManagement + d.Education)])
            .range([height, 0]);

        const stack = d3.stack().keys(['Health', 'DisasterManagement', 'Education']);
        const area = d3.area()
            .x(d => x(new Date(d.data.date)))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))
            .curve(d3.curveCardinal);

        const stackedData = stack(streamData);

        g.selectAll('.stream-path')
            .data(stackedData)
            .enter().append('path')
            .attr('class', 'stream-path')
            .attr('fill', (d, i) => ['#FFC300', '#FF5733', '#C70039'][i])
            .attr('d', area)
            .on('mouseover', (event, d) => {
                // Show tooltip on hover
                const total = d[d.length - 1][1] - d[d.length - 1][0];
                tooltipRef.current = g.append('text')
                    .attr('x', event.offsetX)
                    .attr('y', event.offsetY - 30)
                    .attr('text-anchor', 'middle')
                    .text(`Total: ${total}`)
                    .style("font-size", '20px')
                    .style("font-weight", 'bold')
                    .attr('fill', '#333');
            })
            .on('mouseout', () => {
                // Remove tooltip on mouseout
                if (tooltipRef.current) {
                    tooltipRef.current.remove();
                }
            });

        const labelPositions = [
            { text: 'Health', color: '#FFC300', yPos: height + margin.top + 20 },
            { text: 'Disaster Management', color: '#FF5733', yPos: height + margin.top + 40 },
            { text: 'Education', color: '#C70039', yPos: height + margin.top + 60 }
        ];

        labelPositions.forEach((label, index) => {
            g.append('text')
                .attr('x', width + margin.left + 10)
                .attr('y', label.yPos - width/2)
                .attr('fill', label.color)
                .style("font-size", '23px')
                .text(label.text);
        });

        const xAxis = d3.axisBottom(x)
            .tickSize(6)
            .tickPadding(8)
            .tickFormat(d3.timeFormat('%b %Y')) // Change the format for better readability
            .tickSizeOuter(0)
            .ticks(Math.min(streamData.length, 10)); // Limiting the number of ticks for smaller screens

        const yAxis = d3.axisLeft(y)
            .tickSize(6)
            .tickPadding(8)
            .tickSizeOuter(0);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .selectAll('text')
            .attr('font-size', '14px')
            .style('text-anchor', 'end')
            .attr('transform', 'rotate(-45)');

        g.append('g')
            .call(yAxis)
            .selectAll('text')
            .attr('font-size', '14px');

        g.selectAll('.tick line')
            .attr('stroke-width', 2);

        // Add X Axis Label
        g.append('text')
            .attr('class', 'x-axis-label')
            .attr('x', margin.left - width / 2 - 100)
            .attr('y', dimensions.height - margin.bottom / 3)
            .style('text-anchor', 'middle')
            .text('Date')
            .attr('font-family', 'sans-serif')
            .attr('font-size', '18px')
            .attr('font-weight', 'bold');

        g.append('text')
            .attr('class', 'y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', 0 - (height / 2))
            .attr('y', 0 - margin.left / 2 - 50)
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .text('Resources Spent')
            .attr('font-family', 'sans-serif')
            .attr('font-size', '18px')
            .attr('font-weight', 'bold');

        // Zooming
        const zoomHandler = zoom()
            .scaleExtent([0.5, 10])
            .on('zoom', function(event) {
                g.attr('transform', event.transform);
                svg.select('.x-axis-label')
                    .attr('x', margin.left + width / 2)
                    .attr('y', dimensions.height - margin.bottom / 3);
            });

        svg.call(zoomHandler);

    }, [dimensions, streamData]);

    return <svg ref={svgRef}><g ref={gRef}></g></svg>;
}

export default StreamGraphComponent;
