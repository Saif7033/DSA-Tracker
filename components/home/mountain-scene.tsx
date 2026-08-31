"use client";

import * as React from "react";
import * as THREE from "three";
import { MountainFallback } from "./mountain-fallback";

interface MountainSceneProps {
  onError?: () => void;
}

export function MountainScene({ onError }: MountainSceneProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // WebGL availability check
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setHasError(true);
      onError?.();
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 800;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 8.5);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
    scene.add(ambientLight);

    const blueDirectLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    blueDirectLight.position.set(4, 6, 4);
    scene.add(blueDirectLight);

    const navyFillLight = new THREE.DirectionalLight(0x1e3a8a, 1.8);
    navyFillLight.position.set(-5, 2, -2);
    scene.add(navyFillLight);

    const summitPointLight = new THREE.PointLight(0x60a5fa, 4, 8);
    summitPointLight.position.set(0, 2.3, 0);
    scene.add(summitPointLight);

    // Mountain Group
    const mountainGroup = new THREE.Group();
    scene.add(mountainGroup);

    // 1. Faceted Central Mountain Peak
    const mountainGeo = new THREE.ConeGeometry(3.2, 4.6, 7, 3, false);
    const mountainMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.65,
      metalness: 0.25,
      flatShading: true,
    });
    const mountainMesh = new THREE.Mesh(mountainGeo, mountainMat);
    mountainMesh.position.y = 0;
    mountainGroup.add(mountainMesh);

    // Subtle Wireframe overlay on the mountain for technical aesthetic
    const wireGeo = new THREE.WireframeGeometry(mountainGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x1e3a8a,
      transparent: true,
      opacity: 0.35,
    });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    mountainMesh.add(wireframe);

    // 2. Secondary background peaks
    const leftPeakGeo = new THREE.ConeGeometry(2.2, 3.2, 6, 2, false);
    const leftPeakMat = new THREE.MeshStandardMaterial({
      color: 0x070c18,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: true,
    });
    const leftPeak = new THREE.Mesh(leftPeakGeo, leftPeakMat);
    leftPeak.position.set(-2.8, -0.6, -1.8);
    mountainGroup.add(leftPeak);

    const rightPeakGeo = new THREE.ConeGeometry(2.5, 3.6, 6, 2, false);
    const rightPeak = new THREE.Mesh(rightPeakGeo, leftPeakMat);
    rightPeak.position.set(2.6, -0.4, -1.5);
    mountainGroup.add(rightPeak);

    // 3. Glowing Winding Path toward Summit
    const pathPoints = [
      new THREE.Vector3(-1.8, -2.1, 1.4),
      new THREE.Vector3(-1.2, -1.4, 1.6),
      new THREE.Vector3(-0.4, -0.7, 1.5),
      new THREE.Vector3(0.5, -0.1, 1.3),
      new THREE.Vector3(0.1, 0.7, 1.0),
      new THREE.Vector3(-0.3, 1.4, 0.6),
      new THREE.Vector3(0.0, 2.3, 0.0),
    ];
    const curve = new THREE.CatmullRomCurve3(pathPoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.035, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    mountainGroup.add(tubeMesh);

    // Outer glow for the path
    const glowTubeGeo = new THREE.TubeGeometry(curve, 64, 0.08, 8, false);
    const glowTubeMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.4,
    });
    const glowTubeMesh = new THREE.Mesh(glowTubeGeo, glowTubeMat);
    mountainGroup.add(glowTubeMesh);

    // 4. Summit Beacon / Mastery Symbol
    const beaconGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.set(0, 2.32, 0);
    mountainGroup.add(beaconMesh);

    // Summit Beacon Ring
    const ringGeo = new THREE.RingGeometry(0.18, 0.22, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, 2.32, 0);
    ringMesh.rotation.x = Math.PI / 2;
    mountainGroup.add(ringMesh);

    // 5. Floating Geometric Coding Artifacts (Octahedrons / Tetrahedrons)
    const floatingShapes: THREE.Mesh[] = [];
    const shapeGeos = [
      new THREE.OctahedronGeometry(0.24, 0),
      new THREE.IcosahedronGeometry(0.2, 0),
      new THREE.TetrahedronGeometry(0.22, 0),
      new THREE.OctahedronGeometry(0.16, 0),
    ];

    const shapePositions = [
      [-2.2, 1.8, 1.0],
      [2.4, 1.4, 0.8],
      [-1.8, 0.2, 2.2],
      [2.0, 2.4, -0.5],
    ];

    shapeGeos.forEach((geo, i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
        metalness: 0.8,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const pos = shapePositions[i] || [0, 0, 0];
      mesh.position.set(pos[0], pos[1], pos[2]);

      // Add wireframe to each shape
      const wGeo = new THREE.WireframeGeometry(geo);
      const wMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0x38bdf8 : 0x60a5fa,
        transparent: true,
        opacity: 0.7,
      });
      mesh.add(new THREE.LineSegments(wGeo, wMat));

      mountainGroup.add(mesh);
      floatingShapes.push(mesh);
    });

    // 6. Starfield Dust Particles
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 20;
      starPositions[i + 1] = Math.random() * 12 - 2;
      starPositions[i + 2] = (Math.random() - 0.5) * 15;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x7dd3fc,
      size: 0.035,
      transparent: true,
      opacity: 0.75,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.4;
      targetY = -y * 0.3;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth camera dampening
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        camera.position.x = mouseX * 2;
        camera.position.y = 1.2 + mouseY * 1.2;
        camera.lookAt(0, 0.8, 0);

        // Very slow mountain drift
        mountainGroup.rotation.y = Math.sin(elapsedTime * 0.15) * 0.08;

        // Summit beacon pulse
        const pulse = 1 + Math.sin(elapsedTime * 3) * 0.2;
        ringMesh.scale.set(pulse, pulse, pulse);
        ringMesh.rotation.z = elapsedTime * 0.5;

        // Floating shapes rotation and hovering
        floatingShapes.forEach((shape, i) => {
          shape.rotation.x = elapsedTime * (0.2 + i * 0.05);
          shape.rotation.y = elapsedTime * (0.3 + i * 0.05);
          shape.position.y += Math.sin(elapsedTime * 1.5 + i) * 0.0015;
        });

        // Slow star rotation
        stars.rotation.y = elapsedTime * 0.015;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js objects
      renderer.dispose();
      mountainGeo.dispose();
      mountainMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      leftPeakGeo.dispose();
      leftPeakMat.dispose();
      rightPeakGeo.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
      glowTubeGeo.dispose();
      glowTubeMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      shapeGeos.forEach((g) => g.dispose());
    };
  }, [onError]);

  if (hasError) {
    return <MountainFallback />;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[420px] lg:min-h-full overflow-hidden select-none"
    />
  );
}
