import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Grid, Box, PerspectiveCamera, OrthographicCamera, Center, Environment, ContactShadows, Float, Plane } from '@react-three/drei';
import { Eye, LayoutGrid, Box as BoxIcon, Plus, Minus, Trash2, Info, MousePointer2, Eraser, Hammer, Move } from 'lucide-react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';

interface CubeData {
  x: number;
  y: number;
  z: number;
  id: string;
}

function CameraHelper({ lookAt }: { lookAt: [number, number, number] }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(new THREE.Vector3(...lookAt));
    camera.updateProjectionMatrix();
  }, [camera, lookAt]);
  return null;
}

interface ModelProps {
  cubes: CubeData[];
  onAdd: (x: number, y: number, z: number) => void;
  onRemove: (id: string) => void;
  mode: 'add' | 'remove' | 'move';
}

function Model({ cubes, onAdd, onRemove, mode }: ModelProps) {
  const [hoveredPos, setHoveredPos] = useState<[number, number, number] | null>(null);

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (mode !== 'add') {
      setHoveredPos(null);
      return;
    }
    
    // Find the face we are hovering over
    const normal = e.face?.normal;
    const cubePos = e.object.position;
    
    if (normal) {
      const x = Math.round(cubePos.x + normal.x);
      const y = Math.round(cubePos.y + normal.y);
      const z = Math.round(cubePos.z + normal.z);
      setHoveredPos([x, y, z]);
    }
  };

  const handlePointerOut = () => {
    setHoveredPos(null);
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>, cube: CubeData) => {
    e.stopPropagation();
    if (mode === 'move') return;
    
    if (mode === 'remove') {
      onRemove(cube.id);
    } else {
      const normal = e.face?.normal;
      if (normal) {
        const newX = Math.round(cube.x + normal.x);
        const newY = Math.round(cube.y + normal.y);
        const newZ = Math.round(cube.z + normal.z);
        onAdd(newX, newY, newZ);
      }
    }
  };

  return (
    <group>
      {cubes.map((cube) => (
        <Box 
          key={cube.id} 
          position={[cube.x, cube.y, cube.z]} 
          args={[0.98, 0.98, 0.98]}
          castShadow
          receiveShadow
          onPointerDown={(e) => handlePointerDown(e, cube)}
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
        >
          <meshStandardMaterial 
            color={mode === 'remove' ? "#EF4444" : "#4F46E5"} 
            roughness={0.2} 
            metalness={0.1}
            emissive={mode === 'remove' ? "#EF4444" : "#4F46E5"}
            emissiveIntensity={0.1}
          />
        </Box>
      ))}
      
      {/* Ghost Cube Preview */}
      {mode === 'add' && hoveredPos && (
        <Box position={hoveredPos} args={[1, 1, 1]}>
          <meshStandardMaterial 
            color="#4F46E5" 
            transparent 
            opacity={0.3} 
            depthWrite={false}
          />
        </Box>
      )}
    </group>
  );
}

interface ViewportProps {
  title: string;
  cameraType: 'perspective' | 'orthographic';
  position: [number, number, number];
  zoom?: number;
  cubes: CubeData[];
  onAdd: (x: number, y: number, z: number) => void;
  onRemove: (id: string) => void;
  mode: 'add' | 'remove' | 'move';
}

