import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface AladdinBotProps {
  state: 'idle' | 'thinking' | 'success';
}

export default function AladdinBot({ state }: AladdinBotProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Dimensions
    const width = currentMount.clientWidth || 180;
    const height = currentMount.clientHeight || 180;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a14, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Group to hold our genie
    const genieGroup = new THREE.Group();
    scene.add(genieGroup);

    // Create the Genie's elements
    // 1. Head
    const headGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.9,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.3;
    genieGroup.add(head);

    // 2. Eyes
    const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);

    // We'll update the eye materials' emission color based on state
    const leftEyeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const rightEyeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    const leftEye = new THREE.Mesh(eyeGeo, leftEyeMat);
    leftEye.position.set(-0.25, 1.35, 0.6);
    genieGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, rightEyeMat);
    rightEye.position.set(0.25, 1.35, 0.6);
    genieGroup.add(rightEye);

    // 3. Torso
    const torsoGeo = new THREE.CylinderGeometry(0.6, 0.3, 1.2, 32);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.15,
      metalness: 0.85,
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.5;
    genieGroup.add(torso);

    // 4. Genie's Aladdin Curved Tail (using nested decreasing spheres to create a curved snake/smoke look)
    const tailSpheres: THREE.Mesh[] = [];
    const sphereCount = 15;
    const tailGroup = new THREE.Group();
    genieGroup.add(tailGroup);

    for (let i = 0; i < sphereCount; i++) {
      const ratio = i / sphereCount;
      const size = 0.3 * (1 - ratio * 0.8);
      const tailGeo = new THREE.SphereGeometry(size, 16, 16);

      // Let's make it a colorful cosmic blue/cyan gradient tail
      const tailMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.55 + ratio * 0.15, 0.9, 0.5),
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.9 - ratio * 0.5,
      });

      const sphere = new THREE.Mesh(tailGeo, tailMat);
      tailGroup.add(sphere);
      tailSpheres.push(sphere);
    }

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 2.5, 15);
    pointLight.position.set(2, 3, 2);
    scene.add(pointLight);

    const subLight = new THREE.PointLight(0xd946ef, 1.5, 10);
    subLight.position.set(-2, -1, 1);
    scene.add(subLight);

    // Tracker for mouse to rotate eyes/head slightly
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (event: MouseEvent) => {
      const rect = currentMount.getBoundingClientRect();
      const relativeX = event.clientX - (rect.left + rect.width / 2);
      const relativeY = event.clientY - (rect.top + rect.height / 2);
      mouse.x = THREE.MathUtils.clamp(relativeX / (rect.width / 2), -1, 1);
      mouse.y = THREE.MathUtils.clamp(relativeY / (rect.height / 2), -1, 1);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // State colors for eyes
      // Idle/Greeting = Cyan (0x00f0ff)
      // Thinking = Purple/Magenta (0xd946ef)
      // Success = Emerald/Green (0x10b981)
      let targetColor = new THREE.Color(0x00f0ff);
      if (stateRef.current === 'thinking') {
        targetColor = new THREE.Color(0xd946ef);
      } else if (stateRef.current === 'success') {
        targetColor = new THREE.Color(0x10b981);
      }

      leftEyeMat.color.lerp(targetColor, 0.1);
      rightEyeMat.color.lerp(targetColor, 0.1);

      // Hover/Floating animation for Genie body
      genieGroup.position.y = Math.sin(elapsedTime * 2.2) * 0.18;
      genieGroup.rotation.y = Math.sin(elapsedTime * 0.8) * 0.12;

      // Head and eye tracking based on mouse
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, mouse.x * 0.3, 0.1);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, mouse.y * 0.2, 0.1);

      leftEye.position.x = -0.25 + mouse.x * 0.08;
      leftEye.position.y = 1.35 - mouse.y * 0.06;
      rightEye.position.x = 0.25 + mouse.x * 0.08;
      rightEye.position.y = 1.35 - mouse.y * 0.06;

      // Aladdin Genie curved snake-like tail smoke animation
      for (let i = 0; i < sphereCount; i++) {
        const sphere = tailSpheres[i];
        const ratio = i / sphereCount;

        // Compute an elegant S-curve trail
        const wave = Math.sin(elapsedTime * 3.5 - ratio * 4.5) * 0.35 * ratio;
        const waveZ = Math.cos(elapsedTime * 2.5 - ratio * 3.5) * 0.25 * ratio;

        // Tail curves backwards and downwards
        sphere.position.x = wave;
        sphere.position.y = -ratio * 1.5;
        sphere.position.z = -ratio * 0.8 + waveZ;
      }

      // Render scene
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      const w = currentMount.clientWidth || 180;
      const h = currentMount.clientHeight || 180;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanups
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      headGeo.dispose();
      headMat.dispose();
      eyeGeo.dispose();
      leftEyeMat.dispose();
      rightEyeMat.dispose();
      torsoGeo.dispose();
      torsoMat.dispose();
      tailSpheres.forEach(s => {
        s.geometry.dispose();
        if (Array.isArray(s.material)) {
          s.material.forEach(m => m.dispose());
        } else {
          s.material.dispose();
        }
      });
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div ref={mountRef} className="w-48 h-48 select-none pointer-events-none" />
    </div>
  );
}
