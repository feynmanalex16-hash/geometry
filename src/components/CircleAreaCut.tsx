import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Stage, Layer, Arc, Line, Text, Group, Circle, Rect as KonvaRect } from 'react-konva';
import { Layers, RefreshCw, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CircleAreaCut() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [numSectors, setNumSectors] = useState(16);
  const [progress, setProgress] = useState(0); // 0: Circle, 1: Rectangle
  const [isAnimating, setIsAnimating] = useState(false);

  // Responsive calculations
  const radius = useMemo(() => {
    const minDim = Math.min(dimensions.width, dimensions.height);
    // Make it larger: about 25% of the smaller dimension, but capped
    return Math.min(minDim * 0.22, 140);
  }, [dimensions]);

  const centerX = useMemo(() => dimensions.width * 0.25, [dimensions]);
  const centerY = useMemo(() => dimensions.height * 0.5, [dimensions]);
  const rectCenterX = useMemo(() => dimensions.width * 0.45, [dimensions]);
  const rectCenterY = useMemo(() => dimensions.height * 0.5, [dimensions]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const sectors = useMemo(() => {
    const angleStep = 360 / numSectors;
    const items = [];
    for (let i = 0; i < numSectors; i++) {
      items.push({
        id: i,
        startAngle: i * angleStep,
        angle: angleStep,
        color: i % 2 === 0 ? '#4F46E5' : '#F59E0B', 
      });
    }
    return items;
  }, [numSectors]);

  const toggleTransform = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const target = progress === 0 ? 1 : 0;
    
    let start = Date.now();
    const duration = 1500;
    const initialProgress = progress;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      
      const easedT = t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
      
      const currentProgress = initialProgress === 0 ? easedT : 1 - easedT;
      setProgress(currentProgress);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setProgress(target);
        setIsAnimating(false);
      }
    };
    requestAnimationFrame(animate);
  };

  const getSectorState = (index: number) => {
    const angleStep = 360 / numSectors;
    const circleRot = index * angleStep;
    
    const sectorWidth = (2 * Math.PI * radius) / numSectors;
    const totalWidth = Math.PI * radius;

    const isPointingUp = index % 2 === 0;
    
    const targetX = rectCenterX + (index - (numSectors - 1) / 2) * (sectorWidth / 2);
    const targetY = isPointingUp ? (rectCenterY + radius / 2) : (rectCenterY - radius / 2);
    
    const targetRot = isPointingUp ? (270 - angleStep / 2) : (90 - angleStep / 2);
    
    let rotDiff = targetRot - circleRot;
    while (rotDiff > 180) rotDiff -= 360;
    while (rotDiff < -180) rotDiff += 360;

    return {
      x: centerX + (targetX - centerX) * progress,
      y: centerY + (targetY - centerY) * progress,
      rotation: circleRot + rotDiff * progress,
    };
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 sm:p-6 font-sans">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Layers className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">圆面积切割</h2>
            <p className="text-xs sm:text-sm text-slate-500 italic">等分越多，拼成的图形越接近长方形</p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex flex-col items-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">等份数量 (N)</p>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {[8, 16, 32, 64].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setNumSectors(n);
                    setProgress(0);
                  }}
                  disabled={isAnimating}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                    numSectors === n 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={toggleTransform}
            disabled={isAnimating}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 text-xs sm:text-sm ${
              progress > 0.5 ? 'bg-slate-600 shadow-slate-200' : 'bg-indigo-600 shadow-indigo-200'
            }`}
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 h-5 ${isAnimating ? 'animate-spin' : ''}`} />
            {progress > 0.5 ? '还原圆形' : '展开切割'}
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 relative bg-white rounded-3xl shadow-inner border-4 border-slate-100 overflow-hidden">
        <Stage width={dimensions.width} height={dimensions.height}>
          <Layer>
            {/* 辅助线：长方形边界 */}
            {progress > 0.6 && (
              <Group opacity={Math.max(0, (progress - 0.6) * 2.5)}>
                <KonvaRect
                  x={rectCenterX - (Math.PI * radius) / 2}
                  y={rectCenterY - radius / 2}
                  width={Math.PI * radius}
                  height={radius}
                  stroke="#CBD5E1"
                  strokeWidth={2}
                  dash={[8, 4]}
                />
                <Text
                  x={rectCenterX - 30}
                  y={rectCenterY + radius / 2 + 20}
                  text="底 ≈ πr"
                  fontSize={dimensions.width < 600 ? 14 : 18}
                  fontStyle="bold"
                  fill="#475569"
                />
                <Text
                  x={rectCenterX + (Math.PI * radius) / 2 + 15}
                  y={rectCenterY - 10}
                  text="高 = r"
                  fontSize={dimensions.width < 600 ? 14 : 18}
                  fontStyle="bold"
                  fill="#475569"
                />
              </Group>
            )}

            {/* 扇形组件 */}
            {sectors.map((s, i) => {
              const state = getSectorState(i);
              return (
                <Arc
                  key={s.id}
                  x={state.x}
                  y={state.y}
                  innerRadius={0}
                  outerRadius={radius}
                  angle={s.angle}
                  rotation={state.rotation}
                  fill={s.color}
                  stroke="white"
                  strokeWidth={0.5}
                />
              );
            })}

            {/* 圆心标记 */}
            {progress < 0.2 && (
              <Circle
                x={centerX}
                y={centerY}
                radius={4}
                fill="white"
                opacity={1 - progress * 5}
              />
            )}
          </Layer>
        </Stage>

        {/* 教学推导过程 - 响应式隐藏或调整 */}
        <div className={`absolute top-4 sm:top-8 right-4 sm:right-8 ${dimensions.width < 700 ? 'w-48' : 'w-80'} space-y-4 pointer-events-none sm:pointer-events-auto`}>
          <div className={`bg-white/90 backdrop-blur p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xl ${dimensions.width < 500 ? 'hidden' : 'block'}`}>
            <div className="flex items-center gap-2 text-indigo-600 mb-2 sm:mb-4">
              <Info className="w-4 h-4 sm:w-5 h-5" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">转化法推导</span>
            </div>
            <div className="space-y-2 sm:space-y-4 text-[10px] sm:text-sm text-slate-600 leading-relaxed">
              <p className="flex items-start gap-2 sm:gap-3">
                <span className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-[8px] sm:text-[10px] font-black text-indigo-600 shrink-0">1</span>
                <span>将圆等分成 $n$ 个扇形。</span>
              </p>
              <p className="flex items-start gap-2 sm:gap-3">
                <span className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-[8px] sm:text-[10px] font-black text-indigo-600 shrink-0">2</span>
                <span>交错拼接，形成一个近似的<b>长方形</b>。</span>
              </p>
              <p className="flex items-start gap-2 sm:gap-3">
                <span className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-[8px] sm:text-[10px] font-black text-indigo-600 shrink-0">3</span>
                <span>等份越多，越接近标准长方形。</span>
              </p>
            </div>
          </div>

          <AnimatePresence>
            {progress > 0.85 && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`bg-indigo-600 p-4 sm:p-6 rounded-2xl text-white shadow-2xl shadow-indigo-200 ${dimensions.width < 400 ? 'scale-75 origin-top-right' : ''}`}
              >
                <p className="text-[8px] sm:text-[10px] font-black opacity-60 uppercase tracking-widest mb-2 sm:mb-4">面积公式 (Area Formula)</p>
                <div className="space-y-2 sm:space-y-4 font-mono">
                  <div className="flex justify-between items-center border-b border-white/20 pb-1 sm:pb-2">
                    <span className="text-[10px] sm:text-xs opacity-80 italic">长方形面积</span>
                    <span className="text-xs sm:text-sm font-bold">长 × 宽</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/20 pb-1 sm:pb-2">
                    <span className="text-[10px] sm:text-xs opacity-80 italic">对应圆参数</span>
                    <span className="text-xs sm:text-sm font-bold">πr × r</span>
                  </div>
                  <div className="pt-1 sm:pt-2 text-center">
                    <p className="text-[10px] sm:text-xs opacity-80 mb-1 sm:mb-2">因此，圆的面积为：</p>
                    <p className="text-xl sm:text-3xl font-black text-amber-300 drop-shadow-sm">S = πr²</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8">
          <div className="bg-amber-50 px-3 sm:px-5 py-2 sm:py-3 rounded-2xl border border-amber-200 text-[10px] sm:text-sm text-amber-800 font-bold shadow-sm flex items-center gap-2 sm:gap-3">
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-500 animate-pulse" />
            观察：当 N={numSectors} 时，拼成的图形像什么？
          </div>
        </div>
      </div>
    </div>
  );
}
