import React, { useState, useRef } from 'react';
import { Stage, Layer, Circle, Line, Text, Group, Arrow } from 'react-konva';
import { Disc, Ruler, RotateCw, Info } from 'lucide-react';

const GRID_SIZE = 40;
const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 600;

export default function PiExperiment() {
  const [rotation, setRotation] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  
  const radius = 60;
  const diameter = radius * 2;
  const circumference = 2 * Math.PI * radius;
  
  const startX = 100;
  const groundY = 400;
  
  // 计算当前滚动距离
  const distance = (rotation / 360) * circumference;
  const currentX = startX + distance;

  const handleRoll = (e: React.WheelEvent) => {
    const newRotation = Math.max(0, Math.min(360 * 3, rotation + e.deltaY * 0.5));
    setRotation(newRotation);
  };

  const reset = () => {
    setRotation(0);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 font-sans">
      <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-rose-100 p-2 rounded-lg">
            <Disc className="text-rose-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">圆周率实验</h2>
            <p className="text-sm text-slate-500 italic">滚动轮子，测量周长与直径的关系</p>
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <div className="text-center px-4 border-r border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">周长 (C)</p>
            <p className="text-xl font-mono font-bold text-rose-600">{(distance / GRID_SIZE).toFixed(2)} <span className="text-xs font-normal text-slate-400">格</span></p>
          </div>
          <div className="text-center px-4 border-r border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">直径 (d)</p>
            <p className="text-xl font-mono font-bold text-slate-800">{(diameter / GRID_SIZE).toFixed(2)} <span className="text-xs font-normal text-slate-400">格</span></p>
          </div>
          <div className="bg-rose-600 px-6 py-2 rounded-xl text-white shadow-lg shadow-rose-200 flex flex-col items-center">
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">C ÷ d</p>
            <p className="text-2xl font-mono font-bold">
              {distance > 0 ? (distance / diameter).toFixed(4) : '---'}
            </p>
          </div>
          <button 
            onClick={reset}
            className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        className="flex-1 relative bg-white rounded-3xl shadow-inner border-4 border-slate-100 overflow-hidden"
        onWheel={handleRoll}
      >
        <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}>
          <Layer>
            {/* 地面 */}
            <Line
              points={[0, groundY, STAGE_WIDTH, groundY]}
              stroke="#CBD5E1"
              strokeWidth={4}
            />
            
            {/* 刻度尺 */}
            {Array.from({ length: 20 }).map((_, i) => (
              <Group key={i} x={startX + i * GRID_SIZE} y={groundY}>
                <Line points={[0, 0, 0, 10]} stroke="#94A3B8" strokeWidth={2} />
                <Text
                  x={-5}
                  y={15}
                  text={i.toString()}
                  fontSize={12}
                  fill="#94A3B8"
                  fontStyle="bold"
                />
              </Group>
            ))}

            {/* 轨迹线 */}
            <Line
              points={[startX, groundY, currentX, groundY]}
              stroke="rgba(225, 29, 72, 0.4)"
              strokeWidth={8}
              lineCap="round"
            />

            {/* 轮子 */}
            <Group x={currentX} y={groundY - radius} rotation={rotation}>
              <Circle
                radius={radius}
                fill="rgba(225, 29, 72, 0.1)"
                stroke="#E11D48"
                strokeWidth={4}
              />
              {/* 轮辐 */}
              <Line points={[0, -radius, 0, radius]} stroke="#E11D48" strokeWidth={2} />
              <Line points={[-radius, 0, radius, 0]} stroke="#E11D48" strokeWidth={2} />
              {/* 标记点 */}
              <Circle
                y={radius}
                radius={6}
                fill="#E11D48"
              />
            </Group>

            {/* 直径标注 */}
            <Group x={currentX + radius + 40} y={groundY - radius}>
              <Arrow
                points={[0, -radius, 0, radius]}
                pointerLength={10}
                pointerWidth={10}
                fill="#64748B"
                stroke="#64748B"
                strokeWidth={2}
              />
              <Text
                x={15}
                y={-10}
                text={`d = ${(diameter / GRID_SIZE).toFixed(1)}`}
                fontSize={16}
                fontStyle="bold"
                fill="#64748B"
              />
            </Group>
          </Layer>
        </Stage>

        {/* 交互提示 */}
        <div className="absolute top-8 left-8 max-w-xs space-y-4">
          <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <Info className="w-4 h-4" />
              <span className="text-sm font-bold">实验指南</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              使用鼠标滚轮控制轮子向前滚动。观察轮子滚过一圈后，在地面留下的轨迹长度（周长）与直径的关系。
            </p>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <p className="text-xs font-bold text-amber-800 mb-1">💡 数学小知识</p>
            <p className="text-[10px] text-amber-700 leading-relaxed">
              无论轮子多大，周长除以直径的结果总是约等于 3.14159... 这个神奇的常数就是圆周率 π。
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 right-8">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-xl border border-slate-200 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">实验结论</p>
            <div className="flex items-baseline gap-1 justify-center">
              <span className="text-3xl font-black text-slate-800">C ≈ 3.14 × d</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
