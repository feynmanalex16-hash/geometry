import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Rotate3d, Play, Pause, RefreshCcw, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ShapeType = 'rectangle' | 'triangle' | 'semicircle';

function RotatingShape({ type, rotationAngle }: { type: ShapeType, rotationAngle: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    switch (type) {
      case 'rectangle':
        // A thin plane representing the rectangle
        // Offset so the rotation axis is at the edge (x=0)
        const rectGeo = new THREE.PlaneGeometry(1, 2);
        rectGeo.translate(0.5, 0, 0);
        // Cylinder thetaStart=0 is at (0, 0, 1) [Positive Z].
        // Plane is in XY plane. Rotate -90deg to YZ plane (facing positive Z).
        rectGeo.rotateY(-Math.PI / 2);
        return rectGeo;
      case 'triangle':
        // A right triangle
        const shape = new THREE.Shape();
        shape.moveTo(0, -1);
        shape.lineTo(1, -1);
        shape.lineTo(0, 1);
        shape.lineTo(0, -1);
        const triGeo = new THREE.ShapeGeometry(shape);
        // Align with Cone's thetaStart=0 (positive Z axis)
        triGeo.rotateY(-Math.PI / 2);
        return triGeo;
      case 'semicircle':
        // A semi-circle for the sphere
        const semiShape = new THREE.Shape();
        // Sphere phiStart=0 is at negative X (-1, 0, 0).
        // Draw from PI/2 to 3PI/2 to get a vertical semi-circle on the left side (x < 0)
        semiShape.absarc(0, 0, 1, Math.PI / 2, 3 * Math.PI / 2, false);
        return new THREE.ShapeGeometry(semiShape);
      default:
        return new THREE.PlaneGeometry(1, 1);
    }
  }, [type]);

  // The 3D solid formed by rotation
  const solidGeometry = useMemo(() => {
    if (rotationAngle < 0.001) return null;
    
    switch (type) {
      case 'rectangle':
        // Cylinder: thetaStart=0 is at (0, 0, 1)
        return new THREE.CylinderGeometry(1, 1, 2, 64, 1, false, 0, rotationAngle);
      case 'triangle':
        // Cone: thetaStart=0 is at (0, 0, 1)
        return new THREE.ConeGeometry(1, 2, 64, 1, false, 0, rotationAngle);
      case 'semicircle':
        // Sphere: phiStart=0 is at (-1, 0, 0)
        return new THREE.SphereGeometry(1, 64, 32, 0, rotationAngle, 0, Math.PI);
      default:
        return null;
    }
  }, [type, rotationAngle]);

  return (
    <group>
      {/* The 2D Shape being rotated (Moving Face) */}
      <mesh 
        geometry={geometry} 
        rotation={[0, rotationAngle, 0]}
      >
        <meshStandardMaterial 
          color="#F59E0B" 
          side={THREE.DoubleSide} 
          transparent 
          opacity={0.8} 
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* The 2D Shape at the start (Static Face) */}
      <mesh 
        geometry={geometry} 
        rotation={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#F59E0B" 
          side={THREE.DoubleSide} 
          transparent 
          opacity={0.3} 
        />
      </mesh>

      {/* The 3D Solid being formed */}
      {solidGeometry && (
        <mesh geometry={solidGeometry}>
          <meshStandardMaterial color="#4F46E5" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Rotation Axis */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 3, 8]} />
        <meshStandardMaterial color="#94A3B8" />
      </mesh>
    </group>
  );
}

export default function Rotate() {
  const [activeShape, setActiveShape] = useState<ShapeType>('rectangle');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const requestRef = useRef<number>(null);

  const toggleAutoRotate = () => {
    if (isAutoRotating) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      setIsAutoRotating(false);
    } else {
      setIsAutoRotating(true);
      const start = Date.now();
      const duration = 3000;
      const initial = rotationAngle;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        // Linear rotation for better visualization of the process
        const current = initial + (Math.PI * 2 - initial) * t;
        setRotationAngle(current);

        if (t < 1) {
          requestRef.current = requestAnimationFrame(animate);
        } else {
          setRotationAngle(Math.PI * 2);
          setIsAutoRotating(false);
        }
      };
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const reset = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setIsAutoRotating(false);
    setRotationAngle(0);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-2xl">
            <Rotate3d className="text-amber-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">旋转成体实验</h2>
            <p className="text-sm text-slate-500 font-medium italic">观察平面图形绕轴旋转形成立体图形的过程</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {(['rectangle', 'triangle', 'semicircle'] as ShapeType[]).map((type) => (
              <button
                key={type}
                onClick={() => { setActiveShape(type); reset(); }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  activeShape === type 
                    ? 'bg-white text-amber-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {type === 'rectangle' ? '长方形' : type === 'triangle' ? '直角三角形' : '半圆'}
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-slate-200 mx-2" />

          <button
            onClick={toggleAutoRotate}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${
              isAutoRotating ? 'bg-slate-700' : 'bg-amber-600 shadow-amber-200'
            }`}
          >
            {isAutoRotating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isAutoRotating ? '停止' : '开始旋转'}
          </button>

          <button
            onClick={reset}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative bg-slate-900">
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[4, 2, 4]} fov={45} />
          <OrbitControls makeDefault />
          
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <RotatingShape type={activeShape} rotationAngle={rotationAngle} />
          
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
          <Environment preset="city" />
          
          <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[0, -1.51, 0]} />
        </Canvas>

        {/* Overlay Info */}
        <div className="absolute top-8 left-8 w-72 space-y-4 pointer-events-none sm:pointer-events-auto">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl text-white">
            <div className="flex items-center gap-2 text-amber-400 mb-4">
              <Info className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">观察重点</span>
            </div>
            <div className="space-y-4 text-sm opacity-90 font-medium leading-relaxed">
              <p>
                {activeShape === 'rectangle' && '长方形绕一边旋转，形成一个圆柱体。'}
                {activeShape === 'triangle' && '直角三角形绕一直角边旋转，形成一个圆锥体。'}
                {activeShape === 'semicircle' && '半圆绕直径旋转，形成一个球体。'}
              </p>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] uppercase opacity-50 mb-2 tracking-widest">旋转角度</p>
                <p className="text-2xl font-black text-amber-300">
                  {Math.round((rotationAngle / (Math.PI * 2)) * 360)}°
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {rotationAngle > Math.PI * 1.9 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-indigo-600 p-6 rounded-3xl text-white shadow-2xl shadow-indigo-900/20"
              >
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">形成立体</p>
                <p className="text-xl font-black">
                  {activeShape === 'rectangle' && '圆柱 (Cylinder)'}
                  {activeShape === 'triangle' && '圆锥 (Cone)'}
                  {activeShape === 'semicircle' && '球体 (Sphere)'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interaction Hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10 text-white/70 text-xs font-bold flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            拖拽旋转视角，观察旋转轨迹
          </div>
        </div>
      </div>
    </div>
  );
}
