import React, { useState } from 'react';
import { Stage, Layer, Line, Text, Group, Circle } from 'react-konva';
import { Scissors, RefreshCw, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const GRID_SIZE = 40;
const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 600;

export default function ParallelogramTransform() {
  const [isTransformed, setIsTransformed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [offset, setOffset] = useState(2 * GRID_SIZE);

  const base = 6 * GRID_SIZE;
  const height = 4 * GRID_SIZE;
  const startX = 150;
  const startY = 150;

  const handleTransform = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsTransformed(!isTransformed);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  // 绘制背景网格
  const gridLines = [];
  for (let i = 0; i <= STAGE_WIDTH / GRID_SIZE; i++) {
    gridLines.push(
      <Line
        key={`v-${i}`}
        points={[i * GRID_SIZE, 0, i * GRID_SIZE, STAGE_HEIGHT]}
        stroke="#F1F5F9"
        strokeWidth={1}
      />
    );
  }
  for (let i = 0; i <= STAGE_HEIGHT / GRID_SIZE; i++) {
    gridLines.push(
      <Line
        key={`h-${i}`}
        points={[0, i * GRID_SIZE, STAGE_WIDTH, i * GRID_SIZE]}
        stroke="#F1F5F9"
        strokeWidth={1}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 font-sans">
      <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Scissors className="text-emerald-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">平行四边形割补</h2>
            <p className="text-sm text-slate-500 italic">通过“转化”思想，将新图形变成旧图形</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl border-2 transition-all duration-500 ${isTransformed ? 'border-indigo-200 bg-indigo-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">当前公式</p>
            <p className="text-xl font-mono font-bold text-slate-800">
              {isTransformed ? 'S = a × h (长方形)' : 'S = ? (平行四边形)'}
            </p>
          </div>
          <button
            onClick={handleTransform}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
              isTransformed ? 'bg-slate-600 shadow-slate-200' : 'bg-emerald-600 shadow-emerald-200'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${isAnimating ? 'animate-spin' : ''}`} />
            {isTransformed ? '重置图形' : '开始割补'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-white rounded-3xl shadow-inner border-4 border-slate-100 overflow-hidden">
        <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}>
          <Layer>
            {gridLines}

            {/* 固定部分 (右侧梯形) */}
            <Line
              points={[
                startX + offset, startY,
                startX + base + offset, startY,
                startX + base, startY + height,
                startX + offset, startY + height
              ]}
              fill="rgba(16, 185, 129, 0.2)"
              stroke="#10B981"
              strokeWidth={3}
              closed
            />

            {/* 动画部分 (左侧三角形) */}
            <Group
              x={isTransformed ? base : 0}
              transition="0.8s ease-in-out"
            >
              <Line
                points={[
                  startX, startY + height,
                  startX + offset, startY + height,
                  startX + offset, startY
                ]}
                fill="rgba(245, 158, 11, 0.3)"
                stroke="#F59E0B"
                strokeWidth={3}
                closed
              />
              <Text
                x={startX + offset/3}
                y={startY + height/2}
                text="A"
                fontSize={16}
                fontStyle="bold"
                fill="#D97706"
              />
            </Group>

            {/* 标注 */}
            <Line
              points={[startX + offset, startY, startX + offset, startY + height]}
              stroke="#64748B"
              strokeWidth={2}
              dash={[4, 4]}
            />
            <Text
              x={startX + offset - 25}
              y={startY + height/2 - 10}
              text="h"
              fontSize={18}
              fontStyle="italic"
              fill="#64748B"
            />
            <Text
              x={startX + offset + base/2}
              y={startY + height + 10}
              text="a (底)"
              fontSize={18}
              fontStyle="bold"
              fill="#10B981"
            />

            {/* 拖拽手柄 - 调整倾斜度 */}
            {!isTransformed && !isAnimating && (
              <Group
                draggable
                x={startX + base + offset}
                y={startY}
                onDragMove={(e) => {
                  const newX = e.target.x();
                  const newOffset = Math.max(0, Math.min(newX - startX - base, 5 * GRID_SIZE));
                  setOffset(newOffset);
                  e.target.x(startX + base + newOffset);
                  e.target.y(startY);
                }}
                onMouseEnter={(e: any) => {
                  const container = e.target.getStage()?.container();
                  if (container) container.style.cursor = 'ew-resize';
                }}
                onMouseLeave={(e: any) => {
                  const container = e.target.getStage()?.container();
                  if (container) container.style.cursor = 'default';
                }}
              >
                <Circle
                  radius={12}
                  fill="white"
                  stroke="#10B981"
                  strokeWidth={3}
                  shadowBlur={5}
                  shadowColor="rgba(0,0,0,0.1)"
                />
                <Text
                  x={-15}
                  y={-30}
                  text="拖动改变倾斜度"
                  fontSize={10}
                  fontStyle="bold"
                  fill="#10B981"
                />
              </Group>
            )}
          </Layer>
        </Stage>

        {/* 教学步骤 */}
        <div className="absolute top-8 right-8 w-64 space-y-4">
          {[
            { step: 1, text: "沿高剪下一个三角形", active: !isTransformed },
            { step: 2, text: "向右平移至另一侧", active: isAnimating },
            { step: 3, text: "拼成一个长方形", active: isTransformed }
          ].map((s) => (
            <div key={s.step} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              s.active ? 'bg-white shadow-md border-emerald-200 scale-105' : 'bg-slate-50 border-slate-100 opacity-50'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                s.active ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {s.step}
              </div>
              <p className="text-sm font-medium text-slate-700">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">平行四边形</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-emerald-600">底 × 高</span>
              </div>
            </div>
            <ArrowRight className="text-slate-300" />
            <div className="text-center">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">长方形</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-indigo-600">长 × 宽</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <p className="text-sm font-bold text-slate-600">
              结论：面积保持不变！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
