import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface PortfolioNode {
  z: number;
  depthLabel: string;
  title: string;
  category: string;
  description: string;
  skills: string[];
  color: string;
}

const PORTFOLIO_NODES: PortfolioNode[] = [
  {
    z: 10,
    depthLabel: "DEPTH 0m — SURFACE",
    title: "Yuta — AI Systems Architect & Voyager",
    category: "CAPTAIN PROFILE",
    description: "Generative AI, Agentic Systems, and WebGL 3D Visualization Engineer. Crafting intuitive, AI-native interactive experiences.",
    skills: ["AI Agents", "RAG Systems", "Astro", "React Three Fiber", "Firebase"],
    color: "#38BDF8"
  },
  {
    z: -15,
    depthLabel: "DEPTH 15m — MESOPELAGIC",
    title: "AI Agent & Multimodal RAG Systems",
    category: "CORE ARCHITECTURE",
    description: "Building production RAG pipelines with Gemini 1.5 Flash, ChromaDB vector databases, and Google Agent Development Kit (ADK).",
    skills: ["Gemini API", "ChromaDB", "ADK", "Python", "Vector Embeddings"],
    color: "#818CF8"
  },
  {
    z: -40,
    depthLabel: "DEPTH 40m — BATHYPELAGIC",
    title: "Specification-Driven Development (SDD)",
    category: "METHODOLOGY",
    description: "Pioneering SDD workflows where human specifies requirements (DESIGN.md / AGENT.md) and AI agents execute code reliably.",
    skills: ["SDD", "Stitch MCP", "Antigravity", "Architecture Decision Records"],
    color: "#C084FC"
  },
  {
    z: -70,
    depthLabel: "DEPTH 70m — ABYSSAL ZONE",
    title: "3D WebGL & High-Performance UI",
    category: "VISUAL ENGINEERING",
    description: "Developing 3D space visualizers, custom GLSL shaders, bloom post-processing, and interactive WebGL canvas applications.",
    skills: ["Three.js", "GLSL Shaders", "Tailwind CSS", "TypeScript"],
    color: "#F472B6"
  }
];

// R3F 3D Node Sphere
function NodeMesh({ node, isCurrent }: { node: PortfolioNode; isCurrent: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={[0, 0, node.z]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={isCurrent ? 1.2 : 0.4}
          wireframe
        />
      </mesh>
      {/* 3D Label */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.6}
        color={node.color}
        anchorX="center"
        anchorY="middle"
      >
        {node.title}
      </Text>
    </group>
  );
}

// 3D Camera Controls smoothly moving Z-axis
function CameraRig({ targetZ }: { targetZ: number }) {
  const { camera } = useThree();

  useFrame((state, delta) => {
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ + 12, delta * 3);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0, delta * 3);
    camera.lookAt(0, 0, targetZ);
  });

  return null;
}

export function CaptainAbyssView() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
  }, []);

  const currentNode = PORTFOLIO_NODES[currentIndex];
  const targetZ = currentNode.z;

  const handleNextDepth = () => {
    setCurrentIndex(prev => (prev + 1) % PORTFOLIO_NODES.length);
  };

  const handlePrevDepth = () => {
    setCurrentIndex(prev => (prev - 1 + PORTFOLIO_NODES.length) % PORTFOLIO_NODES.length);
  };

  return (
    <div className="relative w-full h-[85vh] rounded-2xl overflow-hidden border border-slate-800 bg-[#02040A] text-slate-100 font-sans shadow-2xl">
      
      {/* 3D WebGL Canvas */}
      {!reducedMotion ? (
        <Canvas className="w-full h-full">
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          
          <CameraRig targetZ={targetZ} />

          {PORTFOLIO_NODES.map((node, idx) => (
            <NodeMesh key={idx} node={node} isCurrent={idx === currentIndex} />
          ))}
        </Canvas>
      ) : (
        <div className="w-full h-full flex items-center justify-center p-8 bg-slate-950 text-slate-400 font-mono text-xs">
          (Reduced motion mode activated: 3D camera animations disabled)
        </div>
      )}

      {/* HUD 深度計 (Depth Indicator) */}
      <div className="absolute top-4 left-4 z-20 p-3 bg-slate-950/80 border border-slate-800 rounded-xl backdrop-blur-md font-mono text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-bold tracking-wider">DEPTH INDICATOR</span>
        </div>
        <div className="text-sky-300 text-sm font-bold">
          {currentNode.depthLabel}
        </div>
        <div className="text-[10px] text-slate-500">
          Z-AXIS: {targetZ}m
        </div>
      </div>

      {/* 潜航コントローラー (Descend Controls) */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={handlePrevDepth}
          className="px-3 py-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 transition-colors cursor-pointer"
        >
          ▲ ASCEND
        </button>
        <button
          onClick={handleNextDepth}
          className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-all shadow-[0_0_15px_rgba(56,189,248,0.4)] cursor-pointer"
        >
          ▼ DESCEND ABYSS (潜航)
        </button>
      </div>

      {/* ボトム情報カード */}
      <div className="absolute bottom-4 left-4 right-4 z-20 p-6 bg-slate-950/90 border border-slate-800 rounded-2xl backdrop-blur-md max-w-2xl mx-auto space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
            {currentNode.category}
          </span>
          <span className="text-xs font-mono text-slate-500">
            {currentIndex + 1} / {PORTFOLIO_NODES.length} NODES
          </span>
        </div>

        <h3 className="text-lg md:text-xl font-bold font-display text-white" style={{ color: currentNode.color }}>
          {currentNode.title}
        </h3>

        <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-body">
          {currentNode.description}
        </p>

        {/* スキルタグ */}
        <div className="flex flex-wrap gap-2 pt-1">
          {currentNode.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300"
            >
              #{skill}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
