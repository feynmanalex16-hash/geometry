import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Box, Maximize2, RotateCcw, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Component for a single face of the cube net
function CubeFace({ color, label }: { color: string, label: string }) {
  return (
    <group>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[1, 0.02, 1]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      <Text
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

// The Cube Net component that handles folding logic
function CubeNet({ foldProgress }: { foldProgress: number }) {
  // foldProgress: 0 (flat net) to 1 (folded cube)
  const angle = (Math.PI / 2) * foldProgress;

  return (
    <group position={[0, 0, 0]}>
      {/* Center Face (Bottom) - The anchor on the floor */}
      <CubeFace color="#4F46E5" label="底" />

      {/* Front Face - Folds Up at the front edge */}
      <group position={[0, 0, 0.5]}>
        <group rotation={[-angle, 0, 0]}>
          <group position={[0, 0, 0.5]}>
            <CubeFace color="#6366F1" label="前" />
          </group>
        </group>
      </group>

      {/* Back Face - Folds Up at the back edge */}
      <group position={[0, 0, -0.5]}>
        <group rotation={[angle, 0, 0]}>
          <group position={[0, 0, -0.5]}>
            <CubeFace color="#818CF8" label="后" />
            
            {/* Top Face - Attached to Back, folds further */}
            <group position={[0, 0, -0.5]}>
              <group rotation={[angle, 0, 0]}>
                <group position={[0, 0, -0.5]}>
                  <CubeFace color="#4338CA" label="上" />
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* Left Face - Folds Up at the left edge */}
      <group position={[-0.5, 0, 0]}>
        <group rotation={[0, 0, -angle]}>
          <group position={[-0.5, 0, 0]}>
            <CubeFace color="#4F46E5" label="左" />
          </group>
        </group>
      </group>

      {/* Right Face - Folds Up at the right edge */}
      <group position={[0.5, 0, 0]}>
        <group rotation={[0, 0, angle]}>
          <group position={[0.5, 0, 0]}>
            <CubeFace color="#4F46E5" label="右" />
          </group>
        </group>
      </group>
    </group>
  );
}

export default function Unfold() {
  const [foldProgress, setFoldProgress] = useState(0);
  const [isAutoAnimating, setIsAutoAnimating] = useState(false);

  const toggleFold = () => {
    if (isAutoAnimating) return;
    setIsAutoAnimating(true);
    const target = foldProgress === 0 ? 1 : 0;
    const start = Date.now();
    const duration = 2000;
    const initial = foldProgress;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      
      setFoldProgress(initial === 0 ? eased : 1 - eased);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setFoldProgress(target);
        setIsAutoAnimating(false);
      }
    };
    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-2xl">
            <Maximize2 className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">展开图挑战</h2>
            <p className="text-sm text-slate-500 font-medium italic">观察立体图形与其平面展开图的对应关系</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">折叠进度</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={foldProgress} 
              onChange={(e) => setFoldProgress(parseFloat(e.target.value))}
              className="w-48 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <button
            onClick={toggleFold}
            disabled={isAutoAnimating}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${
              foldProgress > 0.5 ? 'bg-slate-700 shadow-slate-200' : 'bg-indigo-600 shadow-indigo-200'
            }`}
          >
            <RotateCcw className={`w-5 h-5 ${isAutoAnimating ? 'animate-spin' : ''}`} />
            {foldProgress > 0.5 ? '展开平面' : '折叠成立体'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative bg-slate-900">
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[3, 3, 5]} fov={45} />
          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
          
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <CubeNet foldProgress={foldProgress} />
          
          <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
          <Environment preset="city" />
          
          {/* Floor grid for reference */}
          <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, -0.02, 0]} />
        </Canvas>

        {/* Overlay Info */}
        <div className="absolute top-8 left-8 w-72 space-y-4 pointer-events-none sm:pointer-events-auto">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl text-white">
            <div className="flex items-center gap-2 text-indigo-400 mb-4">
              <Info className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">学习重点</span>
            </div>
            <ul className="space-y-3 text-sm opacity-90 font-medium">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                正方体有6个面，12条棱。
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                展开图中，相对的面不相邻。
              </li>
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                尝试找出“上”面对应的“底”面。
              </li>
            </ul>
          </div>

          <AnimatePresence>
            {foldProgress === 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500 p-6 rounded-3xl text-white shadow-2xl shadow-emerald-900/20"
              >
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">几何特征</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <p className="text-lg font-black">6</p>
                    <p className="text-[8px] uppercase font-bold opacity-70">面</p>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <p className="text-lg font-black">12</p>
                    <p className="text-[8px] uppercase font-bold opacity-70">棱</p>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <p className="text-lg font-black">8</p>
                    <p className="text-[8px] uppercase font-bold opacity-70">顶点</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interaction Hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10 text-white/70 text-xs font-bold flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            拖拽鼠标旋转视角，滚轮缩放
          </div>
        </div>
      </div>
    </div>
  );
}
