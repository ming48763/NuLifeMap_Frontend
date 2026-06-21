// 🌟 調用四個專業員工元件
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import MapArea from './components/MapArea';
import AddModal from './components/AddModal';
import React, { useState, useEffect } from 'react';

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
  onst fetchData = () => {
    if (!user) return; 
    
    setLoadingData(true);
    
    // 🌟 安全讀取環境變數
    let API_BASE = 'http://127.0.0.1:3000';
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
        API_BASE = import.meta.env.VITE_API_BASE_URL;
      }
    } catch (e) {
      console.warn("無法讀取環境變數，使用預設 API_BASE");
    }
    
    // 🌟 串接後端 API
    fetch(`${API_BASE}/api/markers?userId=${user.account}`)
      .then(res => {
        if (!res.ok) throw new Error("伺服器回應錯誤");
        return res.json();
      })
      .then(data => {
        console.log("🌟 後端回傳的原始資料:", data); 
        
        // 確保資料是陣列格式，避免 filter 報錯
        const actualData = Array.isArray(data) ? data : (data.data || data.markers || []);
        const validData = actualData.filter(item => item.lat && item.lng);
        
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