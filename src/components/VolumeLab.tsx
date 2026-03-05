import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Text, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Box as BoxIcon, Circle, Triangle, Globe, Info, Calculator, Ruler, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ShapeType = 'cuboid' | 'cylinder' | 'cone' | 'sphere';

interface DimensionLabelProps {
  position: [number, number, number];
  text: string;
  color?: string;
}

function DimensionLabel({ position, text, color = "white" }: DimensionLabelProps) {
  return (
    <Html position={position} center distanceFactor={10}>
      <div className={`px-2 py-1 rounded bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-[10px] font-black whitespace-nowrap shadow-lg`} style={{ color }}>
        {text}
      </div>
    </Html>
  );
}

function ShapeModel({ type, params }: { type: ShapeType, params: any }) {
  const { length, width, height, radius } = params;

  return (
    <group>
      {type === 'cuboid' && (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[length, height, width]} />
          <meshStandardMaterial color="#6366F1" transparent opacity={0.7} roughness={0.3} metalness={0.2} />
          <DimensionLabel position={[length / 2 + 0.2, 0, 0]} text={`长: ${length}`} />
          <DimensionLabel position={[0, height / 2 + 0.2, 0]} text={`高: ${height}`} />
          <DimensionLabel position={[0, 0, width / 2 + 0.2]} text={`宽: ${width}`} />
        </mesh>
      )}

      {type === 'cylinder' && (
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[radius, radius, height, 64]} />
          <meshStandardMaterial color="#10B981" transparent opacity={0.7} roughness={0.3} metalness={0.2} />
          <DimensionLabel position={[radius + 0.2, 0, 0]} text={`半径: ${radius}`} />
          <DimensionLabel position={[0, height / 2 + 0.2, 0]} text={`高: ${height}`} />
          {/* Radius line */}
          <line>
            <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, height/2, 0), new THREE.Vector3(radius, height/2, 0)])} />
            <lineBasicMaterial attach="material" color="white" />
          </line>
        </mesh>
      )}

      {type === 'cone' && (
        <mesh castShadow receiveShadow>
          <coneGeometry args={[radius, height, 64]} />
          <meshStandardMaterial color="#F59E0B" transparent opacity={0.7} roughness={0.3} metalness={0.2} />
          <DimensionLabel position={[radius + 0.2, -height / 2, 0]} text={`半径: ${radius}`} />
          <DimensionLabel position={[0, height / 2 + 0.2, 0]} text={`高: ${height}`} />
          {/* Radius line */}
          <line>
            <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -height/2, 0), new THREE.Vector3(radius, -height/2, 0)])} />
            <lineBasicMaterial attach="material" color="white" />
          </line>
        </mesh>
      )}

      {type === 'sphere' && (
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial color="#EC4899" transparent opacity={0.7} roughness={0.3} metalness={0.2} />
          <DimensionLabel position={[radius + 0.2, 0, 0]} text={`半径: ${radius}`} />
          {/* Radius line */}
          <line>
            <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(radius, 0, 0)])} />
            <lineBasicMaterial attach="material" color="white" />
          </line>
        </mesh>
      )}
    </group>
  );
}

