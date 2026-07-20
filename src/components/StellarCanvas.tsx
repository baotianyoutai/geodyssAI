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

  // 各層の星の位置を保持
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
    // 異なる超低速回転で視差（パララックス）効果を演出
    if (pointsRef1.current) pointsRef1.current.rotation.y = time * 0.003;
    if (pointsRef2.current) pointsRef2.current.rotation.y = -time * 0.0015;
    if (pointsRef3.current) pointsRef3.current.rotation.z = time * 0.001;
  });

  return (
    <group>
      {/* 遠景の微小星 */}
      <points ref={pointsRef1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions1, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#EDF2FB" transparent opacity={0.4} />
      </points>
      {/* 中景の青白い星 */}
      <points ref={pointsRef2}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions2, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.12} color="#8aebff" transparent opacity={0.7} />
      </points>
      {/* 近景のラベンダー色星 */}
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

// 3. アビス深度に連動するフォグとカメラ配置の自動調整
function SceneSetup() {
  const { scene, camera } = useThree();
  
  useEffect(() => {
    // 深度アビス感を出すためのフォグ設定 (奥ほど紺から黒へ収束)
    scene.fog = new THREE.FogExp2('#050B18', 0.012);
    
    // カメラの初期視野方向調整
    camera.position.set(0, 5, 25);
    camera.lookAt(0, 0, 0);
  }, [scene, camera]);

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

  useEffect(() => {
    // モバイルや低性能デバイスでポストエフェクト (Bloom) を無効にするフォールバック判定
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const hasLowDPR = window.devicePixelRatio < 1.5;
    setIsLowPower(isMobile || hasLowDPR);
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#050B18] overflow-hidden select-none">
      
      {/* 3D Canvas */}
      <Canvas
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={isLowPower ? 1 : [1, 2]}
      >
        {/* 背景色を設定 */}
        <color attach="background" args={['#050B18']} />
        
        <SceneSetup />
        
        {/* 環境光と指向性ライト */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* 背景演出 */}
        <NebulaBackground />
        <Starfield />

        {/* メイン3Dマップ */}
        <StellarChart
          articles={initialArticles}
          onHover={setHoveredArticle}
        />

        {/* コントロール */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxDistance={45}
          minDistance={5}
        />

        {/* ポストエフェクト (Bloom効果による星の発光) */}
        {!isLowPower && (
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.15}
              luminanceSmoothing={0.9}
              height={300}
              intensity={1.2}
            />
          </EffectComposer>
        )}
      </Canvas>

      {/* 4. フローティンググラスモルフィックHUD (ホバーした星の詳細表示) */}
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
                  hoveredArticle.category === 'firebase' ? 'bg-amber-400' :
                  hoveredArticle.category === 'claude' ? 'bg-orange-400' :
                  hoveredArticle.category === 'dl' ? 'bg-teal-400' : 'bg-sky-400'
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
                  <span className="text-slate-500">Depth (Z):</span>{' '}
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
            <div className="mt-6 text-sm text-slate-500 italic">
              Hover over a star to inspect its metadata.<br />
              Drag to rotate the constellation sphere.
            </div>
          )}
        </div>
      </div>
      
      {/* 右上の凡例（星座カテゴリ） */}
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
    </div>
  );
}
