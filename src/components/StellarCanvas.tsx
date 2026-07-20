import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { StellarChart } from './StellarChart';
import { NebulaShader } from './NebulaShader';
import * as THREE from 'three';

// 1. パララックス効果を持つ多層星屑背景 (4,000点規模)
function Starfield() {
  const pointsRef1 = useRef<THREE.Points>(null);
  const pointsRef2 = useRef<THREE.Points>(null);
  const pointsRef3 = useRef<THREE.Points>(null);

  const [positions1] = useState(() => {
    const arr = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500 * 3; i++) arr[i] = (Math.random() - 0.5) * 150;
    return arr;
  });
  
  const [positions2] = useState(() => {
    const arr = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500 * 3; i++) arr[i] = (Math.random() - 0.5) * 180;
    return arr;
  });

  const [positions3] = useState(() => {
    const arr = new Float32Array(1000 * 3);
    for (let i = 0; i < 1000 * 3; i++) arr[i] = (Math.random() - 0.5) * 200;
    return arr;
  });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pointsRef1.current) pointsRef1.current.rotation.y = time * 0.003;
    if (pointsRef2.current) pointsRef2.current.rotation.y = -time * 0.0015;
    if (pointsRef3.current) pointsRef3.current.rotation.z = time * 0.001;
  });

  return (
    <group>
      <points ref={pointsRef1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions1, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#EDF2FB" transparent opacity={0.4} />
      </points>
      <points ref={pointsRef2}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions2, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.12} color="#8aebff" transparent opacity={0.7} />
      </points>
      <points ref={pointsRef3}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions3, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.16} color="#d0bcff" transparent opacity={0.85} />
      </points>
    </group>
  );
}

// 2. 背景シェーダー平面
function NebulaBackground() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, 0, -60]}>
      <planeGeometry args={[250, 250]} />
      <shaderMaterial
        ref={materialRef}
        args={[NebulaShader]}
        depthWrite={false}
      />
    </mesh>
  );
}

// 3. 3Dシーン制御 (カメラ位置の監視とフォグ、自動潜航アニメーション)
interface SceneSetupProps {
  onDepthChange: (depth: number) => void;
  descending: boolean;
  onDescendComplete: () => void;
}

function SceneSetup({ onDepthChange, descending, onDescendComplete }: SceneSetupProps) {
  const { scene, camera } = useThree();
  const lastDepth = useRef<number>(-1);
  
  useEffect(() => {
    scene.fog = new THREE.FogExp2('#050B18', 0.012);
    camera.position.set(0, 5, 26);
    camera.lookAt(0, 0, 0);
  }, [scene, camera]);

  useFrame((state) => {
    // 1. カメラ距離（深度）の計測とコールバック
    const dist = camera.position.length();
    // ズームインするほど深海へ潜る設定 (距離26m -> 0m、距離6m -> 2400m)
    const rawDepth = Math.max(0, Math.min(2400, Math.round((26 - dist) * 120)));
    const roundedDepth = Math.round(rawDepth / 50) * 50; // 50m単位に丸めて再描画を抑制
    
    if (roundedDepth !== lastDepth.current) {
      lastDepth.current = roundedDepth;
      onDepthChange(roundedDepth);
    }

    // 2. 潜航（Descend）ボタン押下時のカメラアニメーション (Lerp)
    if (descending) {
      camera.position.lerp(new THREE.Vector3(0, 1.5, 6.5), 0.04);
      camera.lookAt(0, 0, 0);
      if (camera.position.distanceTo(new THREE.Vector3(0, 1.5, 6.5)) < 0.2) {
        onDescendComplete();
      }
    }
  });

  return null;
}

// 記事データの型定義
export interface ArticleData {
  id: string;
  title: string;
  slug: string;
  status: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: number;
  difficulty: number;
  pos: { x: number; y: number; z: number };
  neighbors: string[];
}

interface StellarCanvasProps {
  initialArticles: ArticleData[];
}

