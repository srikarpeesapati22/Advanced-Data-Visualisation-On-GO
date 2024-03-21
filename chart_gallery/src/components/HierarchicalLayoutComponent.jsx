import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { zoom } from 'd3-zoom';

const HierarchicalLayoutComponent = ({ dimensions }) => {
    const [hierarchicalData, setHierarchicalData] = useState(null); // State to store fetched hierarchical data
    const svgRef = useRef(null);
    const gRef = useRef(null);

    useEffect(() => {
        // Fetch data from the API
        fetch('https://goadmin.ifrc.org/api/v2/appeal/')
            .then(response => response.json())
            .then(data => {
                // Group data by region and country
                const groupedData = data.results.reduce((acc, curr) => {
                    const regionName = curr.region.region_name;
                    const countryName = curr.country.name;

                    if (!acc[regionName]) {
                        acc[regionName] = {};
                    }

                    if (!acc[regionName][countryName]) {
                        acc[regionName][countryName] = [];
                    }

                    acc[regionName][countryName].push({
                        name: curr.name,
                        sector: curr.sector,
                        region: regionName
                    });

                    return acc;
                }, {});

                const hierarchicalData = {
                    children: Object.entries(groupedData).map(([region, countries]) => ({
                        name: region,
                        children: Object.entries(countries).map(([country, projects]) => ({
                            name: country,
                            children: projects.map(project => ({
                                name: project.name,
                                sector: project.sector,
                                region: project.region
                            }))
                        }))
                    }))
                };

                setHierarchicalData(hierarchicalData);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    useEffect(() => {
        if (!dimensions.width || !dimensions.height || !hierarchicalData) return;

        const root = d3.hierarchy(hierarchicalData)
            .sum(function(d) { return d.children ? d.children.length : 0; });

        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const svgWidth = dimensions.width - margin.left - margin.right;
        const svgHeight = dimensions.height - margin.top - margin.bottom;

        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2))
            .force("collide", d3.forceCollide().radius(20)); // Adjust collision radius as needed

        const svg = d3.select(svgRef.current)
            .attr("width", dimensions.width)
            .attr("height", dimensions.height);

        let g = d3.select(gRef.current);
        if (g.empty()) {
            g = svg.append("g")
        } else {
            g.selectAll("*").remove();
        }

        g.attr("transform", `translate(${margin.left},${margin.top}) scale(${0.5})`);


        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const link = g.selectAll('.link')
            .data(root.links())
            .enter().append('path')
            .attr('class', 'link')
            .style('stroke', 'blue')
            .style('stroke-width', '2px')
            .style('fill', 'none')
            .style('opacity', 0.5)
            .attr('d', function(d) {
                return `M${d.source.y},${d.source.x}C${(d.source.y + d.target.y) / 2},${d.source.x} ${(d.source.y + d.target.y) / 2},${d.target.x} ${d.target.y},${d.target.x}`;
            });

        const node = g.selectAll('.node')
            .data(root.descendants())
            .enter().append('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        node.append('circle')
            .attr('r', 15)
            .style('fill', function(d) { return color(d.depth); })
            .style('fill-opacity', 0.8);

        node.append('text')
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .text(function(d) { return d.data.name; })
            .style('fill', 'black')
            .style('font-size', '10px');

        svg.selectAll('.title').remove();

        simulation.nodes(root.descendants())
            .on("tick", ticked);

        simulation.force("link")
            .links(root.links());

        const zoomHandler = zoom()
            .scaleExtent([0.5, 10])
            .on("zoom", function(event) {
                g.attr("transform", event.transform);
            });

        svg.call(zoomHandler);

        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        function ticked() {
            link.attr("d", function(d) {
                return `M${d.source.y},${d.source.x}C${(d.source.y + d.target.y) / 2},${d.source.x} ${(d.source.y + d.target.y) / 2},${d.target.x} ${d.target.y},${d.target.x}`;
            });

            node.attr("transform", function(d) {
                return `translate(${d.y},${d.x})`;
            });
        }
    }, [dimensions, hierarchicalData]);

    return <svg ref={svgRef}><g ref={gRef}></g></svg>;
}

export default HierarchicalLayoutComponent;
