import React, { useState, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import type { ArticleData } from './StellarCanvas';
import * as THREE from 'three';

// カテゴリ別のカラーマッピング
const CATEGORY_COLORS: Record<string, string> = {
  firebase: '#F59E0B',    // constellation-firebase
  claude: '#E07B54',      // constellation-claude
  dl: '#2DD4BF',          // constellation-dl
  default: '#3B82F6'      // default blue
};

interface StellarChartProps {
  articles: ArticleData[];
  onHover: (article: ArticleData | null) => void;
}

// プリム法による最小全域木 (MST: Minimum Spanning Tree) 計算
// 同一カテゴリ（星座）の星を効率よく、かつ美しく接続します
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

// 個別の星コンポーネント
interface StarNodeProps {
  article: ArticleData;
  isHovered: boolean;
  isAnyHovered: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

function StarNode({ article, isHovered, isAnyHovered, onPointerOver, onPointerOut }: StarNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const mistRef = useRef<THREE.Points>(null);
  const color = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.default;
  const isDraft = article.status !== 'publish';

  // 難易度と閲覧時間に応じて星の基本サイズを調整
  const baseScale = 0.35 + (article.readingTime * 0.05);

  // 下書き（Draft）記事の周りに漂う「霧（Mist）」のパーティクルデータを生成
  const mistParticles = useMemo(() => {
    if (!isDraft) return null;
    const count = 30;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // 星の周囲にランダム散布
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const dist = 0.5 + Math.random() * 0.5; // 半径
      positions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = dist * Math.cos(phi);
    }
    return positions;
  }, [isDraft]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // 1. 星屑自体の呼吸（Twinkle/瞬き）アニメーション
    if (meshRef.current) {
      const twinkle = Math.sin(time * 2 + article.pos.x) * 0.12;
      // 他の星がホバーされている間は、目立たないように少し縮小/減光
      const hoverMultiplier = isHovered ? 1.4 : (isAnyHovered ? 0.75 : 1.0);
      meshRef.current.scale.setScalar((baseScale + twinkle) * hoverMultiplier);
    }

    // 2. Draft記事の「霧（Mist）」パーティクル低速回転
    if (mistRef.current) {
      mistRef.current.rotation.y = time * 0.2;
      mistRef.current.rotation.x = time * 0.1;
    }
  });

  const handleClick = () => {
    window.location.href = `/articles/${decodeURIComponent(article.slug)}`;
  };

  return (
    <group position={[article.pos.x, article.pos.y, article.pos.z]}>
      {/* 発光する星本体 */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 2.5 : 1.2}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* ホバー時の2Dテキストタイトルポップアップ (Html Drei) */}
      {isHovered && (
        <Html distanceFactor={8} zIndexRange={[10, 20]} center>
          <div className="px-3 py-1.5 bg-slate-950/90 border border-slate-700/80 rounded-md text-[11px] font-display font-bold text-white whitespace-nowrap shadow-xl backdrop-blur-sm pointer-events-none select-none">
            {article.title}
          </div>
        </Html>
      )}

      {/* Draft 記事限定：霧 (Mist) パーティクルエフェクト */}
      {isDraft && mistParticles && (
        <points ref={mistRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[mistParticles, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.06}
            color="#93A1BE"
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
}

export function StellarChart({ articles, onHover }: StellarChartProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  // カテゴリ（星座）ごとに星をグループ化
  const groupedArticles = useMemo(() => {
    const groups: Record<string, ArticleData[]> = {};
    articles.forEach(art => {
      if (art.status !== 'publish' && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        // セキュリティ：本番ビルド時には Draft 記事は非表示にする
        return;
      }
      const cat = art.category || 'default';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(art);
    });
    return groups;
  }, [articles]);

  // 星座線の計算 (各カテゴリごとに最小全域木を算出)
  const constellationLines = useMemo(() => {
    const lines: { color: string; segments: [THREE.Vector3, THREE.Vector3][] }[] = [];
    Object.entries(groupedArticles).forEach(([cat, nodes]) => {
      const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
      const segments = computeMST(nodes);
      lines.push({ color, segments });
    });
    return lines;
  }, [groupedArticles]);

  // ホバーされた星のデータを特定
  const hoveredArticle = useMemo(() => {
    return articles.find(art => art.slug === hoveredSlug) || null;
  }, [hoveredSlug, articles]);

  // 「光の糸 (neighbors)」の3D接続線の座標リストを作成
  const neighborLines = useMemo(() => {
    if (!hoveredArticle || !hoveredArticle.neighbors) return [];
    
    const lines: [number, number, number][][] = [];
    const startPoint = hoveredArticle.pos;

    hoveredArticle.neighbors.forEach(nSlug => {
      const target = articles.find(art => art.slug === nSlug);
      if (target) {
        lines.push([
          [startPoint.x, startPoint.y, startPoint.z],
          [target.pos.x, target.pos.y, target.pos.z]
        ]);
      }
    });
    return lines;
  }, [hoveredArticle, articles]);

  return (
    <group>
      {/* 1. 常時薄く表示される星座線 (Constellation Lines) */}
      {constellationLines.map((group, gIdx) => 
        group.segments.map((seg, sIdx) => (
          <Line
            key={`const-line-${gIdx}-${sIdx}`}
            points={[seg[0], seg[1]]}
            color={group.color}
            lineWidth={0.5}
            transparent
            opacity={0.25}
          />
        ))
      )}

      {/* 2. ホバー時のみ現れる「光の糸」 (Threads of Light) */}
      {neighborLines.map((points, idx) => (
        <Line
          key={`neighbor-line-${idx}`}
          points={points.map(p => new THREE.Vector3(p[0], p[1], p[2]))}
          color="#8aebff" // ネオンブルーで接続
          lineWidth={1.8}
          transparent
          opacity={0.8}
          dashed={false}
        />
      ))}

      {/* 3. 各星の描画 */}
      {articles.map(art => (
        <StarNode
          key={art.slug}
          article={art}
          isHovered={hoveredSlug === art.slug}
          isAnyHovered={hoveredSlug !== null}
          onPointerOver={() => {
            setHoveredSlug(art.slug);
            onHover(art);
          }}
          onPointerOut={() => {
            setHoveredSlug(null);
            onHover(null);
          }}
        />
      ))}
    </group>
  );
}
