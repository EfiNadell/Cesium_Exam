
import React, { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

window.CESIUM_BASE_URL = "/";
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmODFlZDQxYi0zNDZkLTQwYzUtOGQ1Zi00Njg3MTlmOGJjMTEiLCJpZCI6MjU3NTg0LCJpYXQiOjE3MzI0NjIyODd9.nXR7cEgCUmT7-m8pJMJEyOlwizSWl-sFvMwmHlSYi8Q";
const App = () => {
  return (
    <div className="App" style={{ display: 'flex' }}>
              <CesiumGlobe />
     <GlobemapWithArrow />
    </div>
  );
};

const CesiumGlobe = () => {
  const cesiumContainerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect( () => {
   if (!cesiumContainerRef.current) return;
    try {
          viewerRef.current = new Cesium.Viewer(cesiumContainerRef.current, {
            terrain: Cesium.Terrain.fromWorldTerrain(),
            imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 }), // Bing Maps Aerial
            shouldAnimate: true,
      });
     
        Cesium.createWorldTerrainAsync().
                  then(r=>{
                    viewerRef.current.terrainProvider=r;
        
                    console.log("Efi log - Terrain Provider:", viewerRef.current.terrainProvider);
      })
      .catch(console.log("error getting terrain"));
      
           
      console.log("active Imagery Layers:", viewerRef.current.imageryLayers);

      window.cesiumViewer = viewerRef.current;

      // initial position
      viewerRef.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(31.046051, 34.851612),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-15.0),},       
                                 });
    } 
    catch (error) {
      console.error("Error initializing Cesium viewer:", error);
    }
    
    //Cleanup function
    return () => {
      if (viewerRef.current) {
          viewerRef.current.destroy();
          window.cesiumViewer = undefined;
      }
    };
  }, []); // Empty dependency array since we only want to initialize once

  return (
    <div 
      ref={cesiumContainerRef}
      style={{ 
        width: "50%", 
        height: "100vh",
        position: "relative"
      }} 
    />
  );
};

const GlobemapWithArrow = () => {
  const [arrowPosition, setArrowPosition] = useState({ x: 0, y: 0 });
  const globemapRef = useRef(null);
  const ImageGeoBounds = { top: 90, bottom: -90, left: -180, right: 180 };

  useEffect(() => {
    const checkViewer = setInterval(() => {
      const viewer = window.cesiumViewer;
      if (viewer && globemapRef.current) {
        clearInterval(checkViewer);
        setupArrowMovement(viewer);
      }
    }, 100);

    return () => clearInterval(checkViewer);
  }, []);

  const setupArrowMovement = (viewer) => {
    const moveArrow = () => {
      if (!globemapRef.current) return;

      const rect = globemapRef.current.getBoundingClientRect();
      const cameraPosition = viewer.camera.positionCartographic;
      const latitude = Cesium.Math.toDegrees(cameraPosition.latitude);
      const longitude = Cesium.Math.toDegrees(cameraPosition.longitude);

      const xPercent = (longitude - ImageGeoBounds.left) / (ImageGeoBounds.right - ImageGeoBounds.left);
      const yPercent = (ImageGeoBounds.top - latitude) / (ImageGeoBounds.top - ImageGeoBounds.bottom);

      const x = xPercent * rect.width;
      const y = yPercent * rect.height;

      setArrowPosition({ x, y });
    };

    viewer.camera.changed.addEventListener(moveArrow);
    moveArrow();

    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.camera.changed.removeEventListener(moveArrow);
      }
    };
  };

  const handleImageClick = (e) => {
    const viewer = window.cesiumViewer;
    if (!viewer || !globemapRef.current) return;

    const rect = globemapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = clickX / rect.width;
    const yPercent = clickY / rect.height;
    const longitude = ImageGeoBounds.left + xPercent * (ImageGeoBounds.right - ImageGeoBounds.left);
    const latitude = ImageGeoBounds.top - yPercent * (ImageGeoBounds.top - ImageGeoBounds.bottom);

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 1000000),
      duration: 1.5,
    });
  };

  return (
    <div style={{ width: "50%", height: "100vh", position: "relative" }}>
      <img
        ref={globemapRef}
        src={`${process.env.PUBLIC_URL}/assets/globe.png`}
        alt="Map"
        style={{ 
          display: "block", 
          width: "100%", 
          height: "100%",
          objectFit: "contain"
        }}
        onClick={handleImageClick}
      />
     <img
  src={`${process.env.PUBLIC_URL}/assets/arrow.png`} // Arrow image
  alt="Arrow"
  style={{
    position: "absolute",
    width: "20px", // Adjust size as needed
    height: "20px", // Adjust size as needed
    left: `${arrowPosition.x}px`,
    top: `${arrowPosition.y}px`,
    transform: "translate(-50%, -50%)", // Center the image
    pointerEvents: "none", // Prevent interaction
  }}
/>
    </div>
  );
};

export default App;