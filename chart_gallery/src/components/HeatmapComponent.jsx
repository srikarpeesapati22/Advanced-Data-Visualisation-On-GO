import React, { useEffect, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import HeatmapRenderer from '@arcgis/core/renderers/HeatmapRenderer';

const HeatmapComponent = ({ dimensions }) => {
    const mapRef = useRef(null);
    const [apiData, setApiData] = useState(null); // State to store fetched API data

    useEffect(() => {
        if (!dimensions.width || !dimensions.height) return;

        const fetchData = async () => {
            try {
                // Fetch data from the first API (appeal)
                const appealResponse = await fetch("https://goadmin.ifrc.org/api/v2/appeal/");
                const appealData = await appealResponse.json();

                // Fetch data from the second API (country)
                const countryResponse = await fetch("https://goadmin.ifrc.org/api/v2/country/");
                const countryData = await countryResponse.json();

                // Parse the relevant information
                const amountRequestedData = {};
                for (const result of appealData.results) {
                    const countryIso = result.country.iso;
                    const amountRequested = result.amount_requested;
                    amountRequestedData[countryIso] = amountRequested;
                }

                const countryCoordinates = {};
                for (const result of countryData.results) {
                    const countryIso = result.iso;
                    const centroidCoordinates = result.centroid ? result.centroid.coordinates : null;
                    if (centroidCoordinates) {
                        countryCoordinates[countryIso] = centroidCoordinates;
                    }
                }

                setApiData({ amountRequestedData, countryCoordinates });
            } catch (error) {
                console.error("Error fetching API data:", error);
            }
        };

        fetchData();

    }, [dimensions]);

    useEffect(() => {
        if (!apiData) return;

        const { amountRequestedData, countryCoordinates } = apiData;

        const map = new Map({
            basemap: "streets"
        });

        const view = new MapView({
            container: mapRef.current,
            map: map,
            center: [0, 0],
            zoom: 2
        });

        const heatmapLayer = new GraphicsLayer();

        // Convert API data to graphics
        const graphics = Object.entries(countryCoordinates).map(([countryIso, coordinates]) => {
            const amountRequested = amountRequestedData[countryIso] || 0;
            const graphic = new Graphic({
                geometry: {
                    type: "point",
                    latitude: coordinates[1], // Latitude is the second coordinate
                    longitude: coordinates[0] // Longitude is the first coordinate
                },
                attributes: {
                    value: amountRequested
                },
                symbol: {
                    type: "simple-marker",
                    color: "blue",
                    size: 10 // Larger point size
                }
            });

            // Add label next to the point
            const labelGraphic = new Graphic({
                geometry: {
                    type: "point",
                    latitude: coordinates[1], // Latitude is the second coordinate
                    longitude: coordinates[0] // Longitude is the first coordinate
                },
                symbol: {
                    type: "text",
                    color: "black",
                    haloColor: "white",
                    haloSize: "1px",
                    text: `${amountRequested}`,
                    font: {
                        size: 12,
                        weight: "bold",
                        family: "Arial"
                    }
                }
            });

            // Add label graphic to the view
            view.graphics.add(labelGraphic);

            return graphic;
        });

        heatmapLayer.addMany(graphics);

        // Create a heatmap renderer with default color stops
        const heatmapRenderer = new HeatmapRenderer({
            field: "value", // Field to use for rendering the heatmap
            blurRadius: 10, // Blur radius for the heatmap
        });

        // Apply heatmap renderer to the heatmap layer
        heatmapLayer.renderer = heatmapRenderer;

        map.add(heatmapLayer);

        return () => {
            view.destroy();
        };

    }, [apiData]);

    return <div ref={mapRef} style={{ width: dimensions.width, height: dimensions.height }}></div>; // Container for the ArcGIS MapView
}

export default HeatmapComponent;
