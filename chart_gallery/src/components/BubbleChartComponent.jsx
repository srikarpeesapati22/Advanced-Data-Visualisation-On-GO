import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { zoom } from 'd3-zoom';

const BubbleChartComponent = ({ dimensions }) => {
    const [bubbleData, setBubbleData] = useState(null);
    const svgRef = useRef(null);
    const gRef = useRef(null);

    useEffect(() => {
        // Fetch data from the API and process it
        fetch('https://goadmin.ifrc.org/api/v2/appeal/')
            .then(response => response.json())
            .then(data => {
                // Extract relevant data for bubble chart
                const bubbleChartData = data.results.map(result => ({
                    name: result.name,
                    num_beneficiaries: result.num_beneficiaries,
                    amount_requested: result.amount_requested
                }));

                // Define thresholds for filtering data
                const numBeneficiariesThreshold = 50000;
                const amountRequestedThreshold = 5000000;

                // Filter data based on thresholds
                const filteredData = bubbleChartData.filter(d =>
                    d.num_beneficiaries < numBeneficiariesThreshold &&
                    d.amount_requested < amountRequestedThreshold
                );

                // Set filtered data for bubble chart
                setBubbleData(filteredData);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    useEffect(() => {
        if (!dimensions.width || !dimensions.height || !bubbleData) return;

        // Define margins and dimensions for the SVG and inner group element
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const svgWidth = dimensions.width - margin.left - margin.right;
        const svgHeight = dimensions.height - margin.top - margin.bottom;

        // Select SVG element and set its width and height
        const svg = d3.select(svgRef.current)
            .attr("width", dimensions.width)
            .attr("height", dimensions.height);

        // Select or append group element for rendering chart
        let g = d3.select(gRef.current);
        if (g.empty()) {
            g = svg.append("g")
        } else {
            g.selectAll("*").remove();
        }

        g.attr("transform", `translate(${margin.left * 3},${margin.top}) scale(${0.85})`);

        // Calculate maximum values for scaling
        const maxNumBeneficiaries = d3.max(bubbleData, d => d.num_beneficiaries);
        const maxAmountRequested = d3.max(bubbleData, d => d.amount_requested);

        // Define scales for radius, x-axis, and y-axis
        const radiusScale = d3.scaleLinear()
            .domain([0, maxNumBeneficiaries])
            .range([5, 20]);

        const xScale = d3.scaleLinear()
            .domain([0, maxAmountRequested])
            .range([0, svgWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, maxNumBeneficiaries])
            .range([svgHeight, 0]);

        // Define and render x-axis
        const xAxis = d3.axisBottom(xScale);
        g.append("g")
            .attr("transform", `translate(0, ${svgHeight})`)
            .call(xAxis);

        // Define and render y-axis
        const yAxis = d3.axisLeft(yScale);
        g.append("g")
            .call(yAxis);

        // Add labels for axes
        g.append("text")
            .attr("transform", `translate(${svgWidth / 2}, ${svgHeight + margin.top + 10})`)
            .style("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Amount Requested");

        g.append("text")
            .attr("transform", `rotate(-90) translate(${-svgHeight / 2}, ${-margin.left - 20})`)
            .style("text-anchor", "middle")
            .style("font-size", "20px")
            .text("Number of Beneficiaries");

        // Define color scale
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Create tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Render bubbles
        const bubbles = g.selectAll('.bubble')
            .data(bubbleData)
            .enter()
            .append('g')
            .attr('class', 'bubble')
            .attr('transform', d => `translate(${xScale(d.amount_requested)}, ${yScale(d.num_beneficiaries)})`)
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`<strong>${d.name}</strong><br>Beneficiaries: ${d.num_beneficiaries}<br>Amount Requested: ${d.amount_requested}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Render circles representing bubbles
        bubbles.append('circle')
            .attr('r', d => radiusScale(d.num_beneficiaries))
            .style('fill', (d, i) => colorScale(i))
            .style('opacity', 0.7)
            .style('cursor', 'pointer')
            .on('click', function() {
                d3.select(this).attr('stroke', 'black').attr('stroke-width', 2);
            })
            .transition().duration(1000)
            .attr('r', d => radiusScale(d.num_beneficiaries));

        // Render text labels for bubbles
        bubbles.append('text')
            .text(d => d.name)
            .attr('text-anchor', 'middle')
            .attr('dy', 4)
            .attr("font-size", "10px");

        // Define zoom behavior
        const zoomHandler = zoom()
            .scaleExtent([0.5, 10])
            .on("zoom", function(event) {
                g.attr("transform", event.transform);
            });

        // Apply zoom behavior to SVG
        svg.call(zoomHandler);

    }, [dimensions, bubbleData]); // Dependencies for useEffect hook

    // Return SVG element for rendering the bubble chart
    return <svg ref={svgRef}><g ref={gRef}></g></svg>;
}

// Export BubbleChartComponent
export default BubbleChartComponent;
