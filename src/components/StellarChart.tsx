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
  isHovered: boolean;
  isAnyHovered: boolean;
  isDimmed: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

function StarNode({ article, isHovered, isAnyHovered, isDimmed, onPointerOver, onPointerOut }: StarNodeProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mistRef = useRef<THREE.Points>(null);

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

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;

      // 💡 フィルターによって除外されている星は輝度を大幅に下げる
      if (isDimmed) {
        materialRef.current.uniforms.uColorStellar.value.set(stellarColor).multiplyScalar(0.2);
      } else {
        materialRef.current.uniforms.uColorStellar.value.set(stellarColor);
      }
    }

    if (mistRef.current) {
      mistRef.current.rotation.y = time * 0.15;
      mistRef.current.rotation.x = time * 0.08;
    }
  });

  const handleClick = () => {
    window.location.href = `/articles/${decodeURIComponent(article.slug)}`;
  };

  // 💡 フィルターによって除外されている星は極小スケールにする
  let scaleMultiplier = isHovered ? 1.5 : (isAnyHovered ? 0.75 : 1.0);
  if (isDimmed) {
    scaleMultiplier = 0.35;
  }
  const currentScale = baseScale * scaleMultiplier;

  return (
    <group position={[article.pos.x, article.pos.y, article.pos.z]}>
      <Billboard follow={true}>
        <mesh
          // 💡 除外されている星はクリック・ホバーイベントを無効化
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
      </Billboard>

      {/* 除外されていない星のみホバーテキストを表示 */}
      {isHovered && !isDimmed && (
        <Html distanceFactor={8} zIndexRange={[10, 20]} center>
          <div className="px-3 py-1.5 bg-slate-950/90 border border-slate-700/80 rounded-md text-[11px] font-display font-bold text-white whitespace-nowrap shadow-xl backdrop-blur-sm pointer-events-none select-none">
            {article.title}
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
            opacity={isDimmed ? 0.08 : 0.5}
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
}

export function StellarChart({ articles, onHover, activeFilter }: StellarChartProps) {
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
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
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
      {/* 1. 星座線 (アクティブなフィルターと異なるカテゴリーは極薄にする) */}
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

      {/* 3. 各星の描画 */}
      {processedArticles.map(art => {
        const isDimmed = activeFilter !== null && art.category !== activeFilter;
        return (
          <StarNode
            key={art.slug}
            article={art}
            isHovered={hoveredSlug === art.slug}
            isAnyHovered={hoveredSlug !== null}
            isDimmed={isDimmed}
            onPointerOver={() => {
              setHoveredSlug(art.slug);
              onHover(art);
            }}
            onPointerOut={() => {
              setHoveredSlug(null);
              onHover(null);
            }}
          />
        );
      })}
    </group>
  );
}
