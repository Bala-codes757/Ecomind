import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Globe, MapPin, Activity, Zap, Shield, ArrowUpRight, Radio, Compass } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

// Real-world industrial facilities with coordinates and live parameters
export const GLOBAL_FACILITIES = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Apex Precision Materials',
    site: 'Plant 04 · Advanced Composites',
    location: 'Austin, Texas, USA',
    lat: 30.2672,
    lng: -97.7431,
    grid_region: 'US-ERCOT (Texas)',
    grid_carbon_intensity: 0.385,
    facility_type: 'Precision Electronics & Composites',
    square_footage: 185000,
    annual_mwh: 1710,
    solar_kwp: 128,
    status: 'ACTIVE',
    color: '#829877'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Tesla Gigafactory 1',
    site: 'Tahoe Reno · Battery & Drive Units',
    location: 'Sparks, Nevada, USA',
    lat: 39.5392,
    lng: -119.4447,
    grid_region: 'US-WECC-NWPP',
    grid_carbon_intensity: 0.258,
    facility_type: 'Battery Cell & EV Powertrains',
    square_footage: 5300000,
    annual_mwh: 48000,
    solar_kwp: 8500,
    status: 'MONITORED',
    color: '#c49a45'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Intel Fab 34 Semiconductor',
    site: 'Leixlip Campus · Intel 4 Process',
    location: 'Leixlip, Kildare, Ireland',
    lat: 53.3639,
    lng: -6.4917,
    grid_region: 'IE-EirGrid',
    grid_carbon_intensity: 0.318,
    facility_type: 'Semiconductor Wafer Cleanroom',
    square_footage: 1720000,
    annual_mwh: 34000,
    solar_kwp: 2100,
    status: 'MONITORED',
    color: '#829877'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Boeing Commercial Airplanes',
    site: 'Everett Assembly Factory',
    location: 'Everett, Washington, USA',
    lat: 47.9253,
    lng: -122.2818,
    grid_region: 'US-WECC-Hydro',
    grid_carbon_intensity: 0.114,
    facility_type: 'Aerospace High-Bay Assembly',
    square_footage: 4300000,
    annual_mwh: 52000,
    solar_kwp: 3200,
    status: 'MONITORED',
    color: '#658060'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'BASF Chemical Verbund',
    site: 'Steam Cracker & Verbund Site',
    location: 'Ludwigshafen, Germany',
    lat: 49.4958,
    lng: 8.4319,
    grid_region: 'DE-ENTSO-E',
    grid_carbon_intensity: 0.380,
    facility_type: 'Continuous Chemical & High-Pressure Steam',
    square_footage: 10700000,
    annual_mwh: 98000,
    solar_kwp: 12000,
    status: 'MONITORED',
    color: '#b08b3c'
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Siemens Digital Factory',
    site: 'Simatic Electronics Plant',
    location: 'Amberg, Bavaria, Germany',
    lat: 49.4444,
    lng: 11.8583,
    grid_region: 'DE-ENTSO-E',
    grid_carbon_intensity: 0.285,
    facility_type: 'Industry 4.0 Automated Manufacturing',
    square_footage: 108000,
    annual_mwh: 2400,
    solar_kwp: 450,
    status: 'MONITORED',
    color: '#829877'
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Apple Austin Campus',
    site: 'Americas Operations & R&D',
    location: 'Austin, Texas, USA',
    lat: 30.4021,
    lng: -97.7128,
    grid_region: 'US-ERCOT',
    grid_carbon_intensity: 0.385,
    facility_type: 'Hardware Labs & Microgrids',
    square_footage: 3000000,
    annual_mwh: 14500,
    solar_kwp: 3900,
    status: 'MONITORED',
    color: '#829877'
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    name: 'TSMC GigaFab 18',
    site: 'Southern Taiwan Science Park',
    location: 'Tainan, Taiwan',
    lat: 23.1114,
    lng: 120.2747,
    grid_region: 'TW-Taipower',
    grid_carbon_intensity: 0.509,
    facility_type: '3nm Wafer EUV Lithography',
    square_footage: 2200000,
    annual_mwh: 68000,
    solar_kwp: 4800,
    status: 'MONITORED',
    color: '#c49a45'
  }
];

