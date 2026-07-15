import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AladdinBotProps {
  state?: 'idle' | 'thinking' | 'success' | 'pointing';
}

// Global coordinate emitter stubbed to avoid import/export errors or runtime reference issues
export let globalBotTargetSetter: ((x: number, y: number, triggerVortex: boolean) => void) | null = null;

export default function AladdinBot({ state }: AladdinBotProps) {
  const mountLocalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 1. LOCAL RENDERING: Spinning Golden Magic Lamp (in circular widget)
    const currentLocalMount = mountLocalRef.current;
    if (!currentLocalMount) return;

    const localWidth = currentLocalMount.clientWidth || 96;
    const localHeight = currentLocalMount.clientHeight || 96;

    const localScene = new THREE.Scene();
    const localCamera = new THREE.PerspectiveCamera(45, localWidth / localHeight, 0.1, 10);
    localCamera.position.set(0, 0.5, 2.5);

    const localRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    localRenderer.setSize(localWidth, localHeight);
    localRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentLocalMount.appendChild(localRenderer.domElement);

    const localGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.1,
      metalness: 0.9,
    });

    const localLampGroup = new THREE.Group();
    localScene.add(localLampGroup);

    // Mini Lamp base
    const baseGeo = new THREE.CylinderGeometry(0.2, 0.23, 0.05, 16);
    const base = new THREE.Mesh(baseGeo, localGoldMat);
    localLampGroup.add(base);

    // Mini Lamp body
    const bodyGeo = new THREE.SphereGeometry(0.3, 16, 16);
    bodyGeo.scale(1.2, 0.6, 0.8);
    const body = new THREE.Mesh(bodyGeo, localGoldMat);
    body.position.y = 0.15;
    localLampGroup.add(body);

    // Mini spout
    const spoutGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.3, 12);
    spoutGeo.rotateZ(Math.PI / 3);
    const spout = new THREE.Mesh(spoutGeo, localGoldMat);
    spout.position.set(0.25, 0.25, 0);
    localLampGroup.add(spout);

    // Mini handle
    const handleGeo = new THREE.TorusGeometry(0.15, 0.03, 8, 16, Math.PI);
    handleGeo.rotateZ(-Math.PI / 4);
    const handle = new THREE.Mesh(handleGeo, localGoldMat);
    handle.position.set(-0.25, 0.22, 0);
    localLampGroup.add(handle);

    // Local Light
    const localAmbient = new THREE.AmbientLight(0xffffff, 0.6);
    localScene.add(localAmbient);
    const localDir = new THREE.DirectionalLight(0x00f0ff, 1.5);
    localDir.position.set(1, 1, 1);
    localScene.add(localDir);

    let localAnimFrame: number;
    const animateLocal = () => {
      localLampGroup.rotation.y += 0.015;
      localLampGroup.position.y = Math.sin(Date.now() * 0.003) * 0.05;
      localRenderer.render(localScene, localCamera);
      localAnimFrame = requestAnimationFrame(animateLocal);
    };
    animateLocal();

    // Resize handler for local lamp
    const handleLocalResize = () => {
      const w = currentLocalMount.clientWidth || 96;
      const h = currentLocalMount.clientHeight || 96;
      localCamera.aspect = w / h;
      localCamera.updateProjectionMatrix();
      localRenderer.setSize(w, h);
    };
    window.addEventListener('resize', handleLocalResize);

    return () => {
      cancelAnimationFrame(localAnimFrame);
      window.removeEventListener('resize', handleLocalResize);
      if (currentLocalMount && currentLocalMount.contains(localRenderer.domElement)) {
        currentLocalMount.removeChild(localRenderer.domElement);
      }
      localRenderer.dispose();
      baseGeo.dispose();
      bodyGeo.dispose();
      spoutGeo.dispose();
      handleGeo.dispose();
      localGoldMat.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <div ref={mountLocalRef} className="w-20 h-20 select-none cursor-pointer" />
    </div>
  );
}
