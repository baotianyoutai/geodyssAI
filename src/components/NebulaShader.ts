import * as THREE from 'three';

// 宇宙の「星雲 (Nebula)」をリアルタイム描画するためのカスタムGLSLシェーダーマテリアルの定義
export const NebulaShader = {
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(800, 600) },
    uColorNebula: { value: new THREE.Color('#8B5CF6') }, // 星雲のメインカラー (Secondary)
    uColorDeep: { value: new THREE.Color('#0B1026') },   // 背景の深層宇宙色
    uColorPink: { value: new THREE.Color('#F2B8CC') }    // マンチカンピンクのアクセント
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uColorNebula;
    uniform vec3 uColorDeep;
    uniform vec3 uColorPink;
    varying vec2 vUv;

    // 擬似乱数ノイズ関数
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    // 2Dバリューノイズ
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    // fBm (Fractional Brownian Motion) によるフラクタルノイズの重畳
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      // 回転行列を用いて格子パターンを崩す
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 4; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // 画面解像度に応じたUVの正規化
      vec2 uv = vUv * 2.0 - 1.0;
      
      // 時間経過に伴う低速スクロールと回転効果
      vec2 movement = vec2(uTime * 0.01, uTime * 0.005);
      vec2 p = uv * 1.5 + movement;
      
      // 複雑な揺らめきを作るためのドメインワーピング (Domain Warping)
      float q1 = fbm(p + vec2(0.0));
      float q2 = fbm(p + vec2(5.2, 1.3) + uTime * 0.015);
      
      vec2 r = vec2(
        fbm(p + 4.0 * vec2(q1, q2) + vec2(1.7, 9.2)),
        fbm(p + 4.0 * vec2(q1, q2) + vec2(8.3, 2.8))
      );
      
      float f = fbm(p + 4.0 * r);
      
      // 星雲ガスの明暗
      float density = smoothstep(0.1, 0.9, f);
      
      // 星雲カラーのブレンド (深層宇宙色、紫色、ピンク色)
      vec3 nebulaColor = mix(uColorNebula, uColorPink, r.x * 0.8);
      vec3 finalColor = mix(uColorDeep, nebulaColor, density);
      
      // 暗めのコントラストに調整して星が引き立つようにする
      finalColor += vec3(density * 0.12);
      
      // 端の方を暗くするビネット効果 (Vignette)
      float vignette = 1.0 - dot(uv, uv) * 0.45;
      finalColor *= clamp(vignette, 0.0, 1.0);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};
