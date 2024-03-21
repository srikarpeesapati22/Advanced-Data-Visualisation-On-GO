import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { zoom } from 'd3-zoom';

const DoughnutChartComponent = ({ dimensions }) => {
    const [dtypeData, setDtypeData] = useState(null); // State to store fetched data
    const svgRef = useRef(null); // Reference to SVG element
    const gRef = useRef(null); // Reference to SVG group element

    useEffect(() => {
        if (!dimensions.width || !dimensions.height || !dtypeData) return;

        const margin = { top: 20, right: 20, bottom: 20, left: 20 };
        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr('width', dimensions.width)
            .attr('height', dimensions.height)
            .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        let g = d3.select(gRef.current);
        if (g.empty()) {
            g = svg.append('g')
        } else {
            g.selectAll('*').remove(); // Clear existing elements
        }

        g.attr('transform', `translate(${width / 2},${height / 2})`);


        const radius = Math.min(width, height) / 2;

        const color = d3.scaleOrdinal(d3.schemeCategory10); // Color scale

        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);

        const data = Object.entries(dtypeData).map(([key, value]) => ({ key, value }));

        const arc = d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius * 0.8);

        const arcs = g.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        const gradient = g.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "lightblue"); // Start color of the gradient

        gradient.append("stop")
            .attr("offset", "20%")
            .attr("stop-color", "blue"); // Middle color of the gradient

        gradient.append("stop")
            .attr("offset", "80%")
            .attr("stop-color", "blue"); // Middle color of the gradient

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "lightblue"); // End color of the gradient

        arcs.append("path")
            .attr("d", arc)
            .style("fill", "url(#gradient)") // Fills with gradient
            .style("filter", "url(#dropshadow)"); // Adds drop shadow

        arcs.append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("font-size", "14px")
            .attr("fill", "white")
            .text(d => d.data.key + " (" + d.data.value + ")"); // Adds labels

        const zoomHandler = zoom()
            .scaleExtent([0.5, 10])
            .on("zoom", function (event) {
                g.attr("transform", event.transform);
            });

        svg.call(zoomHandler);

    }, [dimensions, dtypeData]);

    useEffect(() => {
        // Fetch data from the API
        fetch('https://goadmin.ifrc.org/api/v2/appeal/')
            .then(response => response.json())
            .then(data => {
                const dtypeCounts = data.results.reduce((acc, curr) => {
                    const dtypeName = curr.dtype.name;
                    acc[dtypeName] = acc[dtypeName] ? acc[dtypeName] + 1 : 1;
                    return acc;
                }, {});

                setDtypeData(dtypeCounts);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <div>
            <svg ref={svgRef}>
                <defs>
                    {/* Add filter for drop shadow effect */}
                    <filter id="dropshadow" height="130%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                        <feOffset dx="2" dy="2" result="offsetblur"/>
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.5"/>
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <g ref={gRef}></g>
            </svg>
        </div>
    );
}

export default DoughnutChartComponent;
