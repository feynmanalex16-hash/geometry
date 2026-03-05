import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu,
  X,
  Square, 
  Triangle, 
  Circle as CircleIcon, 
  Box, 
  RotateCw, 
  Layers, 
  Eye, 
  ChevronRight,
  Calculator,
  Grid,
  Home,
  Shapes,
  BoxSelect,
  Anchor
} from 'lucide-react';
import GridStretching from './components/GridStretching';
import ParallelogramTransform from './components/ParallelogramTransform';
import PiExperiment from './components/PiExperiment';
import CircleAreaCut from './components/CircleAreaCut';
import ThreeViews from './components/ThreeViews';
import Unfold from './components/Unfold';
import VolumeLab from './components/VolumeLab';
import Rotate from './components/Rotate';
import StabilityExperiment from './components/StabilityExperiment';

type ModuleId = 'home' | 'grid' | 'parallelogram' | 'pi' | 'circle-area' | '3d-views' | 'unfold' | 'volume' | 'rotate' | 'stability';

interface Module {
  id: ModuleId;
  name: string;
  icon: React.ReactNode;
  category: '2D' | '3D' | 'System';
  description: string;
}

const modules: Module[] = [
  { id: 'grid', name: '方格纸拉伸', icon: <Grid className="w-5 h-5" />, category: '2D', description: '探索长方形面积公式' },
  { id: 'parallelogram', name: '平行四边形割补', icon: <Triangle className="w-5 h-5" />, category: '2D', description: '转化法求面积' },
  { id: 'pi', name: '圆周率实验', icon: <CircleIcon className="w-5 h-5" />, category: '2D', description: '周长与直径的关系' },
  { id: 'circle-area', name: '圆面积切割', icon: <Layers className="w-5 h-5" />, category: '2D', description: '圆面积的推导' },
  { id: '3d-views', name: '三视图观察', icon: <Eye className="w-5 h-5" />, category: '3D', description: '空间想象力训练' },
  { id: 'unfold', name: '展开图挑战', icon: <Box className="w-5 h-5" />, category: '3D', description: '立体图形的展开' },
  { id: 'volume', name: '体积实验室', icon: <Calculator className="w-5 h-5" />, category: '3D', description: '探索立体图形体积变化' },
  { id: 'rotate', name: '旋转成体', icon: <RotateCw className="w-5 h-5" />, category: '3D', description: '面动成体' },
  { id: 'stability', name: '图形稳定性', icon: <Anchor className="w-5 h-5" />, category: '2D', description: '探索三角形的稳定性' },
];

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('home');
  const [filterCategory, setFilterCategory] = useState<'2D' | '3D' | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    if (activeModule === 'home') {
      return (
        <div className="flex flex-col h-full bg-slate-50 p-12 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full">
            <header className="mb-12">
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">欢迎来到几何实验室</h2>
              <p className="text-lg text-slate-500">请选择你想要探索的几何领域，开启奇妙的数学之旅。</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.button
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilterCategory('2D')}
                className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Shapes className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
                    <Shapes className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3">平面几何 (2D)</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed">
                    探索点、线、面之间的关系。学习长方形、平行四边形、圆形的面积推导与性质。
                  </p>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <span>进入探索</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilterCategory('3D')}
                className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white text-left overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <BoxSelect className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                    <BoxSelect className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3">立体几何 (3D)</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed">
                    建立空间想象力。观察三视图、研究立体图形的展开与折叠，探索体积的奥秘。
                  </p>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold">
                    <span>进入探索</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            </div>

            {filterCategory && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-16"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-800">
                    {filterCategory === '2D' ? '平面几何' : '立体几何'} 实验项目
                  </h3>
                  <button 
                    onClick={() => setFilterCategory(null)}
                    className="text-sm font-bold text-slate-400 hover:text-slate-600"
                  >
                    清除筛选
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules.filter(m => m.category === filterCategory).map(module => (
                    <button
                      key={module.id}
                      onClick={() => setActiveModule(module.id)}
                      className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all text-left flex items-center gap-4 group"
                    >
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        {module.icon}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{module.name}</p>
                        <p className="text-xs text-slate-400">{module.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      );
    }

    switch (activeModule) {
      case 'grid':
        return <GridStretching />;
      case 'parallelogram':
        return <ParallelogramTransform />;
      case 'pi':
        return <PiExperiment />;
      case 'circle-area':
        return <CircleAreaCut />;
      case '3d-views':
        return <ThreeViews />;
      case 'unfold':
        return <Unfold />;
      case 'volume':
        return <VolumeLab />;
      case 'rotate':
        return <Rotate />;
      case 'stability':
        return <StabilityExperiment />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50">
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md">
              <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Box className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">模块开发中</h3>
              <p className="text-slate-500 mb-6">
                正在为您精心打造“{modules.find(m => m.id === activeModule)?.name}”互动实验，敬请期待！
              </p>
              <button 
                onClick={() => setActiveModule('home')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                返回实验室首页
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 flex flex-col bg-slate-50/50 transition-transform duration-300 transform
        lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <Square className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-indigo-950">几何助手</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-8">
          <button
            onClick={() => {
              setActiveModule('home');
              setFilterCategory(null);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
              activeModule === 'home' 
                ? 'bg-white shadow-md shadow-indigo-100 text-indigo-600 border border-indigo-50' 
                : 'text-slate-500 hover:bg-white hover:text-slate-800'
            }`}
          >
            <div className={`p-2 rounded-lg transition-colors ${
              activeModule === 'home' ? 'bg-indigo-50' : 'bg-slate-100 group-hover:bg-white'
            }`}>
              <Home className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold">实验室首页</p>
          </button>

          <div>
            <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">平面几何 (2D)</h3>
            <div className="space-y-1">
              {modules.filter(m => m.category === '2D').map(module => (
                <button
                  key={module.id}
                  onClick={() => {
                    setActiveModule(module.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                    activeModule === module.id 
                      ? 'bg-white shadow-md shadow-indigo-100 text-indigo-600 border border-indigo-50' 
                      : 'text-slate-500 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${
                    activeModule === module.id ? 'bg-indigo-50' : 'bg-slate-100 group-hover:bg-white'
                  }`}>
                    {module.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">{module.name}</p>
                    <p className="text-[10px] opacity-60 font-medium">{module.description}</p>
                  </div>
                  {activeModule === module.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">立体几何 (3D)</h3>
            <div className="space-y-1">
              {modules.filter(m => m.category === '3D').map(module => (
                <button
                  key={module.id}
                  onClick={() => {
                    setActiveModule(module.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                    activeModule === module.id 
                      ? 'bg-white shadow-md shadow-indigo-100 text-indigo-600 border border-indigo-50' 
                      : 'text-slate-500 hover:bg-white hover:text-slate-800'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${
                    activeModule === module.id ? 'bg-indigo-50' : 'bg-slate-100 group-hover:bg-white'
                  }`}>
                    {module.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">{module.name}</p>
                    <p className="text-[10px] opacity-60 font-medium">{module.description}</p>
                  </div>
                  {activeModule === module.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Calculator className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">当前版本</p>
              <p className="text-xs font-bold text-slate-700">v1.0.4 Beta</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 bg-white">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-bold text-slate-400">模块</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
            <span className="text-sm font-bold text-indigo-600 truncate max-w-[150px] md:max-w-none">
              {activeModule === 'home' ? '实验室首页' : modules.find(m => m.id === activeModule)?.name}
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="hidden sm:block text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">帮助手册</button>
            <div className="hidden sm:block h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                FA
              </div>
              <span className="hidden sm:block text-sm font-bold text-slate-700">Alex Feynman</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