export default function VolumeLab() {
  const [activeShape, setActiveShape] = useState<ShapeType>('cuboid');
  const [params, setParams] = useState({
    length: 4,
    width: 3,
    height: 2,
    radius: 2
  });

  const updateParam = (name: string, value: number) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const volumeData = useMemo(() => {
    switch (activeShape) {
      case 'cuboid':
        return {
          formula: 'V = a × b × h',
          calc: params.length * params.width * params.height,
          label: '长方体'
        };
      case 'cylinder':
        return {
          formula: 'V = πr²h',
          calc: Math.PI * Math.pow(params.radius, 2) * params.height,
          label: '圆柱体'
        };
      case 'cone':
        return {
          formula: 'V = 1/3πr²h',
          calc: (1 / 3) * Math.PI * Math.pow(params.radius, 2) * params.height,
          label: '圆锥体'
        };
      case 'sphere':
        return {
          formula: 'V = 4/3πr³',
          calc: (4 / 3) * Math.PI * Math.pow(params.radius, 3),
          label: '球体'
        };
      default:
        return { formula: '', calc: 0, label: '' };
    }
  }, [activeShape, params]);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-2xl">
            <Calculator className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">体积实验室</h2>
            <p className="text-sm text-slate-500 font-medium italic">调整参数，探索不同立体图形的体积变化</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          {(['cuboid', 'cylinder', 'cone', 'sphere'] as ShapeType[]).map((type) => (
            <button
              key={type}
              onClick={() => setActiveShape(type)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeShape === type 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {type === 'cuboid' && <BoxIcon className="w-3 h-3" />}
              {type === 'cylinder' && <Circle className="w-3 h-3" />}
              {type === 'cone' && <Triangle className="w-3 h-3" />}
              {type === 'sphere' && <Globe className="w-3 h-3" />}
              {type === 'cuboid' ? '长方体' : type === 'cylinder' ? '圆柱体' : type === 'cone' ? '圆锥体' : '球体'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Controls */}
        <div className="w-80 bg-white border-r border-slate-200 p-8 overflow-y-auto space-y-8">
          <section>
            <div className="flex items-center gap-2 text-slate-400 mb-6">
              <Ruler className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">参数调整</span>
            </div>
            
            <div className="space-y-6">
              {activeShape === 'cuboid' && (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>长 (a)</span>
                      <span className="text-indigo-600">{params.length}</span>
                    </div>
                    <input type="range" min="1" max="8" step="0.1" value={params.length} onChange={(e) => updateParam('length', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>宽 (b)</span>
                      <span className="text-indigo-600">{params.width}</span>
                    </div>
                    <input type="range" min="1" max="8" step="0.1" value={params.width} onChange={(e) => updateParam('width', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>高 (h)</span>
                      <span className="text-indigo-600">{params.height}</span>
                    </div>
                    <input type="range" min="1" max="8" step="0.1" value={params.height} onChange={(e) => updateParam('height', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>
                </>
              )}

              {(activeShape === 'cylinder' || activeShape === 'cone') && (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>半径 (r)</span>
                      <span className="text-indigo-600">{params.radius}</span>
                    </div>
                    <input type="range" min="0.5" max="4" step="0.1" value={params.radius} onChange={(e) => updateParam('radius', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>高 (h)</span>
                      <span className="text-indigo-600">{params.height}</span>
                    </div>
                    <input type="range" min="1" max="8" step="0.1" value={params.height} onChange={(e) => updateParam('height', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>
                </>
              )}

              {activeShape === 'sphere' && (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>半径 (r)</span>
                    <span className="text-indigo-600">{params.radius}</span>
                  </div>
                  <input type="range" min="0.5" max="4" step="0.1" value={params.radius} onChange={(e) => updateParam('radius', parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                </div>
              )}
            </div>
          </section>

          <section className="pt-8 border-t border-slate-100">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">计算结果</p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">体积公式</p>
                  <p className="text-lg font-black text-slate-800 font-serif italic">{volumeData.formula}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">当前体积</p>
                  <p className="text-3xl font-black text-indigo-600">
                    {volumeData.calc.toFixed(2)}
                    <span className="text-sm text-slate-400 ml-1 font-normal">单位³</span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right: 3D View */}
        <div className="flex-1 relative bg-slate-900">
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={45} />
            <OrbitControls makeDefault />
            
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
              <ShapeModel type={activeShape} params={params} />
            </Float>
            
            <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={15} blur={2.5} far={4.5} />
            <Environment preset="city" />
            
            <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, -3.01, 0]} />
          </Canvas>

          {/* Overlay Info */}
          <div className="absolute top-8 right-8 w-64">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl text-white">
              <div className="flex items-center gap-2 text-indigo-400 mb-4">
                <Info className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">知识点</span>
              </div>
              <div className="text-xs opacity-90 font-medium leading-relaxed space-y-3">
                {activeShape === 'cuboid' && <p>长方体的体积等于长、宽、高的乘积。当长宽高相等时，它就是一个正方体。</p>}
                {activeShape === 'cylinder' && <p>圆柱的体积等于底面积乘以高。底面积是一个圆，公式为 πr²。</p>}
                {activeShape === 'cone' && <p>等底等高的圆锥体积是圆柱体积的三分之一。这是一个非常重要的几何关系。</p>}
                {activeShape === 'sphere' && <p>球体的体积仅由半径决定。它是空间中到定点距离等于定值的所有点组成的图形。</p>}
              </div>
            </div>
          </div>

          {/* Interaction Hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10 text-white/70 text-xs font-bold flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              拖拽旋转视角，观察图形尺寸变化
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
