import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useWorkspace } from '../context/WorkspaceContext';
import { GLOBAL_FACILITIES } from './GlobalGlobe3D';

// Convert lat/lng to 3D Cartesian coordinates on sphere
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Stylized holographic Earth texture with dot-matrix landmasses and glowing graticule
function createHologramEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Transparent dark base
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Hologram Latitude / Longitude graticule grid
  ctx.strokeStyle = 'rgba(130, 152, 119, 0.22)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw stylized continent landmasses in glowing holographic lines
  ctx.fillStyle = 'rgba(61, 74, 56, 0.35)';
  ctx.strokeStyle = 'rgba(196, 154, 69, 0.65)';
  ctx.lineWidth = 2;

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

  // Hologram matrix nodes
  ctx.fillStyle = 'rgba(232, 226, 212, 0.7)';
  for (let i = 0; i < 700; i++) {
    const rx = Math.random() * canvas.width;
    const ry = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.arc(rx, ry, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export default function HologramGlobeBackground() {
  const canvasRef = useRef(null);
  const { facility } = useWorkspace();
  const [hologramOpacity, setHologramOpacity] = useState(0.45);
  const [isHologramVisible, setIsHologramVisible] = useState(true);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const globeGroupRef = useRef(null);
  const targetRotationRef = useRef({ x: 0.25, y: 0.6 });
  const currentRotationRef = useRef({ x: 0.25, y: 0.6 });
  const lastScrollYRef = useRef(0);
  const animationFrameRef = useRef(null);

  // Setup Scroll-Driven 3D Rotation Listener
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const scrollDelta = currentScrollY - lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      // Compute normalized progress for rotation offset
      const docHeight = (document.documentElement.scrollHeight || 1000) - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, currentScrollY / docHeight)) : 0;

      // Scroll-driven multi-axis holographic rotation
      targetRotationRef.current.y += scrollDelta * 0.0035 + 0.01;
      targetRotationRef.current.x = 0.25 + Math.sin(progress * Math.PI) * 0.35;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Three.js Scene Initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    // Position camera on the right side of the screen for an elegant background aesthetic
    camera.position.set(25, 10, 160);
    cameraRef.current = camera;

    // 3. Renderer with high performance & alpha transparency
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    rendererRef.current = renderer;

    // 4. Master Globe Hologram Group
    const globeGroup = new THREE.Group();
    // Offset globe position slightly to the top-right / background center
    globeGroup.position.set(38, -12, 0);
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const GLOBE_RADIUS = 52;

    // 5. Hologram Wireframe Sphere
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 48, 48);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x829877,
      wireframe: true,
      transparent: true,
      opacity: 0.14
    });
    const wireframeMesh = new THREE.Mesh(sphereGeo, wireframeMat);
    globeGroup.add(wireframeMesh);

    // 6. Textured Holographic Core
    const earthTexture = createHologramEarthTexture();
    const globeMat = new THREE.MeshBasicMaterial({
      map: earthTexture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });
    const texturedMesh = new THREE.Mesh(sphereGeo, globeMat);
    globeGroup.add(texturedMesh);

    // 7. Outer Hologram Corona / Atmospheric Glow
    const coronaGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.18, 36, 36);
    const coronaMat = new THREE.ShaderMaterial({
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
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
          gl_FragColor = vec4(0.51, 0.60, 0.47, 0.45) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    globeGroup.add(coronaMesh);

    // 8. Orbital Hologram Rings (Equatorial and Inclined)
    const ringGeo = new THREE.BufferGeometry();
    const ringPoints = [];
    for (let i = 0; i <= 90; i++) {
      const theta = (i / 90) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(theta) * (GLOBE_RADIUS + 3), 0, Math.sin(theta) * (GLOBE_RADIUS + 3)));
    }
    ringGeo.setFromPoints(ringPoints);

    const orbit1 = new THREE.Line(ringGeo, new THREE.LineBasicMaterial({ color: 0x829877, transparent: true, opacity: 0.28 }));
    globeGroup.add(orbit1);

    const orbit2 = new THREE.Line(ringGeo, new THREE.LineBasicMaterial({ color: 0xc49a45, transparent: true, opacity: 0.32 }));
    orbit2.rotation.x = Math.PI / 3;
    orbit2.rotation.z = Math.PI / 5;
    globeGroup.add(orbit2);

    const orbit3 = new THREE.Line(ringGeo, new THREE.LineBasicMaterial({ color: 0x658060, transparent: true, opacity: 0.22 }));
    orbit3.rotation.y = Math.PI / 4;
    orbit3.rotation.x = -Math.PI / 4;
    globeGroup.add(orbit3);

    // 9. Multi-Facility Beacons & Radial Waves
    const beaconGroup = new THREE.Group();
    globeGroup.add(beaconGroup);

    const pinNodes = [];
    GLOBAL_FACILITIES.forEach((fac) => {
      const pos = latLngToVector3(fac.lat, fac.lng, GLOBE_RADIUS + 0.5);

      // Core point
      const pGeo = new THREE.SphereGeometry(1.2, 12, 12);
      const pMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(fac.color || '#c49a45'),
        transparent: true,
        opacity: 0.85
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.copy(pos);
      beaconGroup.add(pMesh);

      // Radiating ring
      const rGeo = new THREE.RingGeometry(1.0, 2.0, 20);
      const rMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(fac.color || '#829877'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55
      });
      const ring = new THREE.Mesh(rGeo, rMat);
      ring.position.copy(pos.clone().multiplyScalar(1.01));
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      beaconGroup.add(ring);

      pinNodes.push({ point: pMesh, ring, basePos: pos });
    });

    // 10. Glowing Supply Chain Hologram Arcs & Telemetry Particles
    const arcPairs = [
      [GLOBAL_FACILITIES[0], GLOBAL_FACILITIES[1]],
      [GLOBAL_FACILITIES[0], GLOBAL_FACILITIES[2]],
      [GLOBAL_FACILITIES[2], GLOBAL_FACILITIES[5]],
      [GLOBAL_FACILITIES[4], GLOBAL_FACILITIES[5]],
      [GLOBAL_FACILITIES[1], GLOBAL_FACILITIES[7]],
    ];

    const arcCurves = [];
    arcPairs.forEach(([f1, f2]) => {
      const v1 = latLngToVector3(f1.lat, f1.lng, GLOBE_RADIUS + 0.5);
      const v2 = latLngToVector3(f2.lat, f2.lng, GLOBE_RADIUS + 0.5);
      const mid = v1.clone().add(v2).multiplyScalar(0.5);
      const distance = v1.distanceTo(v2);
      mid.normalize().multiplyScalar(GLOBE_RADIUS + distance * 0.3);

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      arcCurves.push(curve);

      const arcPoints = curve.getPoints(36);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
      const arcMat = new THREE.LineBasicMaterial({
        color: 0xc49a45,
        transparent: true,
        opacity: 0.35
      });
      const line = new THREE.Line(arcGeo, arcMat);
      globeGroup.add(line);
    });

    const particles = arcCurves.map((curve) => {
      const pGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      globeGroup.add(pMesh);
      return { mesh: pMesh, curve, progress: Math.random() };
    });

    // 11. Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    // 12. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Ambient idle continuous rotation
      targetRotationRef.current.y += 0.0012;

      // Smooth interpolation damping
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.06;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.06;

      globeGroup.rotation.x = currentRotationRef.current.x;
      globeGroup.rotation.y = currentRotationRef.current.y;

      // Subtle float oscillation
      globeGroup.position.y = -12 + Math.sin(elapsedTime * 0.8) * 1.8;

      // Animate pulsing beacons
      pinNodes.forEach((pin, idx) => {
        const s = 1 + Math.sin(elapsedTime * 3 + idx) * 0.3;
        pin.ring.scale.set(s, s, s);
      });

      // Animate telemetry flow photons
      particles.forEach((p) => {
        p.progress = (p.progress + 0.005) % 1.0;
        const pt = p.curve.getPoint(p.progress);
        p.mesh.position.copy(pt);
      });

      // Slowly rotate orbital rings in opposite directions
      orbit2.rotation.z += 0.002;
      orbit3.rotation.y -= 0.0018;

      renderer.render(scene, camera);
    };

    animate();

    // 13. Window Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      // Responsive positioning for smaller screens
      if (width < 768) {
        globeGroup.position.set(0, 10, -20);
        globeGroup.scale.set(0.75, 0.75, 0.75);
      } else {
        globeGroup.position.set(38, -12, 0);
        globeGroup.scale.set(1, 1, 1);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  if (!isHologramVisible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: hologramOpacity,
        overflow: 'hidden',
        transition: 'opacity 0.4s ease'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100vw',
          height: '100vh',
          display: 'block'
        }}
      />
    </div>
  );
}
