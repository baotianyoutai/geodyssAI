import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html, Billboard } from '@react-three/drei';
import type { ArticleData } from './StellarCanvas';
import * as THREE from 'three';

const CATEGORY_COLORS: Record<string, string> = {
  firebase: '#F59E0B',
  claude: '#E07B54',
  dl: '#2DD4BF',
  default: '#3B82F6'
};

const NEBULA_AURA_COLORS: Record<string, string> = {
  firebase: '#8B5CF6',
  claude: '#EC4899',
  dl: '#3B82F6',
  default: '#8B5CF6'
};

function computeMST(nodes: ArticleData[]): [THREE.Vector3, THREE.Vector3][] {
  if (nodes.length <= 1) return [];
  const connections: [THREE.Vector3, THREE.Vector3][] = [];
  const visited = new Set<number>();
  visited.add(0);
  const points = nodes.map(n => new THREE.Vector3(n.pos.x, n.pos.y, n.pos.z));

  while (visited.size < nodes.length) {
    let minDist = Infinity;
    let nextNode = -1;
    let fromNode = -1;

    for (const u of visited) {
      for (let v = 0; v < nodes.length; v++) {
        if (visited.has(v)) continue;
        const dist = points[u].distanceTo(points[v]);
        if (dist < minDist) {
          minDist = dist;
          nextNode = v;
          fromNode = u;
        }
      }
    }

    if (nextNode !== -1) {
      connections.push([points[fromNode], points[nextNode]]);
      visited.add(nextNode);
    } else {
      break;
    }
  }
  return connections;
}

const StarShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorStellar: { value: new THREE.Color('#22D3EE') },
    uColorNebula: { value: new THREE.Color('#8B5CF6') },
    uSeed: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColorStellar;
    uniform vec3 uColorNebula;
    uniform float uSeed;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1 + uSeed, 311.7 + uSeed))) * 43758.5453123);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
        vec2 uv = vUv - 0.5;
        float dist = length(uv);
        
        if (dist > 0.5) {
            discard;
        }

        float d = dist * 2.0;
        
        float core = 1.0 - smoothstep(0.0, 0.06, d);
        float glow = exp(-d * 7.5) * 0.9;
        
        float n = noise(uv * 12.0 + uTime * 0.6);
        float aura = exp(-d * 3.5) * n * 0.55;
        
        float pulse = 0.85 + 0.15 * sin(uTime * 2.5 + hash(uv + uSeed) * 6.28);
        
        vec3 color = uColorStellar * (core + glow * pulse);
        color += uColorNebula * aura * pulse;
        
        float alpha = (glow + core + aura) * pulse;
        alpha = clamp(alpha, 0.0, 1.0);
        
        gl_FragColor = vec4(color, alpha);
    }
  `
};

interface StarNodeProps {
  article: ArticleData;
  starNumber: number;
  isHovered: boolean;
  isAnyHovered: boolean;
  isDimmed: boolean;
  isSelected: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}

function StarNode({ article, starNumber, isHovered, isAnyHovered, isDimmed, isSelected, onPointerOver, onPointerOut, onClick }: StarNodeProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const selectedRingRef = useRef<THREE.Mesh>(null);
  const mistRef = useRef<THREE.Points>(null);
  const starPosRef = useRef<THREE.Vector3>(new THREE.Vector3(article.pos.x, article.pos.y, article.pos.z));
  
  const stellarColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.default;
  const nebulaColor = NEBULA_AURA_COLORS[article.category] || NEBULA_AURA_COLORS.default;
  const isDraft = article.status !== 'publish';

  const baseScale = 1.0 + (article.readingTime * 0.1);
  const seed = useMemo(() => Math.random() * 100.0, []);

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uColorStellar: { value: new THREE.Color(stellarColor) },
      uColorNebula: { value: new THREE.Color(nebulaColor) },
      uSeed: { value: seed }
    };
  }, [stellarColor, nebulaColor, seed]);

  const mistParticles = useMemo(() => {
    if (!isDraft) return null;
    const count = 35;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const dist = 0.8 + Math.random() * 0.6;
      positions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = dist * Math.cos(phi);
    }
    return positions;
  }, [isDraft]);

  // 💡 useFrame 内で毎フレーム「カメラ座標とこの星の距離」を動的にリアルタイム計算！
  // カメラでズームイン・アウトするたびに、近寄った星は輝き、離れた星はリアルタイムに段々暗くなる減光グラデーション！
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const distToCam = state.camera.position.distanceTo(starPosRef.current);
    
    // カメラ距離(distToCam)に応じたリアルタイム減光倍率 (6m=2.2x 眩しい, 18m=1.3x 明るい, 35m=0.15x 暗い微光)
    const distanceDimming = THREE.MathUtils.clamp(1.8 - (distToCam - 15.0) / 10.0, 0.15, 2.2);

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      
      if (isDimmed) {
        materialRef.current.uniforms.uColorStellar.value.set(stellarColor).multiplyScalar(0.12);
      } else if (isSelected) {
        materialRef.current.uniforms.uColorStellar.value.set(stellarColor).multiplyScalar(2.5);
      } else if (isHovered) {
        materialRef.current.uniforms.uColorStellar.value.set(stellarColor).multiplyScalar(2.0);
      } else {
        // 💡 リアルタイムにカメラズーム連動で減光グラデーション輝度を適用！
        materialRef.current.uniforms.uColorStellar.value.set(stellarColor).multiplyScalar(distanceDimming);
      }
    }

    if (selectedRingRef.current) {
      selectedRingRef.current.rotation.z = time * 0.4;
    }

    if (mistRef.current) {
      mistRef.current.rotation.y = time * 0.15;
      mistRef.current.rotation.x = time * 0.08;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick();
  };

  const scaleMultiplier = isHovered ? 1.5 : (isAnyHovered ? 0.75 : 1.0);
  const currentScale = baseScale * (isSelected ? 1.8 : scaleMultiplier);
  const numStr = `#${String(starNumber).padStart(2, '0')}`;

  return (
    <group position={[article.pos.x, article.pos.y, article.pos.z]}>
      <Billboard follow={true}>
        <mesh
          onClick={isDimmed ? undefined : handleClick}
          onPointerOver={isDimmed ? undefined : onPointerOver}
          onPointerOut={isDimmed ? undefined : onPointerOut}
          scale={[currentScale, currentScale, 1]}
        >
          <planeGeometry args={[1.5, 1.5]} />
          <shaderMaterial
            ref={materialRef}
            vertexShader={StarShader.vertexShader}
            fragmentShader={StarShader.fragmentShader}
            uniforms={uniforms}
            transparent={true}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* 選択中の星の周囲にロックオンリングを表示 */}
        {isSelected && (
          <mesh ref={selectedRingRef} scale={[currentScale, currentScale, 1]}>
            <ringGeometry args={[0.82, 0.9, 32]} />
            <meshBasicMaterial
              color={stellarColor}
              transparent={true}
              opacity={0.85}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}
      </Billboard>

      {/* 除外されていない星のみホバーテキストを表示（番号付き） */}
      {isHovered && !isDimmed && (
        <Html distanceFactor={8} zIndexRange={[10, 20]} center>
          <div className="px-3 py-1.5 bg-slate-950/90 border border-slate-700/80 rounded-md text-[11px] font-display font-bold text-white whitespace-nowrap shadow-xl backdrop-blur-sm pointer-events-none select-none flex items-center gap-2">
            <span className="text-primary font-mono">{numStr}</span>
            <span>{article.title}</span>
          </div>
        </Html>
      )}

      {isDraft && mistParticles && (
        <points ref={mistRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[mistParticles, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.07}
            color="#93A1BE"
            transparent
            opacity={isDimmed ? 0.08 : 0.4}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
}

interface StellarChartProps {
  articles: ArticleData[];
  onHover: (article: ArticleData | null) => void;
  activeFilter: string | null;
  selectedStar: ArticleData | null;
  onStarClick: (article: ArticleData) => void;
}

export function StellarChart({ articles, onHover, activeFilter, selectedStar, onStarClick }: StellarChartProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const processedArticles = useMemo(() => {
    const list = JSON.parse(JSON.stringify(articles)) as ArticleData[];
    
    list.forEach(art => {
      const diff = art.difficulty;
      if (diff <= 2) {
        art.pos.z = art.pos.z + 8.5;
      } else if (diff >= 4) {
        art.pos.z = art.pos.z - 8.5;
      }
    });

    const minDistance = 2.4;
    for (let iter = 0; iter < 12; iter++) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const dx = list[i].pos.x - list[j].pos.x;
          const dy = list[i].pos.y - list[j].pos.y;
          const dz = list[i].pos.z - list[j].pos.z;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < minDistance) {
            const overlap = minDistance - dist;
            const forceX = (dx / (dist || 1)) * (overlap * 0.5);
            const forceY = (dy / (dist || 1)) * (overlap * 0.5);
            const forceZ = (dz / (dist || 1)) * (overlap * 0.5);
            list[i].pos.x += forceX;
            list[i].pos.y += forceY;
            list[i].pos.z += forceZ;
            list[j].pos.x -= forceX;
            list[j].pos.y -= forceY;
            list[j].pos.z -= forceZ;
          }
        }
      }
    }
    return list;
  }, [articles]);

  const groupedArticles = useMemo(() => {
    const groups: Record<string, ArticleData[]> = {};
    processedArticles.forEach(art => {
      if (art.status !== 'publish' && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return;
      }
      const cat = art.category || 'default';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(art);
    });
    return groups;
  }, [processedArticles]);

  const constellationLines = useMemo(() => {
    const lines: { category: string; color: string; segments: [THREE.Vector3, THREE.Vector3][] }[] = [];
    Object.entries(groupedArticles).forEach(([cat, nodes]) => {
      const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
      const segments = computeMST(nodes);
      lines.push({ category: cat, color, segments });
    });
    return lines;
  }, [groupedArticles]);

  const hoveredArticle = useMemo(() => {
    return processedArticles.find(art => art.slug === hoveredSlug) || null;
  }, [hoveredSlug, processedArticles]);

  const neighborLines = useMemo(() => {
    if (!hoveredArticle || !hoveredArticle.neighbors) return [];
    
    const lines: [number, number, number][][] = [];
    const startPoint = hoveredArticle.pos;

    hoveredArticle.neighbors.forEach(nSlug => {
      const target = processedArticles.find(art => art.slug === nSlug);
      if (target) {
        lines.push([
          [startPoint.x, startPoint.y, startPoint.z],
          [target.pos.x, target.pos.y, target.pos.z]
        ]);
      }
    });
    return lines;
  }, [hoveredArticle, processedArticles]);

  return (
    <group>
      {/* 1. 星座線 */}
      {constellationLines.map((group, gIdx) => {
        const isLineDimmed = activeFilter !== null && group.category !== activeFilter;
        return group.segments.map((seg, sIdx) => (
          <Line
            key={`const-line-${gIdx}-${sIdx}`}
            points={[seg[0], seg[1]]}
            color={group.color}
            lineWidth={0.6}
            transparent
            opacity={isLineDimmed ? 0.02 : 0.18}
          />
        ));
      })}

      {/* 2. 光の糸 */}
      {neighborLines.map((points, idx) => (
        <Line
          key={`neighbor-line-${idx}`}
          points={points.map(p => new THREE.Vector3(p[0], p[1], p[2]))}
          color="#8aebff"
          lineWidth={2.0}
          transparent
          opacity={0.8}
        />
      ))}

      {/* 3. 各星の描画（リアルタイム・カメラズーム連動減光グラデーション付き） */}
      {processedArticles.map((art, index) => {
        const isDimmed = activeFilter !== null && art.category !== activeFilter;
        return (
          <StarNode
            key={art.slug}
            article={art}
            starNumber={index + 1}
            isHovered={hoveredSlug === art.slug}
            isAnyHovered={hoveredSlug !== null}
            isDimmed={isDimmed}
            isSelected={selectedStar?.slug === art.slug}
            onPointerOver={() => {
              setHoveredSlug(art.slug);
              onHover(art);
            }}
            onPointerOut={() => {
              setHoveredSlug(null);
              onHover(null);
            }}
            onClick={() => {
              onStarClick(art);
            }}
          />
        );
      })}
    </group>
  );
}