// Helper: convert lat/lng to 3D Cartesian Vector on sphere of radius R
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Helper: Generate stylized high-res earth texture procedurally
function createProceduralEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Background oceans: deep industrial obsidian
  ctx.fillStyle = '#1c1b18';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle graticule grid lines
  ctx.strokeStyle = 'rgba(130, 152, 119, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw stylized continent landmass outlines with olive tones
  ctx.fillStyle = '#2b2a26';
  ctx.strokeStyle = '#3d4a38';
  ctx.lineWidth = 1.5;

  // Approximate continents
  const landmasses = [
    // North America
    [[300, 180], [450, 160], [600, 190], [620, 320], [540, 420], [420, 480], [380, 420], [320, 320], [280, 240]],
    // South America
    [[520, 480], [620, 520], [650, 650], [580, 820], [520, 880], [480, 720], [490, 560]],
    // Europe
    [[950, 220], [1100, 200], [1180, 260], [1150, 350], [1020, 380], [940, 320]],
    // Africa
    [[960, 400], [1120, 400], [1200, 520], [1150, 750], [1050, 820], [960, 680], [920, 500]],
    // Asia
    [[1180, 200], [1550, 180], [1750, 280], [1700, 450], [1550, 520], [1350, 550], [1250, 420], [1180, 300]],
    // Australia
    [[1550, 650], [1720, 660], [1750, 780], [1620, 840], [1520, 780]]
  ];

  landmasses.forEach((polygon) => {
    ctx.beginPath();
    ctx.moveTo(polygon[0][0], polygon[0][1]);
    for (let i = 1; i < polygon.length; i++) {
      ctx.lineTo(polygon[i][0], polygon[i][1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // Add micro dot matrix pattern across land
  ctx.fillStyle = 'rgba(196, 154, 69, 0.22)';
  for (let i = 0; i < 600; i++) {
    const rx = Math.random() * canvas.width;
    const ry = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.arc(rx, ry, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export default function GlobalGlobe3D({ onSelectFacility, className = '' }) {
  const containerRef = useRef(null);
  const { facility, selectFacility, notify } = useWorkspace();
  const [activeFacility, setActiveFacility] = useState(GLOBAL_FACILITIES[0]);
  const [hoveredFacility, setHoveredFacility] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [streamPulse, setStreamPulse] = useState(1);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const globeGroupRef = useRef(null);
  const nodesGroupRef = useRef(null);
  const arcsGroupRef = useRef(null);
  const particlesGroupRef = useRef(null);
  const cameraRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2(-999, -999));
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.2, y: 0 });
  const currentRotationRef = useRef({ x: 0.2, y: 0 });
  const requestAnimationRef = useRef(null);

  // Sync activeFacility when workspace context changes
  useEffect(() => {
    if (facility && facility.name) {
      const match = GLOBAL_FACILITIES.find((f) => f.name === facility.name || f.id === facility.id);
      if (match) setActiveFacility(match);
    }
  }, [facility]);

  // Periodic pulse simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setStreamPulse((p) => (p + 1) % 100);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // Window scroll rotation synchronization
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;
      setScrollProgress(progress);
      // Link scroll progression to Globe Y & X tilt
      targetRotationRef.current.y += (progress * Math.PI * 0.05);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Three.js Scene Setup & Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 180;
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Globe Container Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const GLOBE_RADIUS = 60;

    // 4. Earth Sphere Base
    const earthTexture = createProceduralEarthTexture();
    const globeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const globeMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.75,
      metalness: 0.15,
      color: 0xe8e6df,
      emissive: 0x121411,
      emissiveIntensity: 0.3
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // 5. Atmosphere Outer Ring / Glow
    const atmosGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.14, 48, 48);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(0.48, 0.58, 0.44, 0.8) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    globeGroup.add(atmosMesh);

    // 6. Coordinate Latitude / Longitude Orbit Rings
    const ringMat = new THREE.LineBasicMaterial({ color: 0x829877, transparent: true, opacity: 0.22 });
    const ringGeo = new THREE.BufferGeometry();
    const ringPoints = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(theta) * (GLOBE_RADIUS + 1.5), 0, Math.sin(theta) * (GLOBE_RADIUS + 1.5)));
    }
    ringGeo.setFromPoints(ringPoints);
    const equator = new THREE.Line(ringGeo, ringMat);
    globeGroup.add(equator);

    const orbitRing1 = new THREE.Line(ringGeo, new THREE.LineBasicMaterial({ color: 0xc49a45, transparent: true, opacity: 0.25 }));
    orbitRing1.rotation.x = Math.PI / 4;
    orbitRing1.rotation.y = Math.PI / 6;
    globeGroup.add(orbitRing1);

    // 7. Facility Markers Group
    const nodesGroup = new THREE.Group();
    globeGroup.add(nodesGroup);
    nodesGroupRef.current = nodesGroup;

    const nodeObjects = [];
    GLOBAL_FACILITIES.forEach((fac) => {
      const pos = latLngToVector3(fac.lat, fac.lng, GLOBE_RADIUS + 0.8);

      // Outer Pulsing Halo
      const haloGeo = new THREE.RingGeometry(1.2, 2.2, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(fac.color || '#829877'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(pos);
      halo.lookAt(new THREE.Vector3(0, 0, 0));
      nodesGroup.add(halo);

      // Core Marker Sphere
      const pinGeo = new THREE.SphereGeometry(1.4, 16, 16);
      const pinMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(fac.color || '#829877'),
        emissive: new THREE.Color(fac.color || '#829877'),
        emissiveIntensity: 0.9,
        roughness: 0.2
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.copy(pos.clone().multiplyScalar(1.015));
      pin.userData = { facility: fac, halo };
      nodesGroup.add(pin);
      nodeObjects.push(pin);

      // Stem Line
      const stemGeo = new THREE.BufferGeometry().setFromPoints([pos, pos.clone().multiplyScalar(1.08)]);
      const stem = new THREE.Line(stemGeo, new THREE.LineBasicMaterial({ color: 0xc49a45, transparent: true, opacity: 0.8 }));
      nodesGroup.add(stem);
    });

    // 8. Supply Chain Carbon Flow Arcs
    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);
    arcsGroupRef.current = arcsGroup;

    const arcPairs = [
      [GLOBAL_FACILITIES[0], GLOBAL_FACILITIES[1]], // Austin -> Sparks NV
      [GLOBAL_FACILITIES[0], GLOBAL_FACILITIES[2]], // Austin -> Leixlip IE
      [GLOBAL_FACILITIES[2], GLOBAL_FACILITIES[5]], // Ireland -> Amberg DE
      [GLOBAL_FACILITIES[4], GLOBAL_FACILITIES[5]], // Ludwigshafen -> Amberg
      [GLOBAL_FACILITIES[0], GLOBAL_FACILITIES[3]], // Austin -> Boeing WA
      [GLOBAL_FACILITIES[1], GLOBAL_FACILITIES[7]], // Sparks NV -> TSMC Taiwan
    ];

    const arcCurves = [];
    arcPairs.forEach(([f1, f2]) => {
      const v1 = latLngToVector3(f1.lat, f1.lng, GLOBE_RADIUS + 0.8);
      const v2 = latLngToVector3(f2.lat, f2.lng, GLOBE_RADIUS + 0.8);
      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      const distance = v1.distanceTo(v2);
      mid.normalize().multiplyScalar(GLOBE_RADIUS + distance * 0.28);

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      arcCurves.push(curve);

      const points = curve.getPoints(40);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0xc49a45,
        transparent: true,
        opacity: 0.35,
        linewidth: 1.5
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcsGroup.add(arcLine);
    });

    // 9. Floating Telemetry Particles on Arcs
    const particlesGroup = new THREE.Group();
    globeGroup.add(particlesGroup);
    particlesGroupRef.current = particlesGroup;

    const particleMeshes = arcCurves.map((curve) => {
      const pGeo = new THREE.SphereGeometry(0.7, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ color: 0xfaeed6 });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      particlesGroup.add(pMesh);
      return { mesh: pMesh, curve, progress: Math.random() };
    });

    // 10. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfffaed, 1.6);
    dirLight1.position.set(120, 80, 140);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x829877, 0.8);
    dirLight2.position.set(-100, -50, -100);
    scene.add(dirLight2);

    // 11. Mouse Drag & Raycast Interaction
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      const y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;
      mouseRef.current.set(x, y);

      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;
        targetRotationRef.current.y += deltaX * 0.007;
        targetRotationRef.current.x = Math.max(-0.8, Math.min(0.8, targetRotationRef.current.x + deltaY * 0.007));
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      }

      // Check hover
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(nodeObjects);
      if (intersects.length > 0) {
        const hovered = intersects[0].object.userData.facility;
        setHoveredFacility(hovered);
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        container.style.cursor = 'pointer';
      } else {
        setHoveredFacility(null);
        container.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      container.style.cursor = 'grab';
    };

    const handleClick = () => {
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(nodeObjects);
      if (intersects.length > 0) {
        const selected = intersects[0].object.userData.facility;
        setActiveFacility(selected);
        selectFacility(selected);
        if (onSelectFacility) onSelectFacility(selected);
        notify(`Selected: ${selected.name} (${selected.location})`);
      }
    };

    // Touch support
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e) => {
      if (isDraggingRef.current && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
        const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;
        targetRotationRef.current.y += deltaX * 0.008;
        targetRotationRef.current.x = Math.max(-0.8, Math.min(0.8, targetRotationRef.current.x + deltaY * 0.008));
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('click', handleClick);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // 12. Animation Loop with Smooth Interpolation & Scroll Coupling
    let clock = new THREE.Clock();
    const animate = () => {
      requestAnimationRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous slow rotation if not dragging
      if (!isDraggingRef.current) {
        targetRotationRef.current.y += 0.0016;
      }

      // Smooth Lerp Damping
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.07;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.07;

      globeGroup.rotation.x = currentRotationRef.current.x;
      globeGroup.rotation.y = currentRotationRef.current.y;

      // Animate pulsing halos
      nodeObjects.forEach((pin) => {
        if (pin.userData.halo) {
          const s = 1 + Math.sin(elapsedTime * 3 + pin.position.x) * 0.22;
          pin.userData.halo.scale.set(s, s, s);
        }
      });

      // Animate flying data particles along arcs
      particleMeshes.forEach((p) => {
        p.progress = (p.progress + 0.004) % 1.0;
        const pt = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pt);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 13. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length) return;
      const { width: newW, height: newH } = entries[0].contentRect;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (requestAnimationRef.current) cancelAnimationFrame(requestAnimationRef.current);
      resizeObserver.disconnect();
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('click', handleClick);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectFacility, notify, onSelectFacility]);

  // Jump globe camera rotation to a specific facility
  const handleJumpToFacility = useCallback((fac) => {
    setActiveFacility(fac);
    selectFacility(fac);
    if (onSelectFacility) onSelectFacility(fac);

    // Compute target Y rotation to bring facility to the front
    const phi = (90 - fac.lat) * (Math.PI / 180);
    const theta = (fac.lng + 180) * (Math.PI / 180);
    targetRotationRef.current.y = -theta + Math.PI / 2;
    targetRotationRef.current.x = (fac.lat / 90) * 0.4;
  }, [selectFacility, onSelectFacility]);

  return (
    <div className={`globe-container surface ${className}`} style={{ position: 'relative', overflow: 'hidden', padding: '1.25rem' }}>
      {/* Globe Header HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-olive" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Radio size={12} className="animate-pulse" style={{ color: '#829877' }} />
              Live Multi-Site Telemetry
            </span>
            <span className="text-muted" style={{ fontSize: '0.78rem' }}>
              Scroll sync: {(scrollProgress * 100).toFixed(0)}%
            </span>
          </div>
          <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>
            Global Grid & Industrial Sites
          </h2>
          <p className="text-muted" style={{ fontSize: '0.86rem', maxWidth: 480 }}>
            Interactive 3D digital globe tracking real-world multi-site electrical load, eGRID carbon factors, and supply chain telemetry. Rotates in real time as you scroll or drag.
          </p>
        </div>

        {/* Live Facility KPI Card */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="card" style={{ padding: '0.6rem 0.9rem', minWidth: 140, background: 'var(--surface-muted)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Site Grid</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {activeFacility.grid_carbon_intensity} <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>kg CO₂e/kWh</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-primary-dark)' }}>{activeFacility.grid_region}</div>
          </div>

          <div className="card" style={{ padding: '0.6rem 0.9rem', minWidth: 130, background: 'var(--surface-muted)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Solar Capacity</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
              {activeFacility.solar_kwp} <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>kWp</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{activeFacility.square_footage?.toLocaleString()} sq ft</div>
          </div>
        </div>
      </div>

      {/* Facility Quick Jump Selector Strip */}
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
        {GLOBAL_FACILITIES.map((fac) => {
          const isSelected = activeFacility.id === fac.id;
          return (
            <button
              key={fac.id}
              type="button"
              onClick={() => handleJumpToFacility(fac)}
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontSize: '0.76rem',
                padding: '0.35rem 0.65rem',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isSelected ? '#fff' : (fac.color || '#829877') }} />
              {fac.name.split(' ')[0]} ({fac.location.split(',')[0]})
            </button>
          );
        })}
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '420px',
          borderRadius: '8px',
          background: 'radial-gradient(circle at 50% 50%, #24221d 0%, #151412 100%)',
          cursor: 'grab',
          position: 'relative'
        }}
      />

      {/* Dynamic Hover Tooltip HUD */}
      {hoveredFacility && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(window.innerWidth - 260, tooltipPos.x + 16),
            top: Math.max(10, tooltipPos.y - 40),
            pointerEvents: 'none',
            zIndex: 10,
            background: 'rgba(24, 23, 21, 0.94)',
            border: '1px solid var(--border-accent)',
            borderRadius: '6px',
            padding: '0.65rem 0.85rem',
            color: '#faf7f1',
            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
            minWidth: '220px',
            backdropFilter: 'blur(6px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#c49a45', letterSpacing: '0.05em' }}>
              {hoveredFacility.status}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#a6a195' }}>{hoveredFacility.location}</span>
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{hoveredFacility.name}</div>
          <div style={{ fontSize: '0.76rem', color: '#d3cebe', margin: '0.25rem 0 0.4rem' }}>{hoveredFacility.site}</div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.74rem' }}>
            <div>
              <span style={{ color: '#a6a195' }}>eGRID Factor: </span>
              <strong>{hoveredFacility.grid_carbon_intensity}</strong>
            </div>
            <div>
              <span style={{ color: '#a6a195' }}>Solar PV: </span>
              <strong>{hoveredFacility.solar_kwp} kWp</strong>
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#829877', marginTop: '0.35rem' }}>
            Click to switch active diagnosis workspace
          </div>
        </div>
      )}

      {/* Footer Instructions and Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Compass size={14} style={{ color: 'var(--color-primary-dark)' }} />
          <span>Click facility nodes to load live site dataset • Drag or scroll to rotate globe</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#829877' }} />
          <span>Global sync online ({GLOBAL_FACILITIES.length} sites connected)</span>
        </div>
      </div>
    </div>
  );
}
