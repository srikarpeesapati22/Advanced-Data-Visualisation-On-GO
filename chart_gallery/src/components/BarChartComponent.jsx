// React component for rendering a bar chart
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3'; // Import D3 library
import { zoom } from 'd3-zoom'; // Import zoom functionality from D3

// Define BarChartComponent functional component
const BarChartComponent = ({ dimensions }) => {
    // State variables for bar chart data and SVG reference
    const [barChartData, setBarChartData] = useState(null);
    const svgRef = useRef(null);
    const gRef = useRef(null);

    // Fetch data from API and process it on component mount
    useEffect(() => {
        fetch('https://goadmin.ifrc.org/api/v2/appeal/')
            .then(response => response.json())
            .then(data => {
                // Group data by region and sector, and calculate total amount funded
                const groupedData = data.results.reduce((acc, curr) => {
                    const regionName = curr.region.region_name;
                    const sector = curr.sector;
                    const amountFunded = curr.amount_funded;

                    if (!acc[regionName]) {
                        acc[regionName] = {};
                    }

                    if (!acc[regionName][sector]) {
                        acc[regionName][sector] = 0;
                    }

                    acc[regionName][sector] += amountFunded;

                    return acc;
                }, {});

                // Convert grouped data into format suitable for bar chart
                const barChartData = Object.entries(groupedData).map(([region, sectors]) => ({
                    region: region,
                    sectors: Object.entries(sectors).map(([sector, amount]) => ({
                        sector: sector,
                        amount: amount
                    }))
                }));

                // Set bar chart data
                setBarChartData(barChartData);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    // Render and update bar chart on dimension change or data update
    useEffect(() => {
        if (!dimensions.width || !dimensions.height || !barChartData) return;

        // Define margins and dimensions for SVG and inner group element
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const svgWidth = dimensions.width - margin.left - margin.right;
        const svgHeight = dimensions.height - margin.top - margin.bottom;

        // Select SVG element and set its width and height
        const svg = d3.select(svgRef.current)
            .attr("width", dimensions.width) // Possible options: Any numeric value
            .attr("height", dimensions.height); // Possible options: Any numeric value

        // Select or append group element for rendering chart
        let g = d3.select(gRef.current);
        if (g.empty()) {
            g = svg.append("g")
        } else {
            g.selectAll("*").remove();
        }

        g.attr("transform", `translate(${margin.left * 3},${margin.top * 4}) scale(${0.6})`); // Possible options: Translation values


        // Define x and y scales
        const x = d3.scaleBand()
            .domain(barChartData.map(d => d.region))
            .range([0, svgWidth])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(barChartData, d => d3.max(d.sectors, s => s.amount))])
            .nice()
            .range([svgHeight, 0]);

        // Define color scale
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // Render bars
        g.selectAll("g")
            .data(barChartData)
            .join("g")
            .attr("transform", d => `translate(${x(d.region)},0)`)
            .selectAll("rect")
            .data(d => d.sectors)
            .join("rect")
            .attr("x", d => x.bandwidth() / 2 - 10)
            .attr("y", d => y(d.amount))
            .attr("height", d => svgHeight - y(d.amount))
            .attr("width", 50)
            .attr("fill", d => color(d.sector))
            .on("mouseover", function (event, d) {
                d3.select(this).attr('fill', 'orange');
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9); // Possible options: Any value between 0 and 1
                tooltip.html(`${d.amount}`)
                    .style("left", (event.pageX + 10) + "px") // Possible options: Any numeric value + "px"
                    .style("top", (event.pageY - 28) + "px"); // Possible options: Any numeric value + "px"
            })
            .on("mouseout", function (d) {
                d3.select(this).attr('fill', d => color(d.sector));
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0); // Possible options: Any value between 0 and 1
            });

        // Render x-axis
        g.append("g")
            .attr("transform", `translate(0,${svgHeight})`)
            .call(d3.axisBottom(x).tickSize(6))
            .selectAll("text")
            .attr("y", 0) // Possible options: Any numeric value
            .attr("x", 9) // Possible options: Any numeric value
            .attr("dy", ".35em") // Possible options: Any string value
            .attr("transform", "rotate(90)") // Possible options: Rotation angle
            .style("text-anchor", "start") // Possible options: "start", "middle", "end"
            .style("font-size", "14px"); // Possible options: Any valid CSS font size

        // Render y-axis and label
        g.append("g")
            .call(d3.axisLeft(y).ticks(null, "s").tickSize(6))
            .append("text")
            .attr("x", -120) // Possible options: Any numeric value
            .attr("y", 10) // Possible options: Any numeric value
            .attr("dy", "0.71em") // Possible options: Any string value
            .attr("fill", "#000") // Possible options: Any valid CSS color value
            .attr("text-anchor", "start") // Possible options: "start", "middle", "end"
            .style("font-size", "14px") // Possible options: Any valid CSS font size
            .text("Amount Funded");

        // Create tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0); // Possible options: Any value between 0 and 1

        // Define zoom handler
        const zoomHandler = zoom()
            .scaleExtent([0.5, 10])
            .on("zoom", function(event) {
                g.attr("transform", event.transform);
            });

        // Apply zoom behavior to SVG
        svg.call(zoomHandler);

    }, [dimensions, barChartData]); // Dependencies for useEffect hook

    // Return SVG element for rendering the bar chart
    return <svg ref={svgRef}><g ref={gRef}></g></svg>;
}

// Export BarChartComponent
export default BarChartComponent;