function Viewport({ title, cameraType, position, zoom = 100, cubes, onAdd, onRemove, mode }: ViewportProps) {
  const [floorHoverPos, setFloorHoverPos] = useState<[number, number, number] | null>(null);

  const handleFloorClick = (e: ThreeEvent<PointerEvent>) => {
    if (mode === 'add') {
      const point = e.point;
      const x = Math.round(point.x);
      const z = Math.round(point.z);
      onAdd(x, 0, z);
    }
  };

  const handleFloorMove = (e: ThreeEvent<PointerEvent>) => {
    if (mode === 'add') {
      const x = Math.round(e.point.x);
      const z = Math.round(e.point.z);
      setFloorHoverPos([x, 0, z]);
    } else {
      setFloorHoverPos(null);
    }
  };

  return (
    <div className="relative h-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
      <div className="absolute top-3 left-3 z-10 bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 shadow-lg transition-transform group-hover:scale-105">
        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{title}</p>
      </div>
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
          <directionalLight position={[-5, 5, 5]} intensity={1} />
          <spotLight position={[5, 10, 5]} angle={0.15} penumbra={1} intensity={2} castShadow />
          
          {cameraType === 'perspective' ? (
            <>
              <PerspectiveCamera makeDefault position={position} fov={50} />
              <OrbitControls 
                enabled={mode === 'move'}
                enablePan={mode === 'move'} 
                minDistance={2} 
                maxDistance={15}
                makeDefault
              />
            </>
          ) : (
            <>
              <OrthographicCamera 
                makeDefault 
                position={position} 
                zoom={zoom} 
                near={0.1} 
                far={1000} 
              />
              <OrbitControls 
                enabled={mode === 'move'}
                enableRotate={false}
                enablePan={mode === 'move'}
                makeDefault
              />
              <CameraHelper lookAt={[0, 0, 0]} />
            </>
          )}

          <Model cubes={cubes} onAdd={onAdd} onRemove={onRemove} mode={mode} />
          
          {/* Floor Ghost Preview */}
          {mode === 'add' && floorHoverPos && !cubes.some(c => c.x === floorHoverPos[0] && c.y === 0 && c.z === floorHoverPos[2]) && (
            <Box position={floorHoverPos} args={[1, 1, 1]}>
              <meshStandardMaterial color="#4F46E5" transparent opacity={0.2} depthWrite={false} />
            </Box>
          )}

          {/* Invisible floor for clicking */}
          <Plane 
            args={[20, 20]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.5, 0]} 
            onPointerDown={handleFloorClick}
            onPointerMove={handleFloorMove}
            onPointerOut={() => setFloorHoverPos(null)}
          >
            <meshBasicMaterial transparent opacity={0} />
          </Plane>

          <ContactShadows 
            position={[0, -0.5, 0]} 
            opacity={0.6} 
            scale={10} 
            blur={2.5} 
            far={4.5} 
          />
          
          <Grid 
            infiniteGrid 
            fadeDistance={20} 
            cellColor="#1e293b" 
            sectionColor="#334155" 
            cellSize={1}
            sectionSize={5}
            position={[0, -0.5, 0]}
          />
          
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function ThreeViews() {
  const [cubes, setCubes] = useState<CubeData[]>([
    { x: 0, y: 0, z: 0, id: '0-0-0' },
    { x: 1, y: 0, z: 0, id: '1-0-0' },
    { x: 0, y: 0, z: 1, id: '0-0-1' },
    { x: 0, y: 1, z: 0, id: '0-1-0' },
  ]);
  const [mode, setMode] = useState<'add' | 'remove' | 'move'>('add');
  const [activeView, setActiveView] = useState<'perspective' | 'top' | 'front' | 'left'>('perspective');

  const gridSize = 5;
  const gridRange = Array.from({ length: gridSize }, (_, i) => i - Math.floor(gridSize / 2));

  const addCube = (x: number, y: number, z: number) => {
    if (cubes.some(c => c.x === x && c.y === y && c.z === z)) return;
    if (Math.abs(x) > 5 || Math.abs(z) > 5 || y < 0 || y > 5) return;
    const newCube: CubeData = { x, y, z, id: `${x}-${y}-${z}` };
    setCubes(prev => [...prev, newCube]);
  };

  const removeCube = (id: string) => {
    setCubes(prev => prev.filter(c => c.id !== id));
  };

  const clearCubes = () => setCubes([]);

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm z-10">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-indigo-600 p-2 md:p-3 rounded-2xl shadow-lg shadow-indigo-100">
            <Eye className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">3D 空间搭建实验室</h2>
            <p className="text-[10px] md:text-sm text-slate-500 font-medium italic">直接在 3D 场景中点击搭建，观察三视图实时变化</p>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          {mode === 'move' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-700"
            >
              <Info className="w-3 h-3" />
              拖拽旋转视角，右键/双指拖拽平移
            </motion.div>
          )}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setMode('add')}
              className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${
                mode === 'add' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Hammer className="w-3 h-3 md:w-4 md:h-4" />
              添加
            </button>
            <button
              onClick={() => setMode('remove')}
              className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${
                mode === 'remove' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Eraser className="w-3 h-3 md:w-4 md:h-4" />
              移除
            </button>
            <button
              onClick={() => setMode('move')}
              className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${
                mode === 'move' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Move className="w-3 h-3 md:w-4 md:h-4" />
              移动
            </button>
          </div>
          
          <button
            onClick={clearCubes}
            className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl font-bold text-xs md:text-sm transition-all border border-slate-200"
          >
            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
            清空
          </button>
          <div className="hidden md:block h-8 w-px bg-slate-200 mx-2" />
          <div className="hidden md:flex bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 items-center gap-2">
            <BoxIcon className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-black text-indigo-700">积木：{cubes.length}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile View Switcher */}
        <div className="md:hidden flex bg-white border-b border-slate-200 p-2 overflow-x-auto no-scrollbar gap-2">
          {[
            { id: 'perspective', name: '透视', icon: <BoxIcon className="w-4 h-4" /> },
            { id: 'top', name: '俯视', icon: <LayoutGrid className="w-4 h-4" /> },
            { id: 'front', name: '正视', icon: <Eye className="w-4 h-4" /> },
            { id: 'left', name: '左视', icon: <Eye className="w-4 h-4" /> },
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                activeView === view.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 bg-slate-100'
              }`}
            >
              {view.icon}
              {view.name}
            </button>
          ))}
        </div>

        {/* Main Viewports */}
        <div className="flex-1 p-2 md:p-4 bg-slate-100 overflow-hidden">
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-4 h-full">
            <Viewport title="透视图 (Perspective)" cameraType="perspective" position={[4, 4, 4]} cubes={cubes} onAdd={addCube} onRemove={removeCube} mode={mode} />
            <Viewport title="俯视图 (Top View)" cameraType="orthographic" position={[0, 10, 0]} zoom={60} cubes={cubes} onAdd={addCube} onRemove={removeCube} mode={mode} />
            <Viewport title="正视图 (Front View)" cameraType="orthographic" position={[0, 0.5, 10]} zoom={60} cubes={cubes} onAdd={addCube} onRemove={removeCube} mode={mode} />
            <Viewport title="左视图 (Left View)" cameraType="orthographic" position={[-10, 0.5, 0]} zoom={60} cubes={cubes} onAdd={addCube} onRemove={removeCube} mode={mode} />
          </div>

          {/* Mobile Single View */}
          <div className="md:hidden h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeView === 'perspective' && <Viewport title="透视图" cameraType="perspective" position={[4, 4, 4]} cubes={cubes} onAdd={addCube} onRemove={removeCube} mode={mode} />}
                {activeView === 'top' && <Viewport title="俯视图" cameraType="orthographic" position={[0, 10, 0]} zoom={60} cubes={cubes} onAdd={addCube} onRemove={removeCube} mode={mode} />}
                {activeView === 'front' && <Viewport title="正视图" cameraType="orthographic" position={[0, 0.5, 10]} zoom={60} cubes={cubes} onAdd={addCube} onRemove={removeCube} mode={mode} />}
                {activeView === 'left' && <Viewport title="左视图" cameraType="orthographic" position={[-10, 0.5, 0]} zoom={60} cubes={cubes} onAdd={addCube} onRemove={removeCube} mode={mode} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="bg-white border-t border-slate-200 px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar w-full md:w-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm" />
            <span className="text-[10px] md:text-xs font-bold text-slate-600">正视图</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
            <span className="text-[10px] md:text-xs font-bold text-slate-600">左视图</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
            <span className="text-[10px] md:text-xs font-bold text-slate-600">俯视图</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
          <LayoutGrid className="w-4 h-4 text-indigo-600" />
          <p className="text-xs text-indigo-700 font-black">
            三视图实时投影，帮助建立空间感
          </p>
        </div>
      </div>
    </div>
  );
}
