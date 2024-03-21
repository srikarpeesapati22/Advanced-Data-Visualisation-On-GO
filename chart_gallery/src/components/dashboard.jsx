import React, { useState, useEffect } from 'react';
import { ResizableBox } from 'react-resizable';
import './../Dashboard.css';

import BubbleChartComponent from "./BubbleChartComponent"; // Imports BubbleChartComponent for rendering bubble chart
import HierarchicalLayoutComponent from './HierarchicalLayoutComponent'; // Imports HierarchicalLayoutComponent for rendering hierarchical layout
import ForceDirectedGraphComponent from "./ForceDirectedGraphComponent"; // Imports ForceDirectedGraphComponent for rendering force directed graph
import ChordDiagramComponent from "./ChordDiagramComponent"; // Imports ChordDiagramComponent for rendering chord diagram
import StreamGraphComponent from "./StreamGraphComponent"; // Imports StreamGraphComponent for rendering stream graph
import DoughnutChartComponent from "./DoughnutChartComponent"; // Imports DoughnutChartComponent for rendering doughnut chart
import HeatMapComponent from "./HeatmapComponent"; // Imports HeatMapComponent for rendering heat map
import BarChartComponent from "./BarChartComponent"; // Imports BarChartComponent for rendering bar chart
import LineChartComponent from "./LineChartComponent"; // Imports LineChartComponent for rendering line chart

function Dashboard() {
    const [graphSize, setGraphSize] = useState({ width: 700, height: 800 });

    // Handles resize event
    const handleResize = (event, { size }) => {
        setGraphSize({ width: size.width, height: size.height });
    };

    useEffect(() => {
        // Handles window resize event
        const handleResize = () => {
            setGraphSize({ width: window.innerWidth / 3 - 100, height: window.innerHeight / 3 });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="dashboard">
            {/* Renders HierarchicalLayoutComponent within a resizable box */}
            <div className="graph_with_title">
                <p>IFRC Appeals Arranged by Region, Country, and Appeal Type</p>
                <ResizableBox className="graph-container" width={graphSize.width} height={graphSize.height} onResize={handleResize}>
                    <HierarchicalLayoutComponent dimensions={graphSize}></HierarchicalLayoutComponent>
                </ResizableBox>
            </div>
            {/* Renders ForceDirectedGraphComponent within a resizable box */}
            <div className="graph_with_title">
                <p>Donor Organizations and Individuals Associated with IFRC</p>
                <ResizableBox className="graph-container" width={graphSize.width} height={graphSize.height} onResize={handleResize}>
                    <ForceDirectedGraphComponent dimensions={graphSize}></ForceDirectedGraphComponent>
                </ResizableBox>
            </div>
            {/* Renders ChordDiagramComponent within a resizable box */}
            <div className="graph_with_title">
                <p>Resource Allocation From and To Sectors</p>
                <ResizableBox className="graph-container" width={graphSize.width} height={graphSize.height} onResize={handleResize}>
                    <ChordDiagramComponent dimensions={graphSize}></ChordDiagramComponent>
                </ResizableBox>
            </div>
            {/* Renders StreamGraphComponent within a resizable box */}
            <div className="graph_with_title">
                <p>Resources Spent on Health, Disaster Management, and Education by Date</p>
                <ResizableBox className="graph-container" width={graphSize.width} height={graphSize.height} onResize={handleResize}>
                    <StreamGraphComponent dimensions={graphSize}></StreamGraphComponent>
                </ResizableBox>
            </div>
            {/* Renders DoughnutChartComponent within a resizable box */}
            <div className="graph_with_title">
                <p>Analysis of Humanitarian Appeal Types in IFRC: Types and Frequency of Disasters</p>
                <ResizableBox className="graph-container" width={graphSize.width} height={graphSize.height} onResize={handleResize}>
                    <DoughnutChartComponent dimensions={graphSize}></DoughnutChartComponent>
                </ResizableBox>
            </div>
            {/* Renders HeatMapComponent within a resizable box */}
            <div className="graph_with_title">
                <p>Heat Map Showing Amount Funded By Country</p>
                <ResizableBox className="graph-container" width={graphSize.width} height={graphSize.height} onResize={handleResize}>
                    <HeatMapComponent dimensions={graphSize}></HeatMapComponent>
                </ResizableBox>
            </div>
            {/* Renders BarChartComponent within a resizable box */}
            <div className="graph_with_title">
                <p>Amount Funded for Countries By Region Based on IFRC Appeal Data</p>
                <ResizableBox className="graph-container" width={graphSize.width} height={graphSize.height} onResize={handleResize}>
                    <BarChartComponent dimensions={graphSize}></BarChartComponent>
                </ResizableBox>
            </div>
            {/* Renders LineChartComponent within a resizable box */}
            <div className="graph_with_title">
                <p>Amount Funded by the IFRC to Each Region Over Time</p>
                <ResizableBox className="graph-container" width={graphSize.width} height={graphSize.height} onResize={handleResize}>
                    <LineChartComponent dimensions={graphSize}></LineChartComponent>
                </ResizableBox>
            </div>
            {/* Renders BubbleChartComponent within a resizable box */}
            <div className="graph_with_title">
                <p>Comparison between Amount Requested by Number of Beneficiaries in IFRC Appeal Data</p>
                <ResizableBox className="graph-container" width={graphSize.width} height={graphSize.height} onResize={handleResize}>
                    <BubbleChartComponent dimensions={graphSize}></BubbleChartComponent>
                </ResizableBox>
            </div>
        </div>
    );
}

export default Dashboard;
