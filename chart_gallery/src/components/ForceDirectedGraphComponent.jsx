import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { zoom } from 'd3-zoom';

const ForceDirectedGraphComponent = ({ dimensions }) => {
    const [graphData, setGraphData] = useState(null); // State to store fetched graph data

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://goadmin.ifrc.org/api/v2/donor/');
                const data = await response.json();

                // Process fetched data and create nodes and links
                const organizations = {};
                const people = {};

                data.results.forEach(result => {
                    const groupId = result.groups_details[0].name;

                    if (!organizations[groupId]) {
                        organizations[groupId] = {
                            id: groupId,
                            label: groupId,
                            category: 'group'
                        };
                    }

                    if (!people[result.id]) {
                        people[result.id] = {
                            id: result.id,
                            label: `${result.first_name} ${result.last_name}`,
                            category: 'person',
                            groupId: groupId
                        };
                    }
                });

                const nodes = [
                    { id: 'IFRC', label: 'IFRC', category: 'root' },
                    ...Object.values(organizations),
                    ...Object.values(people)
                ];

                const links = Object.keys(organizations).map(groupId => ({
                    source: 'IFRC',
                    target: groupId
                }));

                data.results.forEach(result => {
                    const groupId = result.groups_details[0].name;
                    links.push({ source: groupId, target: result.id });
                });

                setGraphData({ nodes, links });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const svgRef = useRef(null);
    const gRef = useRef(null);

    useEffect(() => {
        if (!dimensions.width || !dimensions.height || !graphData) return;

        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const svgWidth = dimensions.width - margin.left - margin.right;
        const svgHeight = dimensions.height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", dimensions.width)
            .attr("height", dimensions.height);

        let g = d3.select(gRef.current);
        if (g.empty()) {
            g = svg.append("g")
        } else {
            g.selectAll("*").remove();
        }

        g.attr("transform", `translate(${margin.left},${margin.top})`);


        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d => d.id).distance(150)) // Adjust link distance here
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(svgWidth / 2, svgHeight / 2))
            .force("collide", d3.forceCollide().radius(20));  // Adjust collision radius as needed

        // Create links
        const link = g.selectAll('.link')
            .data(graphData.links)
            .enter().append('line')
            .attr('class', 'link')
            .style('stroke', '#999')
            .style('stroke-opacity', 0.6)
            .style('stroke-width', '2px');

        // Create nodes
        const node = g.selectAll('.node')
            .data(graphData.nodes)
            .enter().append('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Style node circles
        node.append('circle')
            .attr('r', d => {
                if (d.category === 'root') return 20;
                return d.category === 'group' ? 15 : 10;
            })
            .style('fill', d => color(d.category))
            .style('opacity', 0.8);

        // Add labels to nodes
        const label = node.append('text')
            .attr('x', d => {
                if (d.category === 'root') return 25;
                return d.category === 'group' ? 20 : 12;
            })
            .attr('dy', '.35em')
            .style('font-size', '12px')
            .text(d => d.label)
            .attr('class', 'label')
            .style('display', 'none');

        simulation.nodes(graphData.nodes)
            .on("tick", () => {
                link
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);

                node
                    .attr('transform', d => `translate(${d.x},${d.y})`);

                label
                    .attr('x', d => {
                        if (d.category === 'root') return 25;
                        return d.category === 'group' ? 20 : 12;
                    })
                    .attr('y', d => '.35em')
                    .style('display', 'block');

                // Label collision detection
                label.each(function(d, i) {
                    const currentNode = d3.select(this);
                    const currentBBox = currentNode.node().getBBox();
                    label.each(function(d2, i2) {
                        if (i !== i2) {
                            const targetNode = d3.select(this);
                            const targetBBox = targetNode.node().getBBox();
                            const collision = !(currentBBox.x + currentBBox.width < targetBBox.x ||
                                targetBBox.x + targetBBox.width < currentBBox.x ||
                                currentBBox.y + currentBBox.height < targetBBox.y ||
                                targetBBox.y + targetBBox.height < currentBBox.y);
                            if (collision) {
                                const dx = currentBBox.x - targetBBox.x;
                                const dy = currentBBox.y - targetBBox.y;
                                const angle = Math.atan2(dy, dx);
                                const overlap = Math.sqrt(dx * dx + dy * dy);
                                const tx = currentBBox.x + overlap * Math.cos(angle);
                                const ty = currentBBox.y + overlap * Math.sin(angle);
                                currentNode.attr('transform', `translate(${tx},${ty})`);
                            }
                        }
                    });
                });
            });

        simulation.force("link")
            .links(graphData.links);

        // Add zoom functionality
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
    }, [dimensions, graphData]);

    return <svg ref={svgRef}><g ref={gRef}></g></svg>; // SVG container for the graph
}

export default ForceDirectedGraphComponent;
