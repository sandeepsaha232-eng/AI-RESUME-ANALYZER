import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import * as THREE from 'three';
import { Sparkles, Zap, Lock, RefreshCw } from 'lucide-react';

interface AladdinBotProps {
  state: 'idle' | 'thinking' | 'success' | 'pointing';
}

// Global coordinate emitter so we can make the bot interact with the page elements directly (like the Upload Zone)
export let globalBotTargetSetter: ((x: number, y: number, triggerVortex: boolean) => void) | null = null;

export default function AladdinBot({ state }: AladdinBotProps) {
  const mountLocalRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);

  // Bot states managed in React for the interactive UI HUD
  const [energy, setEnergy] = useState(100);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [ropeActive, setRopeActive] = useState(false);

  // Floating coordinates to attach HUD directly above the 3D Genie
  const [botPos, setBotPos] = useState({ x: 0, y: 0 });
  const [bubbleText, setBubbleText] = useState('Hey there! Hover or drag me!');

  // Sync state prop with ref for high performance render loop access
  useEffect(() => {
    stateRef.current = state;
    if (state === 'thinking') {
      setBubbleText('Thinking... casting AI evaluation spell! ✨');
    } else if (state === 'success') {
      setBubbleText('Success! Your match rating is optimized! 🎉');
    } else if (state === 'pointing') {
      setBubbleText('Look over there! Drag and drop your scroll! 👉');
    }
  }, [state]);

  // Handle global/full-screen canvas and UI
  useEffect(() => {
    // -------------------------------------------------------------
    // 1. LOCAL RENDERING: Spinning Golden Magic Lamp (in circular widget)
    // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // 2. GLOBAL OVERLAY RENDERING: Highly Interactive full-screen Genie Bot
  // -------------------------------------------------------------
  useEffect(() => {
    let overlayDiv = document.getElementById('aladdin-global-overlay');
    if (!overlayDiv) {
      overlayDiv = document.createElement('div');
      overlayDiv.id = 'aladdin-global-overlay';
      overlayDiv.style.position = 'fixed';
      overlayDiv.style.inset = '0';
      overlayDiv.style.pointerEvents = 'none';
      overlayDiv.style.zIndex = '9999';
      document.body.appendChild(overlayDiv);
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      1000
    );
    camera.position.set(0, 0, 500);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.pointerEvents = 'none';
    overlayDiv.appendChild(renderer.domElement);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const cyanPointLight = new THREE.PointLight(0x0ea5e9, 3, 400);
    cyanPointLight.position.set(0, 100, 100);
    scene.add(cyanPointLight);

    const goldPointLight = new THREE.PointLight(0xffd700, 2, 400);
    goldPointLight.position.set(0, -100, 100);
    scene.add(goldPointLight);

    // -------------------------------------------------------------
    // BUILD GENIE BOT SKELETAL SYSTEM
    // -------------------------------------------------------------
    const genieGroup = new THREE.Group();
    scene.add(genieGroup);

    const genieMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.15,
      metalness: 0.8,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.1,
      metalness: 0.95,
    });

    // 1. Torso Mesh
    const torsoGeo = new THREE.CylinderGeometry(25, 12, 50, 16);
    const torso = new THREE.Mesh(torsoGeo, genieMat);
    torso.position.y = 0;
    genieGroup.add(torso);

    // 2. Head Group
    const headGroup = new THREE.Group();
    headGroup.position.y = 45;
    genieGroup.add(headGroup);

    const headGeo = new THREE.SphereGeometry(20, 16, 16);
    const head = new THREE.Mesh(headGeo, genieMat);
    headGroup.add(head);

    // Ponytail / Horn
    const hornGeo = new THREE.ConeGeometry(5, 20, 12);
    hornGeo.rotateX(-Math.PI / 6);
    const horn = new THREE.Mesh(hornGeo, goldMat);
    horn.position.set(0, 18, -5);
    headGroup.add(horn);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(4, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-8, 3, 16);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(8, 3, 16);
    headGroup.add(rightEye);

    // Eyebrows
    const eyebrowGeo = new THREE.BoxGeometry(7, 2, 2);
    const leftEyebrow = new THREE.Mesh(eyebrowGeo, goldMat);
    leftEyebrow.position.set(-8, 9, 16);
    headGroup.add(leftEyebrow);

    const rightEyebrow = new THREE.Mesh(eyebrowGeo, goldMat);
    rightEyebrow.position.set(8, 9, 16);
    headGroup.add(rightEyebrow);

    // Mouth
    const mouthGeo = new THREE.SphereGeometry(3, 8, 8);
    mouthGeo.scale(1.5, 0.4, 0.5);
    const mouth = new THREE.Mesh(mouthGeo, goldMat);
    mouth.position.set(0, -5, 17);
    headGroup.add(mouth);

    // -------------------------------------------------------------
    // LIMBS: HIERARCHICAL RIGGING (Arms & Legs)
    // -------------------------------------------------------------
    const jointGeo = new THREE.SphereGeometry(6, 8, 8);
    const boneGeo = new THREE.CylinderGeometry(4, 4, 25, 8);
    boneGeo.translate(0, -12.5, 0);

    // LEFT ARM
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-28, 18, 0);
    genieGroup.add(leftShoulder);

    const leftShoulderMesh = new THREE.Mesh(jointGeo, genieMat);
    leftShoulder.add(leftShoulderMesh);

    const leftUpperArm = new THREE.Mesh(boneGeo, genieMat);
    leftUpperArm.position.set(0, 0, 0);
    leftShoulder.add(leftUpperArm);

    const leftElbow = new THREE.Group();
    leftElbow.position.set(0, -25, 0);
    leftUpperArm.add(leftElbow);

    const leftElbowMesh = new THREE.Mesh(jointGeo, genieMat);
    leftElbow.add(leftElbowMesh);

    const leftForearm = new THREE.Mesh(boneGeo, genieMat);
    leftElbow.add(leftForearm);

    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(5, 8, 8), goldMat);
    leftHand.position.set(0, -25, 0);
    leftElbow.add(leftHand);

    // RIGHT ARM
    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(28, 18, 0);
    genieGroup.add(rightShoulder);

    const rightShoulderMesh = new THREE.Mesh(jointGeo, genieMat);
    rightShoulder.add(rightShoulderMesh);

    const rightUpperArm = new THREE.Mesh(boneGeo, genieMat);
    rightShoulder.add(rightUpperArm);

    const rightElbow = new THREE.Group();
    rightElbow.position.set(0, -25, 0);
    rightUpperArm.add(rightElbow);

    const rightElbowMesh = new THREE.Mesh(jointGeo, genieMat);
    rightElbow.add(rightElbowMesh);

    const rightForearm = new THREE.Mesh(boneGeo, genieMat);
    rightElbow.add(rightForearm);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(5, 8, 8), goldMat);
    rightHand.position.set(0, -25, 0);
    rightElbow.add(rightHand);

    // LEFT LEG
    const leftHip = new THREE.Group();
    leftHip.position.set(-14, -25, 0);
    genieGroup.add(leftHip);

    const leftHipMesh = new THREE.Mesh(jointGeo, genieMat);
    leftHip.add(leftHipMesh);

    const leftThigh = new THREE.Mesh(boneGeo, genieMat);
    leftHip.add(leftThigh);

    const leftKnee = new THREE.Group();
    leftKnee.position.set(0, -25, 0);
    leftThigh.add(leftKnee);

    const leftKneeMesh = new THREE.Mesh(jointGeo, genieMat);
    leftKnee.add(leftKneeMesh);

    const leftCalf = new THREE.Mesh(boneGeo, genieMat);
    leftKnee.add(leftCalf);

    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 15), goldMat);
    leftFoot.position.set(0, -25, 3);
    leftKnee.add(leftFoot);

    // RIGHT LEG
    const rightHip = new THREE.Group();
    rightHip.position.set(14, -25, 0);
    genieGroup.add(rightHip);

    const rightHipMesh = new THREE.Mesh(jointGeo, genieMat);
    rightHip.add(rightHipMesh);

    const rightThigh = new THREE.Mesh(boneGeo, genieMat);
    rightHip.add(rightThigh);

    const rightKnee = new THREE.Group();
    rightKnee.position.set(0, -25, 0);
    rightThigh.add(rightKnee);

    const rightKneeMesh = new THREE.Mesh(jointGeo, genieMat);
    rightKnee.add(rightKneeMesh);

    const rightCalf = new THREE.Mesh(boneGeo, genieMat);
    rightKnee.add(rightCalf);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 15), goldMat);
    rightFoot.position.set(0, -25, 3);
    rightKnee.add(rightFoot);

    // Premium Lock Graphic
    const premiumLockGroup = new THREE.Group();
    premiumLockGroup.position.set(0, 95, 0);
    genieGroup.add(premiumLockGroup);

    const lockBodyGeo = new THREE.BoxGeometry(16, 12, 6);
    const lockBody = new THREE.Mesh(lockBodyGeo, goldMat);
    premiumLockGroup.add(lockBody);

    const lockShackleGeo = new THREE.TorusGeometry(6, 2, 8, 16, Math.PI);
    const lockShackle = new THREE.Mesh(lockShackleGeo, goldMat);
    lockShackle.position.y = 6;
    premiumLockGroup.add(lockShackle);
    premiumLockGroup.visible = false;

    // Lightning Sparks
    const sparkCount = 15;
    const sparks: THREE.Mesh[] = [];
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffea00, transparent: true, opacity: 0.9 });
    for (let i = 0; i < sparkCount; i++) {
      const sGeo = new THREE.BoxGeometry(2, 8, 2);
      const spark = new THREE.Mesh(sGeo, sparkMat);
      scene.add(spark);
      sparks.push(spark);
    }

    // High-performance Path Trail
    const trailLength = 25;
    const trailPool: THREE.Mesh[] = [];
    const trailMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true });

    for (let i = 0; i < trailLength; i++) {
      const trailDotGeo = new THREE.SphereGeometry(6 - (i / trailLength) * 4, 8, 8);
      const dot = new THREE.Mesh(trailDotGeo, trailMat.clone());
      dot.position.set(9999, 9999, 0);
      scene.add(dot);
      trailPool.push(dot);
    }
    const trailHistory: THREE.Vector3[] = [];

    // Rope Climber
    const ropeSegments = 16;
    const ropeSegmentMeshes: THREE.Mesh[] = [];
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.8 });
    const ropeGroup = new THREE.Group();
    scene.add(ropeGroup);

    for (let i = 0; i < ropeSegments; i++) {
      const segGeo = new THREE.CylinderGeometry(3, 3, 40, 8);
      const seg = new THREE.Mesh(segGeo, ropeMat);
      seg.position.set(0, 9999, 0);
      ropeGroup.add(seg);
      ropeSegmentMeshes.push(seg);
    }

    // -------------------------------------------------------------
    // MAGICAL VORTEX INTEGRATION (When interacting with Upload zone)
    // -------------------------------------------------------------
    const vortexGeo = new THREE.RingGeometry(35, 45, 32);
    const vortexMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const vortexMesh = new THREE.Mesh(vortexGeo, vortexMat);
    scene.add(vortexMesh);

    // Coordinate States & Target Overrides
    let botX = 0;
    let botY = 0;
    let targetX = 0;
    let targetY = 0;

    let overrideActive = false;
    let vortexActive = false;

    // Attach dynamic target setter to global emitter so other page components can call it
    globalBotTargetSetter = (x: number, y: number, triggerVortex: boolean) => {
      targetX = x;
      targetY = y;
      overrideActive = true;
      vortexActive = triggerVortex;

      if (triggerVortex) {
        setBubbleText('SUMMONING THE COSMIC RATING VORTEX! 🔮✨');
      }
    };

    let isDragging = false;
    let draggingEnergyTimer = 0;

    let movementMode: 'idle' | 'running' | 'climbing_wall' | 'climbing_rope' | 'tired' = 'idle';

    let runDirection = 1;
    let climbDirection = 1;
    let climbRopeY = -height / 2;

    const handleGlobalMouseDown = (e: MouseEvent) => {
      // Deactivate target overrides when user clicks/interacts
      overrideActive = false;
      vortexActive = false;

      const clientX = e.clientX - window.innerWidth / 2;
      const clientY = -(e.clientY - window.innerHeight / 2);

      const dx = clientX - botX;
      const dy = clientY - botY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 120) {
        isDragging = true;
        movementMode = 'running';
        renderer.domElement.style.cursor = 'grabbing';
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        targetX = e.clientX - window.innerWidth / 2;
        targetY = -(e.clientY - window.innerHeight / 2);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        renderer.domElement.style.cursor = 'default';
      }
    };

    window.addEventListener('mousedown', handleGlobalMouseDown);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    const tempVec = new THREE.Vector3();
    const clock = new THREE.Clock();

    let animFrame: number;
    let lastTime = 0;

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const elapsed = clock.getElapsedTime();

      // Read state parameters securely
      let currentEnergy = 100;
      setEnergy((val) => {
        currentEnergy = val;
        return val;
      });

      let premiumActive = false;
      setIsPremium((val) => {
        premiumActive = val;
        return val;
      });

      let ropeThrowing = false;
      setRopeActive((val) => {
        ropeThrowing = val;
        return val;
      });

      const targetEyeColor = premiumActive ? new THREE.Color(0xffea00) : new THREE.Color(0x00f0ff);
      eyeMat.color.lerp(targetEyeColor, 0.15);

      const isMovingFast = isDragging || movementMode !== 'idle';
      if (isMovingFast && !premiumActive && currentEnergy > 0) {
        draggingEnergyTimer += dt;
        if (draggingEnergyTimer >= 0.15) {
          setEnergy((val) => {
            const nextVal = Math.max(0, val - 1.5);
            if (nextVal === 0) {
              movementMode = 'tired';
              setBubbleText("ENERGY DRAINED! Upgrade or Recharge to move! ⚡🔒");
            }
            return nextVal;
          });
          draggingEnergyTimer = 0;
        }
      }

      if (currentEnergy <= 0 && !premiumActive) {
        premiumLockGroup.visible = true;
        movementMode = 'tired';
      } else {
        premiumLockGroup.visible = false;
      }

      // Update the React positions so the floating bubble tracks perfectly
      setBotPos({
        x: botX + window.innerWidth / 2,
        y: -(botY - window.innerHeight / 2) - 150, // Floating exactly above his head
      });

      // Magical Vortex Rotation Animation
      if (vortexActive) {
        vortexMat.opacity = THREE.MathUtils.lerp(vortexMat.opacity, 0.85, 0.1);
        vortexMesh.position.set(botX, botY, -1);
        vortexMesh.rotation.z += 0.08;
      } else {
        vortexMat.opacity = THREE.MathUtils.lerp(vortexMat.opacity, 0, 0.1);
      }

      // State Mechanics
      if (movementMode === 'tired') {
        targetY = -window.innerHeight / 2 + 75;
        botX += (targetX - botX) * 0.05;
        botY += (targetY - botY) * 0.05;

        leftShoulder.rotation.z = THREE.MathUtils.lerp(leftShoulder.rotation.z, -0.2, 0.1);
        rightShoulder.rotation.z = THREE.MathUtils.lerp(rightShoulder.rotation.z, 0.2, 0.1);
        leftElbow.rotation.z = THREE.MathUtils.lerp(leftElbow.rotation.z, -0.4, 0.1);
        rightElbow.rotation.z = THREE.MathUtils.lerp(rightElbow.rotation.z, 0.4, 0.1);
        leftHip.rotation.z = THREE.MathUtils.lerp(leftHip.rotation.z, -0.1, 0.1);
        rightHip.rotation.z = THREE.MathUtils.lerp(rightHip.rotation.z, 0.1, 0.1);

        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, 0.4, 0.1);
        mouth.scale.set(1.5, 1.2, 0.6);

        premiumLockGroup.rotation.y = elapsed * 1.5;
        premiumLockGroup.position.y = 95 + Math.sin(elapsed * 4) * 6;
      }
      else if (overrideActive) {
        // Direct flight command from Homepage triggers
        botX += (targetX - botX) * 0.15;
        botY += (targetY - botY) * 0.15;

        const flySpeed = 14;
        leftShoulder.rotation.z = Math.sin(elapsed * flySpeed) * 1.1;
        rightShoulder.rotation.z = -Math.cos(elapsed * flySpeed) * 1.1;
        leftHip.rotation.z = Math.cos(elapsed * flySpeed) * 0.7;
        rightHip.rotation.z = -Math.sin(elapsed * flySpeed) * 0.7;
      }
      else if (isDragging) {
        setBubbleText("WEEEEE! Dragging is fun! ✨🚀");
        const dragLerpFactor = premiumActive ? 0.35 : 0.22;
        botX += (targetX - botX) * dragLerpFactor;
        botY += (targetY - botY) * dragLerpFactor;

        const flailSpeed = premiumActive ? 25 : 16;
        leftShoulder.rotation.z = Math.sin(elapsed * flailSpeed) * 1.2;
        rightShoulder.rotation.z = Math.cos(elapsed * flailSpeed) * 1.2;
        leftElbow.rotation.z = -Math.abs(Math.sin(elapsed * flailSpeed)) * 1.5;
        rightElbow.rotation.z = -Math.abs(Math.cos(elapsed * flailSpeed)) * 1.5;

        leftHip.rotation.z = Math.cos(elapsed * flailSpeed) * 0.9;
        rightHip.rotation.z = Math.sin(elapsed * flailSpeed) * 0.9;

        headGroup.rotation.x = -0.3;
        mouth.scale.set(1.2, 1.2, 0.6);
      }
      else if (ropeThrowing) {
        movementMode = 'climbing_rope';
        setBubbleText("CLIMBING FOR GLORY! 🪢🏆");
        targetX = 0;

        for (let i = 0; i < ropeSegments; i++) {
          const seg = ropeSegmentMeshes[i];
          const ropeY = (window.innerHeight / 2) - (i * 45);
          seg.position.set(0, ropeY, -10);
        }

        if (Math.abs(botX - targetX) > 15 && climbRopeY <= -window.innerHeight / 2) {
          botX += (targetX - botX) * 0.15;
          botY = -window.innerHeight / 2 + 75;

          const runCycle = elapsed * 16;
          leftShoulder.rotation.z = Math.sin(runCycle) * 1.3;
          rightShoulder.rotation.z = -Math.sin(runCycle) * 1.3;
          leftHip.rotation.z = -Math.sin(runCycle) * 1.1;
          rightHip.rotation.z = Math.sin(runCycle) * 1.1;
        } else {
          if (climbRopeY <= -window.innerHeight / 2) {
            climbRopeY = botY;
          }

          climbRopeY += premiumActive ? 4.5 : 2.5;
          botX = 0;
          botY = climbRopeY;

          if (botY >= window.innerHeight / 2 - 100) {
            setRopeActive(false);
            climbRopeY = -window.innerHeight / 2;
          }

          const climbCycle = elapsed * 12;
          leftShoulder.rotation.z = Math.sin(climbCycle) * 1.4;
          rightShoulder.rotation.z = -Math.sin(climbCycle) * 1.4;
          leftElbow.rotation.z = -Math.abs(Math.cos(climbCycle)) * 1.2;
          rightElbow.rotation.z = -Math.abs(Math.sin(climbCycle)) * 1.2;
        }
      }
      else {
        for (let i = 0; i < ropeSegments; i++) {
          ropeSegmentMeshes[i].position.y = 9999;
        }

        const screenMarginBottom = -window.innerHeight / 2 + 75;
        const screenMarginLeft = -window.innerWidth / 2 + 40;
        const screenMarginRight = window.innerWidth / 2 - 40;
        const screenMarginTop = window.innerHeight / 2 - 80;

        if (movementMode === 'climbing_wall') {
          setBubbleText("Scaling the screen boundaries! 🧗‍♂️");
          botY += climbDirection * (premiumActive ? 6 : 3.5);
          botX = runDirection === 1 ? screenMarginRight : screenMarginLeft;

          if (botY >= screenMarginTop) {
            climbDirection = -1;
          } else if (botY <= screenMarginBottom) {
            climbDirection = 1;
            movementMode = 'running';
          }

          const climbCycle = elapsed * 10;
          leftShoulder.rotation.z = Math.sin(climbCycle) * 1.2;
          rightShoulder.rotation.z = -Math.sin(climbCycle) * 1.2;
        } else {
          movementMode = 'running';
          setBubbleText("Patrolling the edges of your dashboard! 🚀");
          botY = screenMarginBottom;
          botX += runDirection * (premiumActive ? 8 : 4.5);

          if (botX >= screenMarginRight) {
            botX = screenMarginRight;
            runDirection = -1;
            if (Math.random() > 0.4) {
              movementMode = 'climbing_wall';
              climbDirection = 1;
            }
          } else if (botX <= screenMarginLeft) {
            botX = screenMarginLeft;
            runDirection = 1;
            if (Math.random() > 0.4) {
              movementMode = 'climbing_wall';
              climbDirection = 1;
            }
          }

          const runCycle = elapsed * (premiumActive ? 18 : 11);
          leftShoulder.rotation.z = Math.sin(runCycle) * 1.2;
          rightShoulder.rotation.z = -Math.sin(runCycle) * 1.2;
          leftHip.rotation.z = -Math.sin(runCycle) * 1.0;
          rightHip.rotation.z = Math.sin(runCycle) * 1.0;
        }

        headGroup.rotation.x = 0;
        mouth.scale.set(1.0, 0.3, 0.6);
      }

      genieGroup.position.set(botX, botY, 0);

      if (isDragging) {
        const turnAngle = (targetX - botX) * 0.005;
        genieGroup.rotation.y = THREE.MathUtils.clamp(turnAngle, -Math.PI / 4, Math.PI / 4);
      } else if (movementMode === 'climbing_wall' || movementMode === 'climbing_rope' || overrideActive) {
        genieGroup.rotation.y = 0;
      } else {
        genieGroup.rotation.y = runDirection === 1 ? 0 : Math.PI;
      }

      // Trail Dots
      tempVec.set(botX, botY - 15, -2);
      trailHistory.unshift(tempVec.clone());
      if (trailHistory.length > trailLength) {
        trailHistory.pop();
      }

      for (let i = 0; i < trailLength; i++) {
        const dot = trailPool[i];
        if (i < trailHistory.length) {
          dot.position.copy(trailHistory[i]);

          const dotColor = premiumActive
            ? new THREE.Color().setHSL(0.12, 1.0, 0.5)
            : new THREE.Color().setHSL(0.55 + (i / trailLength) * 0.2, 1.0, 0.5);

          const mat = dot.material as THREE.MeshBasicMaterial;
          mat.color.copy(dotColor);
          mat.opacity = (1 - i / trailLength) * 0.9;
        } else {
          dot.position.set(9999, 9999, 0);
        }
      }

      // Sparks
      if (premiumActive) {
        sparks.forEach((spark, index) => {
          const theta = elapsed * 5 + (index / sparkCount) * Math.PI * 2;
          const radius = 45 + Math.sin(elapsed * 10 + index) * 15;
          spark.position.set(
            botX + Math.cos(theta) * radius,
            botY + Math.sin(theta) * radius + 15,
            10
          );
          spark.rotation.z = theta + Math.PI / 2;
          spark.visible = true;
        });
      } else {
        sparks.forEach(spark => spark.visible = false);
      }

      renderer.render(scene, camera);
      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousedown', handleGlobalMouseDown);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);

      if (overlayDiv && overlayDiv.contains(renderer.domElement)) {
        overlayDiv.removeChild(renderer.domElement);
      }
      renderer.dispose();
      torsoGeo.dispose();
      headGeo.dispose();
      hornGeo.dispose();
      eyeGeo.dispose();
      eyeMat.dispose();
      eyebrowGeo.dispose();
      mouthGeo.dispose();
      jointGeo.dispose();
      boneGeo.dispose();
      genieMat.dispose();
      goldMat.dispose();
      trailMat.dispose();
      ropeMat.dispose();
      vortexGeo.dispose();
      vortexMat.dispose();
      trailPool.forEach(dot => {
        dot.geometry.dispose();
        (dot.material as THREE.Material).dispose();
      });
      ropeSegmentMeshes.forEach(seg => {
        seg.geometry.dispose();
      });
    };
  }, []);

  const handleThrowRope = () => {
    if (energy <= 0 && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setRopeActive(true);
  };

  const unlockPremium = () => {
    setIsPremium(true);
    setEnergy(100);
    setShowPremiumModal(false);
    setBubbleText("SUPREME POWER MODE ACTIVATED! ⚡👑");
  };

  const castRechargeSpell = () => {
    setEnergy(100);
    setShowPremiumModal(false);
    setBubbleText("COSMIC RECHARGE CAST SUCCESSFULLY! 🔮");
  };

  return (
    <>
      <div className="w-full h-full flex items-center justify-center relative">
        <div ref={mountLocalRef} className="w-20 h-20 select-none cursor-pointer" />
      </div>

      {ReactDOM.createPortal(
        <div className="fixed inset-0 z-[10000] pointer-events-none">
          {/* Dynamic Floating HUD: Attached directly above the Bot's head */}
          <div
            className="absolute z-[10000] pointer-events-auto flex flex-col items-center space-y-2 transition-all duration-75 select-none"
            style={{
              left: `${botPos.x}px`,
              top: `${botPos.y}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {/* Elegant glassmorphic Speech Bubble */}
            <div className="px-3 py-2 rounded-2xl bg-black/90 border border-cyan-500/20 backdrop-blur-md shadow-lg max-w-[220px] text-center text-[10px] font-bold text-slate-100 flex items-center gap-1.5 animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{bubbleText}</span>
            </div>

            {/* Direct Bot HUD containing Energy + Action triggers */}
            <div className="p-3 rounded-2xl bg-black/90 border border-indigo-500/30 backdrop-blur-xl shadow-2xl flex flex-col space-y-2 w-48">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Energy</span>
                </span>
                <span className="text-[10px] font-bold text-white">{Math.round(energy)}%</span>
              </div>

              {/* Mini Energy bar */}
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5 relative">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isPremium
                      ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                      : energy > 30
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                      : 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                  }`}
                  style={{ width: `${energy}%` }}
                />
              </div>

              {/* Trigger Buttons */}
              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={handleThrowRope}
                  disabled={ropeActive}
                  className={`flex-grow py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all border ${
                    ropeActive
                      ? 'bg-slate-800/40 text-slate-500 border-transparent'
                      : 'bg-indigo-600/20 hover:bg-indigo-600/40 border-indigo-500/40 text-indigo-300 active:scale-95'
                  }`}
                >
                  {ropeActive ? '🪢 Clb...' : '🪢 Rope'}
                </button>

                <button
                  onClick={() => setShowPremiumModal(true)}
                  className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all flex items-center gap-1 border ${
                    isPremium
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                      : 'bg-yellow-600 hover:bg-yellow-500 text-black border-transparent active:scale-95'
                  }`}
                >
                  {isPremium ? <Sparkles className="w-3 h-3 text-yellow-400" /> : <Lock className="w-3 h-3 text-black" />}
                  <span>{isPremium ? 'PRO' : 'PRO'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Premium Power Modal pop-up window */}
          {showPremiumModal && (
            <div className="fixed inset-0 z-[10001] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 pointer-events-auto">
              <div className="w-full max-w-md rounded-3xl p-0.5 bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                <div className="bg-[#090912] rounded-[22px] p-8 text-center space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-pink-500 rounded-full flex items-center justify-center text-black mx-auto shadow-xl">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Unlock Supreme Power</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                      Jin's magical cosmic energy has limits! Unlock Premium Power Mode to experience limitless edge climbing, unlimited energy, golden path trails, and neon lightning aura!
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      onClick={unlockPremium}
                      className="w-full py-4 bg-gradient-to-r from-yellow-500 via-pink-500 to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4 text-black" />
                      <span>Unlock Premium Power ($0.00 / Free Sandbox)</span>
                    </button>

                    <button
                      onClick={castRechargeSpell}
                      className="w-full py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4 text-cyan-400" />
                      <span>Cast Spell to Recharge (100%)</span>
                    </button>

                    <button
                      onClick={() => setShowPremiumModal(false)}
                      className="text-xs text-slate-500 hover:text-slate-300 font-bold uppercase transition-colors pt-2 block mx-auto"
                    >
                      Keep Limited Sandbox Mode
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
