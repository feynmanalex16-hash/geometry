import React, { useState, useMemo } from 'react';
import { Stage, Layer, Rect, Circle, Text, Line, Group } from 'react-konva';
import { Maximize2, Move } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GRID_SIZE = 40;
const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 600;

interface RectState {
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function GridStretching() {
  const [rect, setRect] = useState<RectState>({
    x: 4 * GRID_SIZE,
    y: 3 * GRID_SIZE,
    w: 6 * GRID_SIZE,
    h: 4 * GRID_SIZE,
  });

  // 计算吸附后的矩形数据 (用于数学计算和辅助显示)
  const snappedRect = useMemo(() => ({
    x: Math.round(rect.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(rect.y / GRID_SIZE) * GRID_SIZE,
    w: Math.round(rect.w / GRID_SIZE) * GRID_SIZE,
    h: Math.round(rect.h / GRID_SIZE) * GRID_SIZE,
  }), [rect]);

  const mathW = Math.round(snappedRect.w / GRID_SIZE);
  const mathH = Math.round(snappedRect.h / GRID_SIZE);
  const area = mathW * mathH;

  // 绘制背景网格
  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= STAGE_WIDTH / GRID_SIZE; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * GRID_SIZE, 0, i * GRID_SIZE, STAGE_HEIGHT]}
          stroke="#F1F5F9"
          strokeWidth={1}
        />
      );
    }
    for (let i = 0; i <= STAGE_HEIGHT / GRID_SIZE; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * GRID_SIZE, STAGE_WIDTH, i * GRID_SIZE]}
          stroke="#F1F5F9"
          strokeWidth={1}
        />
      );
    }
    return lines;
  }, []);

  const handleDrag = (corner: string, pos: { x: number; y: number }) => {
    const rawX = pos.x;
    const rawY = pos.y;

    setRect((prev) => {
      let newRect = { ...prev };
      switch (corner) {
        case 'tl':
          newRect.w = prev.x + prev.w - rawX;
          newRect.h = prev.y + prev.h - rawY;
          newRect.x = rawX;
          newRect.y = rawY;
          break;
        case 'tr':
          newRect.w = rawX - prev.x;
          newRect.h = prev.y + prev.h - rawY;
          newRect.y = rawY;
          break;
        case 'bl':
          newRect.x = rawX;
          newRect.w = prev.x + prev.w - rawX;
          newRect.h = rawY - prev.y;
          break;
        case 'br':
          newRect.w = rawX - prev.x;
          newRect.h = rawY - prev.y;
          break;
      }

      // 限制最小尺寸
      if (newRect.w < 40) newRect.w = 40;
      if (newRect.h < 40) newRect.h = 40;
      
      return newRect;
    });
  };

  const handleMove = (pos: { x: number; y: number }) => {
    setRect(prev => ({
      ...prev,
      x: pos.x,
      y: pos.y
    }));
  };

  const handleDragEnd = () => {
    // 停止拖拽时，将矩形完全吸附到网格
    setRect(snappedRect);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 font-sans">
      <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Maximize2 className="text-indigo-600 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">矩形面积探索</h2>
            <p className="text-sm text-slate-500 italic">拖拽顶点，观察面积的变化</p>
          </div>
        </div>
        
        <div className="flex gap-8 items-center">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">长 (a)</p>
            <AnimatePresence mode="wait">
              <motion.p 
                key={mathW}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-mono font-bold text-indigo-600"
              >
                {mathW} <span className="text-sm font-normal text-slate-400">格</span>
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="text-slate-300 text-2xl font-light">×</div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">宽 (b)</p>
            <AnimatePresence mode="wait">
              <motion.p 
                key={mathH}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-mono font-bold text-indigo-600"
              >
                {mathH} <span className="text-sm font-normal text-slate-400">格</span>
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="text-slate-300 text-2xl font-light">=</div>
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            key={area}
            className="bg-indigo-600 px-6 py-2 rounded-xl text-white shadow-lg shadow-indigo-200"
          >
            <p className="text-xs uppercase tracking-wider opacity-70 font-semibold mb-1">面积 (S)</p>
            <p className="text-2xl font-mono font-bold">{area} <span className="text-sm font-normal opacity-70">平方格</span></p>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 relative bg-white rounded-3xl shadow-inner border-4 border-slate-100 overflow-hidden cursor-crosshair">
        <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}>
          <Layer>
            {gridLines}

            {/* 吸附预览 (Ghost Rect) */}
            <Rect
              x={snappedRect.x}
              y={snappedRect.y}
              width={snappedRect.w}
              height={snappedRect.h}
              fill="rgba(79, 70, 229, 0.05)"
              stroke="rgba(79, 70, 229, 0.2)"
              strokeWidth={1}
              dash={[2, 2]}
            />

            {/* 视觉矩形 (Smooth Rect) */}
            <Rect
              x={rect.x}
              y={rect.y}
              width={rect.w}
              height={rect.h}
              fill="rgba(79, 70, 229, 0.15)"
              stroke="#4F46E5"
              strokeWidth={3}
              draggable
              onDragMove={(e) => handleMove(e.target.position())}
              onDragEnd={handleDragEnd}
              onMouseEnter={(e) => {
                const container = e.target.getStage()?.container();
                if (container) container.style.cursor = 'move';
              }}
              onMouseLeave={(e) => {
                const container = e.target.getStage()?.container();
                if (container) container.style.cursor = 'crosshair';
              }}
            />

            {/* 边长标注 (跟随吸附位置) */}
            <Text
              x={snappedRect.x + snappedRect.w / 2 - 10}
              y={snappedRect.y - 25}
              text={`a = ${mathW}`}
              fontSize={16}
              fontStyle="bold"
              fill="#4F46E5"
            />
            <Text
              x={snappedRect.x + snappedRect.w + 10}
              y={snappedRect.y + snappedRect.h / 2 - 8}
              text={`b = ${mathH}`}
              fontSize={16}
              fontStyle="bold"
              fill="#4F46E5"
            />

            {/* 面积标注 */}
            <Text
              x={snappedRect.x + snappedRect.w / 2 - 30}
              y={snappedRect.y + snappedRect.h / 2 - 10}
              text={`S = ${area}`}
              fontSize={20}
              fontStyle="bold"
              fill="#4F46E5"
              opacity={0.8}
            />

            {/* 拖拽手柄 (跟随视觉位置) */}
            {[
              { id: 'tl', x: rect.x, y: rect.y },
              { id: 'tr', x: rect.x + rect.w, y: rect.y },
              { id: 'bl', x: rect.x, y: rect.y + rect.h },
              { id: 'br', x: rect.x + rect.w, y: rect.y + rect.h },
            ].map((handle) => (
              <Circle
                key={handle.id}
                x={handle.x}
                y={handle.y}
                radius={10}
                fill="white"
                stroke="#4F46E5"
                strokeWidth={2}
                draggable
                onDragMove={(e) => handleDrag(handle.id, e.target.position())}
                onDragEnd={handleDragEnd}
                onMouseEnter={(e) => {
                  const container = e.target.getStage()?.container();
                  if (container) container.style.cursor = 'nwse-resize';
                }}
                onMouseLeave={(e) => {
                  const container = e.target.getStage()?.container();
                  if (container) container.style.cursor = 'crosshair';
                }}
              />
            ))}
          </Layer>
        </Stage>

        {/* 教学提示 */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
          <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-600 flex items-center gap-2">
            <Move className="w-4 h-4" />
            <span>平滑拖动顶点，松开后自动对齐网格</span>
          </div>
          <div className="bg-amber-50 px-4 py-2 rounded-full border border-amber-200 text-sm text-amber-700 font-medium">
            💡 发现了吗？长 × 宽 永远等于 面积！
          </div>
        </div>
      </div>
    </div>
  );
}
