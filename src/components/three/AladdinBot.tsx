import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AladdinBotProps {
  state: 'idle' | 'thinking' | 'success' | 'pointing';
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

    const width = currentMount.clientWidth || 180;
    const height = currentMount.clientHeight || 180;

    // Scene, Camera, WebGLRenderer with Antialiasing
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05050f, 0.015);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    // Move camera slightly further back to fit lamp and genie body nicely
    camera.position.set(0, 0.8, 4.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Main Group holding entire scene
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. THE GOLDEN MAGIC LAMP (at the bottom)
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0, -1.0, 0);
    mainGroup.add(lampGroup);

    // Lamp Gold Material
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.15,
      metalness: 0.95,
    });

    // Lamp Base
    const baseGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.1, 16);
    const base = new THREE.Mesh(baseGeo, goldMat);
    lampGroup.add(base);

    // Lamp Body (Flattened Sphere)
    const lampBodyGeo = new THREE.SphereGeometry(0.5, 32, 16);
    lampBodyGeo.scale(1.2, 0.6, 0.8); // flattened shape
    const lampBody = new THREE.Mesh(lampBodyGeo, goldMat);
    lampBody.position.y = 0.25;
    lampGroup.add(lampBody);

    // Lamp Spout/Nozzle
    const spoutGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.6, 16);
    spoutGeo.rotateZ(Math.PI / 3); // angled spout
    const spout = new THREE.Mesh(spoutGeo, goldMat);
    spout.position.set(0.45, 0.45, 0);
    lampGroup.add(spout);

    // Lamp Handle
    const handleGeo = new THREE.TorusGeometry(0.25, 0.05, 12, 24, Math.PI);
    handleGeo.rotateZ(-Math.PI / 4);
    const handle = new THREE.Mesh(handleGeo, goldMat);
    handle.position.set(-0.4, 0.35, 0);
    lampGroup.add(handle);


    // 2. THE GENIE (floating above the lamp spout)
    const genieGroup = new THREE.Group();
    mainGroup.add(genieGroup);

    // Custom Blueish cyber metal material for the Genie body
    const genieMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9, // Sky Blue
      roughness: 0.2,
      metalness: 0.8,
    });

    // Genie's Torso/Chest (Broad shoulder design)
    const torsoGeo = new THREE.CylinderGeometry(0.55, 0.2, 0.8, 32);
    const torso = new THREE.Mesh(torsoGeo, genieMat);
    torso.position.y = 0.5;
    genieGroup.add(torso);

    // Genie's Crossed Arms (represented by an elegant torus wrapping around the chest)
    const armsGeo = new THREE.TorusGeometry(0.42, 0.12, 16, 32, Math.PI * 1.1);
    armsGeo.rotateX(Math.PI / 6);
    const arms = new THREE.Mesh(armsGeo, genieMat);
    arms.position.set(0, 0.6, 0.25);
    genieGroup.add(arms);

    // Genie's Head
    const headGeo = new THREE.SphereGeometry(0.42, 32, 32);
    const head = new THREE.Mesh(headGeo, genieMat);
    head.position.y = 1.15;
    genieGroup.add(head);

    // Genie's Cute Ponytail / Horn (Aladdin Jin look)
    const hornGeo = new THREE.ConeGeometry(0.12, 0.5, 16);
    hornGeo.rotateX(-Math.PI / 6);
    const horn = new THREE.Mesh(hornGeo, goldMat); // Golden horn on head
    horn.position.set(0, 1.5, -0.15);
    genieGroup.add(horn);

    // Glowing Genie Eyes (Basic materials with emission simulation)
    const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const leftEyeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const rightEyeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    const leftEye = new THREE.Mesh(eyeGeo, leftEyeMat);
    leftEye.position.set(-0.16, 1.18, 0.35);
    genieGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, rightEyeMat);
    rightEye.position.set(0.16, 1.18, 0.35);
    genieGroup.add(rightEye);


    // 3. SWIRLING SMOKE TAIL (connecting spout of lamp to genie bottom)
    const smokeSpheres: THREE.Mesh[] = [];
    const smokeCount = 12;
    const smokeGroup = new THREE.Group();
    mainGroup.add(smokeGroup);

    for (let i = 0; i < smokeCount; i++) {
      const ratio = i / smokeCount;
      const size = 0.28 * (1 - ratio * 0.75);
      const sphereGeo = new THREE.SphereGeometry(size, 16, 16);

      // Neon cyan/magenta smoke material
      const smokeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.55 + ratio * 0.18, 0.95, 0.5),
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.85 - ratio * 0.5,
      });

      const smokeSphere = new THREE.Mesh(sphereGeo, smokeMat);
      smokeGroup.add(smokeSphere);
      smokeSpheres.push(smokeSphere);
    }


    // 4. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 2.5, 10);
    pointLight.position.set(1.5, 2, 2);
    scene.add(pointLight);

    const goldGlowLight = new THREE.PointLight(0xffd700, 2.0, 8);
    goldGlowLight.position.set(-1.5, -0.5, 1);
    scene.add(goldGlowLight);


    // Mouse Tracking for dynamic look-around behavior
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

      // State eye colors
      // idle = Cyan
      // thinking = Magenta
      // success = Emerald
      // pointing = Yellow-gold
      let targetColor = new THREE.Color(0x00f0ff);
      if (stateRef.current === 'thinking') {
        targetColor = new THREE.Color(0xd946ef);
      } else if (stateRef.current === 'success') {
        targetColor = new THREE.Color(0x10b981);
      } else if (stateRef.current === 'pointing') {
        targetColor = new THREE.Color(0xffd700);
      }

      leftEyeMat.color.lerp(targetColor, 0.1);
      rightEyeMat.color.lerp(targetColor, 0.1);

      // Genie floating/hover motion (syncing chest and head)
      const hoverHeight = Math.sin(elapsedTime * 2.5) * 0.12;
      genieGroup.position.y = hoverHeight + 0.1;
      genieGroup.rotation.y = Math.sin(elapsedTime * 0.7) * 0.1;

      // Pointer state flight surge
      if (stateRef.current === 'pointing') {
        mainGroup.position.x = Math.sin(elapsedTime * 15) * 0.15;
        mainGroup.position.y = Math.cos(elapsedTime * 15) * 0.12;
      } else {
        mainGroup.position.x = 0;
        mainGroup.position.y = 0;
      }

      // Eye tracking
      leftEye.position.x = -0.16 + mouse.x * 0.05;
      leftEye.position.y = 1.18 - mouse.y * 0.04;
      rightEye.position.x = 0.16 + mouse.x * 0.05;
      rightEye.position.y = 1.18 - mouse.y * 0.04;

      // Head turn
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, mouse.x * 0.3, 0.1);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, mouse.y * 0.2, 0.1);

      // Animate the swirling mystical smoke tail connecting the Golden Spout to the Genie base
      const spoutX = 0.45;
      const spoutY = -0.55; // relative to spout offset
      const genieBottomX = genieGroup.position.x;
      const genieBottomY = genieGroup.position.y;

      for (let i = 0; i < smokeCount; i++) {
        const sphere = smokeSpheres[i];
        const ratio = i / smokeCount; // 0 at spout, 1 at genie bottom

        // Interpolate position from spout to genie base with elegant sine curves
        const tX = THREE.MathUtils.lerp(spoutX, genieBottomX, ratio);
        const tY = THREE.MathUtils.lerp(spoutY, genieBottomY, ratio);

        const wave = Math.sin(elapsedTime * 4.0 - ratio * 6.0) * 0.25 * (1 - ratio);
        const waveZ = Math.cos(elapsedTime * 3.0 - ratio * 4.0) * 0.18 * ratio;

        sphere.position.x = tX + wave;
        sphere.position.y = tY;
        sphere.position.z = waveZ;
      }

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
      baseGeo.dispose();
      lampBodyGeo.dispose();
      spoutGeo.dispose();
      handleGeo.dispose();
      goldMat.dispose();
      torsoGeo.dispose();
      armsGeo.dispose();
      genieMat.dispose();
      headGeo.dispose();
      hornGeo.dispose();
      eyeGeo.dispose();
      leftEyeMat.dispose();
      rightEyeMat.dispose();
      smokeSpheres.forEach(s => {
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
