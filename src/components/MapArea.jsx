import React, { useEffect, useRef, useState } from 'react';

export default function MapArea({ appMode }) {
  const mapContainerRef = useRef(null);
  const [status, setStatus] = useState("正在等待 Google Maps API...");

  useEffect(() => {
    // 不斷檢查 Google Maps API 是否準備好
    const checkMap = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkMap);
        setStatus("API 已載入，嘗試繪製地圖...");
        
        if (mapContainerRef.current) {
          try {
            new window.google.maps.Map(mapContainerRef.current, {
              center: { lat: 24.1552, lng: 120.6768 },
              zoom: 13,
              mapId: 'DEMO_MAP_ID', // 確保使用官方通用 ID 測試
              disableDefaultUI: false, // 打開預設按鈕以便觀察
            });
            setStatus("✅ 地圖繪製成功！");
          } catch (e) {
            setStatus("❌ 繪製失敗：" + e.message);
          }
        }
      }
    }, 1000);

    return () => clearInterval(checkMap);
  }, []);

  return (
    // 💡 測試 1：熱粉紅色背景，確認父容器有高度
    <div style={{ flex: 1, height: '100vh', position: 'relative', backgroundColor: 'hotpink' }}>
      
      {/* 💡 測試 2：最簡單的地圖容器 */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 1 }} />
      
      {/* 💡 測試 3：黑色除錯狀態浮水印 */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', padding: '20px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold' }}>
        <h3 style={{ color: '#4ade80', margin: '0 0 10px 0' }}>獨立測試模式啟動 🚀</h3>
        <p style={{ margin: '5px 0' }}>地圖狀態：{status}</p>
        <p style={{ margin: '5px 0' }}>按鈕模式 (appMode)：<span style={{ color: 'yellow' }}>{appMode}</span></p>
      </div>

      {/* 💡 測試 4：紅色超粗外框，測試您的按鈕有沒有反應 */}
      {appMode === 'distance' && (
        <div style={{ position: 'absolute', inset: 0, border: '15px solid red', pointerEvents: 'none', zIndex: 9998 }} />
      )}
    </div>
  );
}