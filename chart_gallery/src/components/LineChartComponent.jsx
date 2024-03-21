import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { zoom } from 'd3-zoom';

const LineChartComponent = ({ dimensions }) => {
    const [lineChartData, setLineChartData] = useState(null);
    const svgRef = useRef(null);
    const gRef = useRef(null);

    useEffect(() => {
        // Fetch data from the API
        fetch('https://goadmin.ifrc.org/api/v2/appeal/')
            .then(response => response.json())
            .then(data => {
                // Prepare data for each region
                const regionsData = {};

                data.results.forEach(result => {
                    const regionName = result.region.region_name;
                    const startDate = new Date(result.start_date); // Parse the date string
                    const formattedDate = `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear()}`; // Format date as mm/dd/yyyy
                    const amountFunded = result.amount_funded;

                    if (!regionsData[regionName]) {
                        regionsData[regionName] = [];
                    }

                    regionsData[regionName].push({ date: formattedDate, amountFunded });
                });

                // Set lineChartData with prepared data
                setLineChartData(regionsData);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    useEffect(() => {
        if (!dimensions.width || !dimensions.height || !lineChartData) return;

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

        g.attr("transform", `translate(${margin.left * 3},${margin.top}) scale(${0.7})`);


        const x = d3.scaleBand()
            .range([0, svgWidth])
            .padding(0.1);

        const y = d3.scaleLinear()
            .range([svgHeight, 0]);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const xAxis = d3.axisBottom(x).tickFormat(d => d); // Use tickFormat to display date as provided
        const yAxis = d3.axisLeft(y).ticks(5);

        const regions = Object.keys(lineChartData);

        const dates = Object.keys(lineChartData[regions[0]]).map(date => date); // Extract all dates

        x.domain(dates); // Set x-axis domain with all dates
        y.domain([0, d3.max(regions, region => d3.max(lineChartData[region], d => d.amountFunded))]);

        g.append("g")
            .attr("transform", `translate(0,${svgHeight})`)
            .call(xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

        g.append("g")
            .call(yAxis)
            .append("text")
            .attr("x", -150)
            .attr("y", 10)
            .attr("dy", "0.71em")
            .attr("fill", "#000")
            .attr("text-anchor", "start")
            .style("font-size", "20px")
            .text("Amount Funded");


        regions.forEach((region, index) => {
            const line = d3.line()
                .x((_, index) => x(dates[index]))
                .y(d => y(d.amountFunded));

            g.append("path")
                .datum(lineChartData[region])
                .attr("fill", "none")
                .attr("stroke", color(region))
                .attr("stroke-width", 2)
                .attr("d", line);

            g.append("text")
                .attr("class", "region-label")
                .attr("x", svgWidth - 150)
                .attr("y", index * 20 + 30)
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .style("font-size", "20px")
                .style("fill", color(region))
                .text(region);
        });

        const zoomHandler = zoom()
            .scaleExtent([0.5, 10])
            .on("zoom", function(event) {
                g.attr("transform", event.transform);
            });

        svg.call(zoomHandler);

    }, [dimensions, lineChartData]);

    return <svg ref={svgRef}><g ref={gRef}></g></svg>;
}

export default LineChartComponent;
