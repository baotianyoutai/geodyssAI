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

// 1. 標準の星用GLSLシェーダー
const StarShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorStellar: { value: new THREE.Color('#22D3EE') },
    uColorNebula: { value: new THREE.Color('#8B5CF6') },
    uSeed: { value: 0.0 },
    uIntensity: { value: 1.0 },
    uOpacity: { value: 1.0 }
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
    uniform float uIntensity;
    uniform float uOpacity;

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
        
        color *= uIntensity;
        
        float alpha = (glow + core + aura) * pulse * uOpacity;
        alpha = clamp(alpha, 0.0, 1.0);
        
        gl_FragColor = vec4(color, alpha);
    }
  `
};

// 💡 2. Draft（未公開）記事専用の、幻想的でリアルなプロシージャル雲シェーダー (fBm Cloud Turbulence)
const DraftCloudShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorInner: { value: new THREE.Color('#38BDF8') },
    uColorOuter: { value: new THREE.Color('#C084FC') }
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
    uniform vec3 uColorInner;
    uniform vec3 uColorOuter;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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

    float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 4; ++i) {
            v += a * noise(p);
            p = rot * p * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    void main() {
        vec2 uv = (vUv - 0.5) * 2.0;
        float r = length(uv);
        if (r > 1.0) discard;

        // うねる幻想的な雲の流れ (Cloud motion)
        vec2 q = vec2(0.0);
        q.x = fbm(uv + 0.12 * uTime);
        q.y = fbm(uv + vec2(1.0) + 0.08 * uTime);

        vec2 r_pos = vec2(0.0);
        r_pos.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * uTime);
        r_pos.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * uTime);

        float f = fbm(uv + r_pos);

        // 雲の端の自然な輪郭減衰
        float cloudEdge = smoothstep(1.0, 0.1, r);
        float density = smoothstep(0.18, 0.75, f) * cloudEdge;

        vec3 cloudColor = mix(uColorInner, uColorOuter, clamp(f * f * 3.5, 0.0, 1.0));
        cloudColor = mix(cloudColor, vec3(0.9, 0.95, 1.0), clamp(length(q), 0.0, 1.0));

        gl_FragColor = vec4(cloudColor, density * 0.85);
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
  const draftCloudRef = useRef<THREE.ShaderMaterial>(null);
  const selectedRingRef = useRef<THREE.Mesh>(null);
  
  const stellarColor = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.default;
  const nebulaColor = NEBULA_AURA_COLORS[article.category] || NEBULA_AURA_COLORS.default;
  const isDraft = article.status !== 'publish';

  const baseScale = 1.0 + (article.readingTime * 0.1);
  const seed = useMemo(() => Math.random() * 100.0, []);

  // Z軸階層位置に応じた減光グラデーション
  const normZ = useMemo(() => THREE.MathUtils.clamp((article.pos.z + 10.0) / 20.0, 0.0, 1.0), [article.pos.z]);
  const layerIntensity = useMemo(() => 0.01 + 3.49 * Math.pow(normZ, 3.0), [normZ]);
  const layerOpacity = useMemo(() => 0.05 + 0.95 * Math.pow(normZ, 2.0), [normZ]);
  const layerScale = useMemo(() => 0.30 + 1.10 * normZ, [normZ]);

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uColorStellar: { value: new THREE.Color(stellarColor) },
      uColorNebula: { value: new THREE.Color(nebulaColor) },
      uSeed: { value: seed },
      uIntensity: { value: layerIntensity },
      uOpacity: { value: layerOpacity }
    };
  }, [stellarColor, nebulaColor, seed, layerIntensity, layerOpacity]);

  const draftCloudUniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uColorInner: { value: new THREE.Color('#38BDF8') },
      uColorOuter: { value: new THREE.Color('#C084FC') }
    };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      
      let intensity = layerIntensity;
      let opacity = layerOpacity;

      if (isDimmed) {
        intensity = 0.02;
        opacity = 0.05;
      } else if (isSelected) {
        intensity = 3.5;
        opacity = 1.0;
      } else if (isHovered) {
        intensity = 2.5;
        opacity = 1.0;
      }

      materialRef.current.uniforms.uIntensity.value = intensity;
      materialRef.current.uniforms.uOpacity.value = opacity;
    }

    // 💡 Draft専用雲シェーダーの時間進行
    if (draftCloudRef.current) {
      draftCloudRef.current.uniforms.uTime.value = time;
    }

    if (selectedRingRef.current) {
      selectedRingRef.current.rotation.z = time * 0.4;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick();
  };

  const scaleMultiplier = (isHovered ? 1.5 : (isAnyHovered ? 0.75 : 1.0)) * layerScale;
  const currentScale = baseScale * (isSelected ? 1.8 : scaleMultiplier);
  const numStr = `#${String(starNumber).padStart(2, '0')}`;

  return (
    <group position={[article.pos.x, article.pos.y, article.pos.z]}>
      <Billboard follow={true}>
        
        {/* 💡 Draft（未公開）の星だけに覆いかぶさるリアルで幻想的な3Dプロシージャル雲 */}
        {isDraft && (
          <mesh scale={[currentScale * 2.3, currentScale * 2.3, 1]}>
            <planeGeometry args={[1.5, 1.5]} />
            <shaderMaterial
              ref={draftCloudRef}
              vertexShader={DraftCloudShader.vertexShader}
              fragmentShader={DraftCloudShader.fragmentShader}
              uniforms={draftCloudUniforms}
              transparent={true}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* 主体となる星のメッシュ */}
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

      {/* 3. 各星の描画（Draft専用 リアル・幻想的プロシージャル雲付き） */}
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
