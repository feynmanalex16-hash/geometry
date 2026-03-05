import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Text, Box } from '@react-three/drei';
import * as THREE from 'three';
import { Box as BoxIcon, Plus, Minus, Info, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Component for a single unit cube
function UnitCube({ position, color }: { position: [number, number, number], color: string }) {
  return (
    <Box position={position} args={[0.95, 0.95, 0.95]} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} transparent opacity={0.9} />
    </Box>
  );
}

// Component for the container outline
function ContainerOutline({ width, height, depth }: { width: number, height: number, depth: number }) {
  return (
    <Box args={[width, height, depth]} position={[width / 2 - 0.5, height / 2 - 0.5, depth / 2 - 0.5]}>
      <meshStandardMaterial color="#6366F1" wireframe transparent opacity={0.2} />
    </Box>
  );
}

export default function Volume() {
  const [length, setLength] = useState(4);
  const [width, setWidth] = useState(3);
  const [height, setHeight] = useState(2);
  const [fillLevel, setFillLevel] = useState(0); // 0 to length * width * height

  const cubes = useMemo(() => {
    const items = [];
    let count = 0;
    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        for (let l = 0; l < length; l++) {
          if (count < fillLevel) {
            items.push({
              id: `${l}-${w}-${h}`,
              position: [l, h, w] as [number, number, number],
              color: `hsl(${220 + (h * 20)}, 70%, 60%)`,
            });
          }
          count++;
        }
      }
    }
    return items;
  }, [length, width, height, fillLevel]);

  const maxCubes = length * width * height;

  const handleFillAll = () => setFillLevel(maxCubes);
  const handleClear = () => setFillLevel(0);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm z-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-2xl">
            <BoxIcon className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">体积填充实验</h2>
            <p className="text-sm text-slate-500 font-medium italic">通过填充 $1cm^3$ 的小正方体来理解体积公式</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">长 (a)</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setLength(Math.max(1, length - 1))} className="p-1 hover:bg-white rounded-lg transition-colors"><Minus className="w-4 h-4 text-slate-400" /></button>
              <span className="font-black text-indigo-600 w-4 text-center">{length}</span>
              <button onClick={() => setLength(Math.min(6, length + 1))} className="p-1 hover:bg-white rounded-lg transition-colors"><Plus className="w-4 h-4 text-slate-400" /></button>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">宽 (b)</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setWidth(Math.max(1, width - 1))} className="p-1 hover:bg-white rounded-lg transition-colors"><Minus className="w-4 h-4 text-slate-400" /></button>
              <span className="font-black text-indigo-600 w-4 text-center">{width}</span>
              <button onClick={() => setWidth(Math.min(6, width + 1))} className="p-1 hover:bg-white rounded-lg transition-colors"><Plus className="w-4 h-4 text-slate-400" /></button>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">高 (c)</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setHeight(Math.max(1, height - 1))} className="p-1 hover:bg-white rounded-lg transition-colors"><Minus className="w-4 h-4 text-slate-400" /></button>
              <span className="font-black text-indigo-600 w-4 text-center">{height}</span>
              <button onClick={() => setHeight(Math.min(6, height + 1))} className="p-1 hover:bg-white rounded-lg transition-colors"><Plus className="w-4 h-4 text-slate-400" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative bg-slate-900">
        <Canvas shadows dpr={[1, 2]}>
          <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={45} />
          <OrbitControls makeDefault target={[length / 2 - 0.5, height / 2 - 0.5, width / 2 - 0.5]} />
          
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <ContainerOutline width={length} height={height} depth={width} />
          
          {cubes.map((cube) => (
            <UnitCube key={cube.id} position={cube.position} color={cube.color} />
          ))}
          
          <ContactShadows position={[length / 2 - 0.5, -0.5, width / 2 - 0.5]} opacity={0.4} scale={15} blur={2.5} far={4.5} />
          <Environment preset="city" />
          
          <gridHelper args={[20, 20, 0x444444, 0x222222]} position={[length / 2 - 0.5, -0.51, width / 2 - 0.5]} />
        </Canvas>

        {/* Controls Overlay */}
        <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between pointer-events-none">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl text-white pointer-events-auto w-72">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-widest opacity-60">填充进度</span>
              <span className="text-xs font-bold">{fillLevel} / {maxCubes} 个</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max={maxCubes} 
              step="1" 
              value={fillLevel} 
              onChange={(e) => setFillLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-6"
            />
            <div className="flex gap-3">
              <button 
                onClick={handleFillAll}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black transition-colors"
              >
                全部填充
              </button>
              <button 
                onClick={handleClear}
                className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black transition-colors"
              >
                清空
              </button>
            </div>
          </div>

          <AnimatePresence>
            {fillLevel > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-200 pointer-events-auto w-80"
              >
                <div className="flex items-center gap-3 text-indigo-600 mb-6">
                  <Calculator className="w-6 h-6" />
                  <span className="text-sm font-black uppercase tracking-wider">体积计算</span>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-xs font-bold italic">长 (a)</span>
                    <span className="font-black text-slate-800">{length} cm</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-xs font-bold italic">宽 (b)</span>
                    <span className="font-black text-slate-800">{width} cm</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-xs font-bold italic">高 (c)</span>
                    <span className="font-black text-slate-800">{height} cm</span>
                  </div>
                  <div className="pt-4 border-t border-slate-100 text-center">
                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">体积 V = a × b × c</p>
                    <p className="text-4xl font-black text-indigo-600">
                      {length * width * height} <span className="text-lg text-slate-400">cm³</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interaction Hint */}
        <div className="absolute top-8 left-8">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 text-white/70 text-[10px] font-bold flex items-center gap-2">
            <Info className="w-3 h-3" />
            拖拽旋转，滚轮缩放，观察内部填充情况
          </div>
        </div>
      </div>
    </div>
  );
}
