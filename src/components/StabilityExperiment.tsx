import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { Anchor, Zap, Lock, Unlock, RefreshCcw, Info, MousePointer2 } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export default function StabilityExperiment() {
  const [shapeType, setShapeType] = useState<'triangle' | 'quadrilateral'>('quadrilateral');
  const [isReinforced, setIsReinforced] = useState(false);
  const [isDeforming, setIsDeforming] = useState(false);
  
  // Initial positions
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    resetPoints();
  }, [shapeType]);

  const resetPoints = () => {
    setIsReinforced(false);
    if (shapeType === 'triangle') {
      setPoints([
        { x: 200, y: 100 },
        { x: 100, y: 300 },
        { x: 300, y: 300 },
      ]);
    } else {
      setPoints([
        { x: 150, y: 150 },
        { x: 350, y: 150 },
        { x: 350, y: 350 },
        { x: 150, y: 350 },
      ]);
    }
  };

  const handleDrag = (index: number, info: any) => {
    if (isDeforming) return;
    
    // Stability logic: 
    // If the shape is stable (triangle or reinforced quad), dragging one vertex moves the whole shape (rigid body).
    // If the shape is unstable (plain quad), dragging one vertex deforms the shape while keeping side lengths constant.
    if (shapeType === 'triangle' || (shapeType === 'quadrilateral' && isReinforced)) {
      setPoints(prev => prev.map(p => ({
        x: p.x + info.delta.x,
        y: p.y + info.delta.y
      })));
    } else {
      // Unstable Quadrilateral: Use circular constraint to keep side lengths constant
      const SIDE = 200;
      setPoints(prev => {
        const newPoints = [...prev];
        const nx = prev[index].x + info.delta.x;
        const ny = prev[index].y + info.delta.y;

        // Determine which side to rotate based on which vertex is dragged
        // We treat the quadrilateral as a parallelogram where opposite sides rotate together
        if (index === 0 || index === 1) {
          // Dragging top vertices: Rotate relative to bottom vertices (anchors)
          const anchorIdx = (index === 0) ? 3 : 2;
          const otherAnchorIdx = (index === 0) ? 2 : 3;
          const otherTargetIdx = (index === 0) ? 1 : 0;

          const angle = Math.atan2(ny - prev[anchorIdx].y, nx - prev[anchorIdx].x);
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);

          newPoints[index] = { x: prev[anchorIdx].x + SIDE * cosA, y: prev[anchorIdx].y + SIDE * sinA };
          newPoints[otherTargetIdx] = { x: prev[otherAnchorIdx].x + SIDE * cosA, y: prev[otherAnchorIdx].y + SIDE * sinA };
        } else {
          // Dragging bottom vertices: Rotate relative to top vertices (anchors)
          const anchorIdx = (index === 3) ? 0 : 1;
          const otherAnchorIdx = (index === 3) ? 1 : 0;
          const otherTargetIdx = (index === 3) ? 2 : 3;

          const angle = Math.atan2(ny - prev[anchorIdx].y, nx - prev[anchorIdx].x);
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);

          newPoints[index] = { x: prev[anchorIdx].x + SIDE * cosA, y: prev[anchorIdx].y + SIDE * sinA };
          newPoints[otherTargetIdx] = { x: prev[otherAnchorIdx].x + SIDE * cosA, y: prev[otherAnchorIdx].y + SIDE * sinA };
        }
        return newPoints;
      });
    }
  };

  const simulateStability = () => {
    if (isDeforming) return;
    setIsDeforming(true);
    
    const originalPoints = [...points];
    
    if (shapeType === 'quadrilateral' && !isReinforced) {
      // Quadrilaterals are unstable - they shear (keeping side lengths constant)
      const SIDE = 200;
      const shearAngleRange = Math.PI / 4; // 45 degrees
      const duration = 800;
      const start = Date.now();

      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.sin((elapsed / duration) * Math.PI);
        
        // Calculate current angle (swinging from -90deg)
        const currentAngle = -Math.PI / 2 + progress * shearAngleRange;
        const cosA = Math.cos(currentAngle);
        const sinA = Math.sin(currentAngle);

        const shearedPoints = originalPoints.map((p, i) => {
          if (i === 0) return { x: originalPoints[3].x + SIDE * cosA, y: originalPoints[3].y + SIDE * sinA };
          if (i === 1) return { x: originalPoints[2].x + SIDE * cosA, y: originalPoints[2].y + SIDE * sinA };
          return p;
        });
        
        setPoints(shearedPoints);

        if (elapsed < duration) {
          requestAnimationFrame(animate);
        } else {
          setPoints(originalPoints);
          setIsDeforming(false);
        }
      };
      requestAnimationFrame(animate);
    } else {
      // Triangles (or reinforced quads) are stable - they resist shearing
      // We'll just do a tiny "vibration" to show it's solid
      const shakeAmount = 5;
      const duration = 400;
      const start = Date.now();

      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.sin((elapsed / 20) * Math.PI) * (1 - elapsed / duration);
        
        const shakenPoints = originalPoints.map(p => ({
          ...p,
          x: p.x + progress * shakeAmount
        }));
        
        setPoints(shakenPoints);

        if (elapsed < duration) {
          requestAnimationFrame(animate);
        } else {
          setPoints(originalPoints);
          setIsDeforming(false);
        }
      };
      requestAnimationFrame(animate);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <Anchor className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">图形稳定性实验</h2>
            <p className="text-sm text-slate-500 font-medium italic">通过“扯动”发现：为什么三角形是最稳定的结构？</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setShapeType('triangle')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                shapeType === 'triangle' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              三角形
            </button>
            <button
              onClick={() => setShapeType('quadrilateral')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                shapeType === 'quadrilateral' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              四边形
            </button>
          </div>

          <button
            onClick={simulateStability}
            disabled={isDeforming}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-2xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Zap className={`w-5 h-5 ${isDeforming ? 'animate-pulse' : ''}`} />
            施加外力测试
          </button>

          <button
            onClick={resetPoints}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar: Controls & Theory */}
        <div className="w-80 bg-white border-r border-slate-200 p-8 flex flex-col gap-8 overflow-y-auto">
          <section>
            <div className="flex items-center gap-2 text-slate-400 mb-4">
              <Info className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">实验指南</span>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  尝试拖拽图形的<span className="font-bold text-slate-900">顶点</span>，改变它的形状。
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  点击<span className="font-bold text-slate-900">“施加外力测试”</span>，观察图形是否会发生剧烈形变。
                </p>
              </div>
            </div>
          </section>

          {shapeType === 'quadrilateral' && (
            <section className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
              <h4 className="text-sm font-black text-amber-800 mb-3 flex items-center gap-2">
                <Unlock className="w-4 h-4" />
                四边形不稳定性
              </h4>
              <p className="text-xs text-amber-700 leading-relaxed mb-4">
                四边形的四条边长度确定后，它的形状（角度）仍然可以改变。这就是为什么它容易“摇晃”。
              </p>
              <button
                onClick={() => setIsReinforced(!isReinforced)}
                className={`w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                  isReinforced 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                    : 'bg-amber-200 text-amber-800 hover:bg-amber-300'
                }`}
              >
                {isReinforced ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isReinforced ? '已加固（增加对角线）' : '增加对角线加固'}
              </button>
            </section>
          )}

          <section className="mt-auto">
            <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl">
              <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-2">科学结论</p>
              <h4 className="text-lg font-black mb-2 text-blue-400">三角形的稳定性</h4>
              <p className="text-xs opacity-80 leading-relaxed">
                只要三角形的三条边长度确定，它的形状就完全固定了。这种特性在建筑（如塔吊、房梁）中被广泛应用。
              </p>
            </div>
          </section>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative bg-slate-100 overflow-hidden cursor-crosshair">
          <svg className="w-full h-full drop-shadow-2xl">
            {/* Grid Pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Shape Lines (Rods) */}
            <g>
              {points.map((p, i) => {
                const nextP = points[(i + 1) % points.length];
                return (
                  <line
                    key={`line-${i}`}
                    x1={p.x}
                    y1={p.y}
                    x2={nextP.x}
                    y2={nextP.y}
                    stroke={shapeType === 'triangle' ? '#3B82F6' : isReinforced ? '#10B981' : '#F59E0B'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="transition-colors duration-300"
                  />
                );
              })}
              
              {/* Reinforcement Diagonal */}
              {shapeType === 'quadrilateral' && isReinforced && (
                <motion.line
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1 }}
                  x1={points[0].x}
                  y1={points[0].y}
                  x2={points[2].x}
                  y2={points[2].y}
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeDasharray="12 8"
                  strokeLinecap="round"
                />
              )}
            </g>

            {/* Vertices (Joints) */}
            {points.map((p, i) => (
              <motion.g
                key={`point-${i}`}
                onPan={(e, info) => handleDrag(i, info)}
                style={{ x: p.x, y: p.y }}
                className="cursor-grab active:cursor-grabbing group"
              >
                <motion.circle
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  r="16"
                  fill="white"
                  stroke={shapeType === 'triangle' ? '#3B82F6' : isReinforced ? '#10B981' : '#F59E0B'}
                  strokeWidth="4"
                  className="shadow-lg"
                />
                <circle r="4" fill={shapeType === 'triangle' ? '#3B82F6' : isReinforced ? '#10B981' : '#F59E0B'} />
              </motion.g>
            ))}

            {/* Center Move Handle */}
            {points.length > 0 && (
              <motion.g
                onPan={(e, info) => {
                  setPoints(prev => prev.map(p => ({
                    x: p.x + info.delta.x,
                    y: p.y + info.delta.y
                  })));
                }}
                style={{ 
                  x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
                  y: points.reduce((sum, p) => sum + p.y, 0) / points.length 
                }}
                className="cursor-move group"
              >
                <circle
                  r="24"
                  fill="white"
                  fillOpacity="0.6"
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="group-hover:fill-opacity-90 transition-all"
                />
                <path 
                  d="M-6 0 L6 0 M0 -6 L0 6" 
                  stroke="#94A3B8" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                />
                <text
                  y="35"
                  textAnchor="middle"
                  className="text-[10px] font-black fill-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                  整体移动
                </text>
              </motion.g>
            )}
          </svg>

          {/* Floating Hint */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200 shadow-sm flex items-center gap-3">
              <MousePointer2 className="w-4 h-4 text-blue-600 animate-bounce" />
              <span className="text-xs font-bold text-slate-600">拖拽顶点，或点击上方测试按钮</span>
            </div>
          </div>

          {/* Stability Status */}
          <div className="absolute bottom-8 right-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={shapeType + isReinforced}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`px-6 py-4 rounded-3xl border shadow-xl flex items-center gap-4 ${
                  shapeType === 'triangle' || isReinforced
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    : 'bg-amber-50 border-amber-100 text-amber-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  shapeType === 'triangle' || isReinforced ? 'bg-emerald-500' : 'bg-amber-500'
                }`}>
                  {shapeType === 'triangle' || isReinforced ? (
                    <Lock className="w-5 h-5 text-white" />
                  ) : (
                    <Unlock className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">当前状态</p>
                  <p className="text-sm font-black">
                    {shapeType === 'triangle' ? '三角形：极其稳定' : isReinforced ? '加固四边形：稳定' : '普通四边形：不稳定'}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
