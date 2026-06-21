import React, { useState, useEffect } from 'react';

// 🌟 調用四個專業員工元件
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import MapArea from './components/MapArea';
import AddModal from './components/AddModal';
import React, { useState, useEffect } from 'react';

// ==========================================
// 為了讓預覽環境正常運作的模擬元件 (本地端請保持原本的 import 方式)
// ==========================================
const Login = ({ onLogin }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
    <div className="p-8 bg-white rounded-lg shadow-md text-center">
      <h2 className="text-2xl font-bold mb-4">NuLifeMap 登入</h2>
      <button 
        onClick={() => onLogin({ account: 'mapper', name: '測試員' })}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        測試登入
      </button>
    </div>
  </div>
);

const Sidebar = ({ user, onLogout, onOpenModal }) => (
  <div className="w-80 h-full bg-slate-100 p-4 border-r flex flex-col shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold">🗺️ NuLifeMap</h2>
      <button onClick={onLogout} className="text-sm text-slate-500 hover:text-slate-800">登出</button>
    </div>
    <div className="mb-4 text-sm text-slate-600">歡迎, {user?.name || user?.account}</div>
    <button 
      onClick={onOpenModal}
      className="w-full py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors shadow-sm"
    >
      + 新增地標
    </button>
    <div className="mt-6 flex-1 overflow-y-auto">
      <div className="text-center text-slate-400 mt-10">資料載入中或無資料...</div>
    </div>
  </div>
);

const MapArea = () => (
  <div className="flex-1 h-full bg-slate-200 flex items-center justify-center">
    <div className="text-slate-400 text-lg flex flex-col items-center">
      <span className="text-4xl mb-2">📍</span>
      <span>地圖區域 (預覽模式)</span>
    </div>
  </div>
);

const AddModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-96 p-6 rounded-lg shadow-xl">
        <h3 className="text-xl font-bold mb-4">新增地標</h3>
        <p className="text-slate-500 mb-6">請在本地端專案查看完整表單功能。</p>
        <button 
          onClick={onClose}
          className="w-full py-2 bg-slate-200 text-slate-800 rounded hover:bg-slate-300"
        >
          關閉
        </button>
      </div>
    </div>
  );
};

export default function App() {
  // ==========================================
  // 全域狀態 (State) - 由大老闆統一管理
  // ==========================================
  const [user, setUser] = useState(null); 
  const [jobs, setJobs] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [appMode, setAppMode] = useState('normal'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [focusedItem, setFocusedItem] = useState(null); 

  // ==========================================
  // 1. 登入與權限管理
  // ==========================================
  useEffect(() => {
    const storedUser = localStorage.getItem('nulifemap_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    setJobs([]);
    localStorage.removeItem('nulifemap_user');
  };

  // ==========================================
  // 2. 資料抓取邏輯
  // ==========================================
  const fetchData = () => {
    if (!user) return; 
    
    setLoadingData(true);
    
    // 🌟 安全讀取環境變數 (相容本地端 Vite 與雲端預覽環境)
    let API_BASE = 'http://127.0.0.1:3000';
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
        API_BASE = import.meta.env.VITE_API_BASE_URL;
      }
    } catch (e) {
      console.warn("無法讀取環境變數，使用預設 API_BASE");
    }
    
    // 在 API 請求帶上 userId，讓後端只回傳屬於這個人的資料
    fetch(`${API_BASE}/api/markers?userId=${user.account}`)
      .then(res => {
        if (!res.ok) throw new Error("伺服器回應錯誤");
        return res.json();
      })
      .then(data => {
        const validData = data.filter(item => item.lat && item.lng);
        setJobs(validData);
        setLoadingData(false);
      })
      .catch(err => {
        console.warn("無法取得後端資料，改用預設空陣列展示:", err);
        setJobs([]); 
        setLoadingData(false);
      });
  };

  // 當使用者狀態改變(登入成功)時，觸發抓取專屬資料
  useEffect(() => {
    fetchData();
  }, [user]);

  // ==========================================
  // 3. 組合與分配畫面
  // ==========================================
  
  if (!user) {
    return <Login onLogin={(u) => { 
      setUser(u); 
      localStorage.setItem('nulifemap_user', JSON.stringify(u)); 
    }} />;
  }

  return (
    <div className="fixed inset-0 flex flex-row bg-white text-slate-900 font-sans text-left z-50 overflow-hidden">
      
      <Sidebar 
        user={user} 
        onLogout={handleLogout} 
        jobs={jobs}
        loadingData={loadingData}
        appMode={appMode}
        setAppMode={setAppMode}
        onOpenModal={() => setIsModalOpen(true)}
        onFocusItem={(item) => setFocusedItem(item)} 
      />
      
      <MapArea 
        jobs={jobs}
        appMode={appMode}
        setAppMode={setAppMode}
        focusedItem={focusedItem}
      />
      
      <AddModal 
        user={user} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        fetchData={fetchData} 
      />
      
    </div>
  );
}