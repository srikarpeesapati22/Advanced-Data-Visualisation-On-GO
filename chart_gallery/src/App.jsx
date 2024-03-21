import React, { useState, useEffect } from 'react';
import './App.css';
import { ResizableBox } from 'react-resizable';
import Dashboard from './components/dashboard';

import HierarchicalLayoutComponent from './components/HierarchicalLayoutComponent';
import ForceDirectedGraphComponent from "./components/ForceDirectedGraphComponent";
import ChordDiagramComponent from "./components/ChordDiagramComponent";
import StreamGraphComponent from "./components/StreamGraphComponent";
import DoughnutChartComponent from "./components/DoughnutChartComponent";
import HeatMapComponent from "./components/HeatmapComponent";
import BarChartComponent from "./components/BarChartComponent";
import LineChartComponent from "./components/LineChartComponent";
import BubbleChartComponent from "./components/BubbleChartComponent";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>{new Date().getFullYear()} Chart Gallery made for IFRC Data Visualization</p>
            </div>
        </footer>
    );
}

function App() {
    const [svgSize, setSvgSize] = useState({ width: window.innerWidth, height: window.innerHeight});
    const [graphSize, setGraphSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [activeComponent, setActiveComponent] = useState('dashboard');

    const titles = {
        dashboard: 'Dashboard',
        hierarchical: 'IFRC Appeals Arranged by Region, Country, and Appeal Type',
        forceDirected: 'Donor Organizations and Individuals Associated with IFRC',
        chordDiagram: 'Resource Allocation From and To Sectors',
        streamGraph: 'Resources Spent on Health, Disaster Management, and Education by Date',
        doughnutChart: 'Analysis of Humanitarian Appeal Types in IFRC: Types and Frequency of Disasters',
        heatMap: 'Heat Map Showing Amount Funded By Country',
        barChart: 'Amount Funded for Countries By Region Based on IFRC Appeal Data',
        lineChart: 'Amount Funded by the IFRC to Each Region Over Time',
        bubbleChart: 'Comparison between Amount Requested by Number of Beneficiaries in IFRC Appeal Data'
    };

    const handleGraphResize = (event, { size }) => {
        setGraphSize({ width: size.width, height: size.height });
    };

    useEffect(() => {
        const handleGraphResize = () => {
            setGraphSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleGraphResize);

        return () => {
            window.removeEventListener('resize', handleGraphResize);
        };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setSvgSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const renderGraphComponent = () => {
        switch (activeComponent) {
            case 'hierarchical':
                return <HierarchicalLayoutComponent dimensions={svgSize} />;
            case 'forceDirected':
                return <ForceDirectedGraphComponent dimensions={svgSize} />;
            case 'chordDiagram':
                return <ChordDiagramComponent dimensions={svgSize} />;
            case 'streamGraph':
                return <StreamGraphComponent dimensions={svgSize} />;
            case 'doughnutChart':
                return <DoughnutChartComponent dimensions={svgSize} />;
            case 'heatMap':
                return <HeatMapComponent dimensions={svgSize} />;
            case 'barChart':
                return <BarChartComponent dimensions={svgSize} />;
            case 'lineChart':
                return <LineChartComponent dimensions={svgSize} />;
            case 'bubbleChart':
                return <BubbleChartComponent dimensions={svgSize} />;
            case 'dashboard':
                return <Dashboard />;
            default:
                return null;
        }
    };

    return (
        <div className="App">
            <div className="button-container">
                <button className={activeComponent === 'dashboard' ? 'active' : ''} onClick={() => setActiveComponent('dashboard')}>Dashboard</button>
                <button className={activeComponent === 'hierarchical' ? 'active' : ''} onClick={() => setActiveComponent('hierarchical')}>Hierarchical Layout</button>
                <button className={activeComponent === 'forceDirected' ? 'active' : ''} onClick={() => setActiveComponent('forceDirected')}>Force Directed Graph</button>
                <button className={activeComponent === 'chordDiagram' ? 'active' : ''} onClick={() => setActiveComponent('chordDiagram')}>Chord Diagram</button>
                <button className={activeComponent === 'streamGraph' ? 'active' : ''} onClick={() => setActiveComponent('streamGraph')}>Stream Graph</button>
                <button className={activeComponent === 'doughnutChart' ? 'active' : ''} onClick={() => setActiveComponent('doughnutChart')}>Doughnut Chart</button>
                <button className={activeComponent === 'heatMap' ? 'active' : ''} onClick={() => setActiveComponent('heatMap')}>Heat Map</button>
                <button className={activeComponent === 'barChart' ? 'active' : ''} onClick={() => setActiveComponent('barChart')}>Bar Chart</button>
                <button className={activeComponent === 'lineChart' ? 'active' : ''} onClick={() => setActiveComponent('lineChart')}>Line Chart</button>
                <button className={activeComponent === 'bubbleChart' ? 'active' : ''} onClick={() => setActiveComponent('bubbleChart')}>Bubble Chart</button>
            </div>
            <div className="title-space"></div>
            <div className="graph-wrapper">
                <div className="graph-title">{titles[activeComponent]}</div>
                {activeComponent === 'dashboard' ? (
                    <Dashboard />
                ) : (
                    <ResizableBox className="graph-container" width={graphSize.width - 100} height={graphSize.height - 160} onResize={handleGraphResize}>
                        {renderGraphComponent()}
                    </ResizableBox>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default App;
