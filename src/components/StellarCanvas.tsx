import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { StellarChart } from './StellarChart';
import { NebulaShader } from './NebulaShader';
import { MunchkinNavigator } from './MunchkinNavigator';
import { BoardingModal } from './BoardingModal';
import { auth, onAuthStateChanged } from '../lib/firebase-client';
import type { User } from 'firebase/auth';
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

// 3. 3Dシーン制御
interface SceneSetupProps {
  onDepthChange: (depth: number) => void;
  selectedStar: ArticleData | null;
  transitioning: boolean;
  onTransitionComplete: () => void;
  controlsRef: React.RefObject<any>;
}

function SceneSetup({ onDepthChange, selectedStar, transitioning, onTransitionComplete, controlsRef }: SceneSetupProps) {
  const { scene, camera } = useThree();
  const lastDepth = useRef<number>(-1);
  const transitionStartTime = useRef<number>(0);

  useEffect(() => {
    // 深海ブルーブラックの背景指数フォグ
    scene.fog = new THREE.FogExp2('#050B18', 0.015);
    camera.position.set(0, 5, 26);
    camera.lookAt(0, 0, 0);
  }, [scene]);

  useEffect(() => {
    if (transitioning) {
      transitionStartTime.current = performance.now();
    }
  }, [transitioning]);

  useFrame((state) => {
    const controls = controlsRef.current;

    if (selectedStar && controls && transitioning) {
      const targetPos = new THREE.Vector3(selectedStar.pos.x, selectedStar.pos.y, selectedStar.pos.z);
      
      controls.target.lerp(targetPos, 0.12);
      
      const camToTarget = new THREE.Vector3().subVectors(camera.position, controls.target);
      const dist = camToTarget.length();
      const desiredDist = 6.2;
      
      if (dist > 0.05) {
        const newDist = THREE.MathUtils.lerp(dist, desiredDist, 0.12);
        camToTarget.setLength(newDist);
        camera.position.copy(controls.target).add(camToTarget);
      }
      
      controls.update();

      const elapsed = performance.now() - transitionStartTime.current;
      if (elapsed > 180 && controls.target.distanceTo(targetPos) < 0.15 && Math.abs(dist - desiredDist) < 0.15) {
        onTransitionComplete();
      }
    }

    const dist = camera.position.length();
    const rawDepth = Math.max(0, Math.min(2400, Math.round((26 - dist) * 120)));
    const roundedDepth = Math.round(rawDepth / 50) * 50;
    
    if (roundedDepth !== lastDepth.current) {
      lastDepth.current = roundedDepth;
      onDepthChange(roundedDepth);
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
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedStar, setSelectedStar] = useState<ArticleData | null>(initialArticles[0] || null);
  const [transitioning, setTransitioning] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isLowPower, setIsLowPower] = useState<boolean>(false);
  const [currentDepth, setCurrentDepth] = useState<number>(0);
  const [isBoardingOpen, setIsBoardingOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const hasLowDPR = window.devicePixelRatio < 1.5;
    setIsLowPower(isMobile || hasLowDPR);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const getLayerName = (depth: number) => {
    if (depth < 800) return 'Azure (Surface) - 表層';
    if (depth < 1600) return 'Twilight (Mid) - 薄暮層';
    return 'Midnight (Deep) - 深層';
  };

  const handleStarClick = (article: ArticleData) => {
    const idx = initialArticles.findIndex(a => a.slug === article.slug);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
    setSelectedStar(article);
    setTransitioning(true);
  };

  const handleMoveStar = (step: number) => {
    if (initialArticles.length === 0) return;
    const newIdx = (currentIndex + step + initialArticles.length) % initialArticles.length;
    setCurrentIndex(newIdx);
    setSelectedStar(initialArticles[newIdx]);
    setTransitioning(true);
  };

  const handleResetFocus = () => {
    setSelectedStar(null);
    setTransitioning(false);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.object.position.set(0, 5, 26);
      controlsRef.current.update();
    }
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
          selectedStar={selectedStar}
          transitioning={transitioning}
          onTransitionComplete={() => setTransitioning(false)}
          controlsRef={controlsRef}
        />
        
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <NebulaBackground />
        <Starfield />

        <StellarChart
          articles={initialArticles}
          onHover={setHoveredArticle}
          activeFilter={activeFilter}
          selectedStar={selectedStar}
          onStarClick={handleStarClick}
        />

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.05}
          maxDistance={40}
          minDistance={5.5}
        />

        {!isLowPower && (
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.08}
              luminanceSmoothing={0.95}
              height={300}
              intensity={1.5}
            />
          </EffectComposer>
        )}
      </Canvas>

      {/* 4. 左上: フローティンググラスモルフィックHUD (固定サイズ w-[380px] & h-[450px]) */}
      <div className="absolute top-6 left-6 pointer-events-none z-10">
        <div className="w-[380px] h-[450px] p-6 bg-slate-950/75 border border-slate-800/80 rounded-xl backdrop-blur-md shadow-2xl text-slate-100 font-body flex flex-col justify-between">
          
          {/* ヘッダー ＆ Move Next Star 矢印ナビゲーション ＋ 乗船ボタン */}
          <div className="border-b border-slate-800/60 pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
                星海図 — Stellar Chart
              </h1>
              
              {/* 展望台・酒場・乗船（Boarding）ボタン */}
              <div className="flex items-center gap-1.5 pointer-events-auto">
                <a
                  href="/observatory"
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 font-mono text-[10px] rounded-lg transition-colors"
                  title="展望台 (Observatory)"
                >
                  展望台
                </a>
                <a
                  href="/tavern"
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-mono text-[10px] rounded-lg transition-colors"
                  title="星海酒場 (Stellar Tavern)"
                >
                  酒場
                </a>
                <button
                  onClick={() => setIsBoardingOpen(true)}
                  className="px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{user ? (user.displayName?.split(' ')[0] || 'Voyager') : '乗船'}</span>
                </button>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between bg-slate-900/80 border border-slate-800/90 rounded-lg px-3 py-1.5 pointer-events-auto">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Move Next Star
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveStar(-1)}
                  className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 font-bold rounded text-xs transition-colors cursor-pointer"
                  title="Previous Star (前の星へ)"
                >
                  ←
                </button>
                <span className="font-mono text-xs text-slate-200 font-bold px-1">
                  #{String(currentIndex + 1).padStart(2, '0')} <span className="text-slate-500 font-normal">/ {initialArticles.length}</span>
                </span>
                <button
                  onClick={() => handleMoveStar(1)}
                  className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 font-bold rounded text-xs transition-colors cursor-pointer"
                  title="Next Star (次の星へ)"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* メタデータ領域 */}
          {(() => {
            const active = hoveredArticle || selectedStar || initialArticles[currentIndex];
            if (!active) {
              return (
                <div className="flex-1 flex items-center justify-center text-sm text-slate-500 italic leading-relaxed text-center">
                  Hover over a star or click arrows to navigate.
                </div>
              );
            }
            const activeIdx = initialArticles.findIndex(a => a.slug === active.slug);
            const displayNum = activeIdx !== -1 ? `#${String(activeIdx + 1).padStart(2, '0')}` : `#${String(currentIndex + 1).padStart(2, '0')}`;

            return (
              <div className="flex-1 my-3 flex flex-col justify-between animate-fade-in pointer-events-auto overflow-hidden">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      {displayNum}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider text-slate-950 ${active.category === 'firebase' ? 'bg-[#F59E0B]' :
                      active.category === 'claude' ? 'bg-[#E07B54]' :
                        active.category === 'dl' ? 'bg-[#2DD4BF]' : 'bg-[#3B82F6]'
                      }`}>
                      {active.category.toUpperCase()}
                    </span>
                    {active.status !== 'publish' && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        DRAFT
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-base font-bold leading-snug text-white font-display line-clamp-2 h-[48px]">
                      {active.title}
                    </h2>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed h-[36px]">
                      {active.excerpt}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-slate-800/60 pt-2.5">
                  <div>
                    <span className="text-slate-500">Stratum Z:</span>{' '}
                    <span className="text-indigo-300">{active.pos.z.toFixed(2)}m</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Difficulty:</span>{' '}
                    <span className="text-sky-300">Level {active.difficulty}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ボタンエリア */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/60 flex-shrink-0 pointer-events-auto">
            {(() => {
              const active = hoveredArticle || selectedStar || initialArticles[currentIndex];
              return (
                <>
                  <a
                    href={active ? `/articles/${decodeURIComponent(active.slug)}` : '#'}
                    className="block w-full py-2 px-4 bg-primary hover:bg-sky-300 text-slate-950 font-bold font-display text-center rounded-lg transition-colors shadow-[0_0_15px_rgba(138,235,255,0.4)] pointer-events-auto text-xs"
                  >
                    go to star for reading →
                  </a>

                  <button
                    onClick={handleResetFocus}
                    className="w-full py-1.5 px-3 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-mono text-center rounded border border-slate-800/80 transition-colors pointer-events-auto cursor-pointer"
                  >
                    Reset Focus (フォーカス解除)
                  </button>
                </>
              );
            })()}
          </div>

        </div>
      </div>

      {/* 右上: 凡例（星座カテゴリ） */}
      <div className="absolute top-6 right-6 p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl backdrop-blur-md z-10 text-xs font-mono text-slate-300 space-y-2 pointer-events-auto select-none">
        <div className="text-slate-500 font-bold border-b border-slate-800/60 pb-2 flex flex-col gap-0.5">
          <span>CONSTELLATIONS</span>
          <span className="text-[9px] text-slate-500/80 font-normal normal-case italic">
            Click constellation to filter this
          </span>
        </div>
        
        <button
          onClick={() => setActiveFilter(null)}
          className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded transition-all cursor-pointer pointer-events-auto ${activeFilter === null ? 'bg-sky-500/20 text-[#38BDF8] font-bold border border-sky-500/30' : 'hover:bg-slate-900/60 text-slate-300'}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.6)] animate-pulse" />
          <span>All (全表示)</span>
        </button>
        
        <button
          onClick={() => setActiveFilter(activeFilter === 'firebase' ? null : 'firebase')}
          className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded transition-all cursor-pointer pointer-events-auto ${activeFilter === 'firebase' ? 'bg-[#F59E0B]/20 text-[#F59E0B] font-bold border border-[#F59E0B]/30' : 'hover:bg-slate-900/60 text-slate-300'}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
          <span>Firebase</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'claude' ? null : 'claude')}
          className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded transition-all cursor-pointer pointer-events-auto ${activeFilter === 'claude' ? 'bg-[#E07B54]/20 text-[#E07B54] font-bold border border-[#E07B54]/30' : 'hover:bg-slate-900/60 text-slate-300'}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#E07B54]" />
          <span>Claude / LLM</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'dl' ? null : 'dl')}
          className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded transition-all cursor-pointer pointer-events-auto ${activeFilter === 'dl' ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] font-bold border border-[#2DD4BF]/30' : 'hover:bg-slate-900/60 text-slate-300'}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF]" />
          <span>Deep Learning</span>
        </button>

        <button
          onClick={() => setActiveFilter(activeFilter === 'default' ? null : 'default')}
          className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded transition-all cursor-pointer pointer-events-auto ${activeFilter === 'default' ? 'bg-[#3B82F6]/20 text-[#3B82F6] font-bold border border-[#3B82F6]/30' : 'hover:bg-slate-900/60 text-slate-300'}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
          <span>Default Star</span>
        </button>
      </div>



      {/* 6. マンチカン航海士 AI RAG チャットボット・ウィジェット */}
      <MunchkinNavigator />

      {/* 7. 乗船手続き（Boarding）モーダル */}
      <BoardingModal
        isOpen={isBoardingOpen}
        onClose={() => setIsBoardingOpen(false)}
      />

    </div>
  );
}