export function StellarCanvas({ initialArticles }: StellarCanvasProps) {
  const [hoveredArticle, setHoveredArticle] = useState<ArticleData | null>(null);
  const [isLowPower, setIsLowPower] = useState(false);
  const [currentDepth, setCurrentDepth] = useState(0);
  const [descending, setDescending] = useState(false);

  useEffect(() => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const hasLowDPR = window.devicePixelRatio < 1.5;
    setIsLowPower(isMobile || hasLowDPR);
  }, []);

  // 深度に応じたレイヤー名定義
  const getLayerName = (depth: number) => {
    if (depth < 800) return 'Azure (Surface) - 表層';
    if (depth < 1600) return 'Twilight (Mid) - 薄暮層';
    return 'Midnight (Deep) - 深淵アビス';
  };

  return (
    <div className="relative w-full h-screen bg-[#050B18] overflow-hidden select-none">
      
      {/* Cinematic Film Grain Overlay */}
      <div className="film-grain"></div>

      {/* 3D Canvas */}
      <Canvas
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={isLowPower ? 1 : [1, 2]}
      >
        <color attach="background" args={['#050B18']} />
        
        <SceneSetup 
          onDepthChange={setCurrentDepth} 
          descending={descending} 
          onDescendComplete={() => setDescending(false)} 
        />
        
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <NebulaBackground />
        <Starfield />

        <StellarChart
          articles={initialArticles}
          onHover={setHoveredArticle}
        />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxDistance={40}
          minDistance={5.5}
        />

        {!isLowPower && (
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.1}
              luminanceSmoothing={0.95}
              height={300}
              intensity={1.5}
            />
          </EffectComposer>
        )}
      </Canvas>

      {/* 4. 左上: フローティンググラスモルフィックHUD (ホバー詳細) */}
      <div className="absolute top-6 left-6 pointer-events-none z-10 max-w-sm transition-all duration-300">
        <div className="p-6 bg-slate-950/70 border border-slate-800/80 rounded-xl backdrop-blur-md shadow-2xl text-slate-100">
          <h1 className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
            星海図 — Stellar Chart
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Navigating the knowledge cosmos
          </p>
          
          {hoveredArticle ? (
            <div className="mt-6 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider text-slate-950 ${
                  hoveredArticle.category === 'firebase' ? 'bg-[#F59E0B]' :
                  hoveredArticle.category === 'claude' ? 'bg-[#E07B54]' :
                  hoveredArticle.category === 'dl' ? 'bg-[#2DD4BF]' : 'bg-[#3B82F6]'
                }`}>
                  {hoveredArticle.category.toUpperCase()}
                </span>
                {hoveredArticle.status !== 'publish' && (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40">
                    DRAFT (MIST)
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold leading-snug text-white font-display">
                  {hoveredArticle.title}
                </h2>
                <p className="text-xs text-slate-400 line-clamp-3 mt-2 leading-relaxed">
                  {hoveredArticle.excerpt}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-slate-800/60 pt-3">
                <div>
                  <span className="text-slate-500">Stratum Z:</span>{' '}
                  <span className="text-indigo-300">{hoveredArticle.pos.z.toFixed(2)}m</span>
                </div>
                <div>
                  <span className="text-slate-500">Difficulty:</span>{' '}
                  <span className="text-sky-300">{'✦'.repeat(hoveredArticle.difficulty)}</span>
                </div>
              </div>
              
              <div className="text-[10px] text-slate-400/80 font-mono bg-slate-900/40 px-3 py-2 rounded border border-slate-800/40">
                Click star to travel to this Lighthouse page
              </div>
            </div>
          ) : (
            <div className="mt-6 text-sm text-slate-500 italic leading-relaxed">
              Hover over a star to inspect its metadata.<br />
              Drag to rotate the constellation sphere.
            </div>
          )}
        </div>
      </div>
      
      {/* 右上: 凡例（星座カテゴリ） */}
      <div className="absolute top-6 right-6 p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl backdrop-blur-md z-10 text-xs font-mono text-slate-300 space-y-2 pointer-events-none">
        <div className="text-slate-500 font-bold border-b border-slate-800/60 pb-1.5 mb-2">CONSTELLATIONS</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
          <span>Firebase</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E07B54]" />
          <span>Claude / LLM</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF]" />
          <span>Deep Learning</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
          <span>Default Star</span>
        </div>
      </div>

      {/* 5. 底部 HUD エリア (Stitchの深淵潜航デザインの完全再現) */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-10 pointer-events-none">
        
        {/* 左下: Stratification (階層凡例) */}
        <div className="bg-slate-950/70 backdrop-blur-md border border-slate-800/80 rounded-xl p-4 shadow-2xl flex flex-col gap-2 pointer-events-auto">
          <h3 class="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">Stratification</h3>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(138,235,255,0.8)]"></div>
            <span className="font-mono text-xs text-slate-200">Azure (Surface) - 表層</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(208,188,255,0.5)]"></div>
            <span className="font-mono text-xs text-slate-400">Twilight (Mid) - 薄暮層</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(208,188,255,0.3)]"></div>
            <span className="font-mono text-xs text-slate-500">Midnight (Deep) - 深層</span>
          </div>
        </div>

        {/* 中央下: Descend (自動潜航アクションボタン) */}
        <div 
          onClick={() => setDescending(true)}
          className="flex flex-col items-center gap-2 cursor-pointer group pointer-events-auto select-none"
        >
          <span className="font-mono text-xs text-primary tracking-[0.25em] uppercase group-hover:text-[#a2eeff] transition-colors duration-200">
            Descend (潜航)
          </span>
          <span className="font-bold text-lg text-primary animate-descend group-hover:text-[#a2eeff] transition-colors duration-200">
            ↓↓
          </span>
        </div>

        {/* 右下: Depth Indicator (リアルタイム深度計) */}
        <div className="flex items-center gap-4 bg-slate-950/70 backdrop-blur-md rounded-xl p-4 border border-slate-800/80 shadow-2xl pointer-events-auto">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">Depth</span>
            <span className="font-display font-bold text-2xl text-primary">{currentDepth}m</span>
            <span className="font-mono text-[10px] text-slate-400 mt-0.5">{getLayerName(currentDepth)}</span>
          </div>
          <div className="h-16 w-0.5 depth-line rounded-full relative">
            {/* 深度計の中を動くインジケータードット */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(138,235,255,0.8)] transition-all duration-200"
              style={{ top: `${(currentDepth / 2400) * 80}%` }}
            ></div>
          </div>
        </div>

      </div>

    </div>
  );
}
