import { useRef, useEffect, useState } from 'react';
import './App.css';

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [currentView, setCurrentView] = useState('booth');
  const [photos, setPhotos] = useState(() => {
    const savedPhotos = localStorage.getItem('myCutePhotos');
    return savedPhotos ? JSON.parse(savedPhotos) : [];
  });

  const [countdown, setCountdown] = useState(null); 
  const [filter, setFilter] = useState('none'); 
  const [isTakingStrip, setIsTakingStrip] = useState(false);
  
  const availableStickers = ['tulip.png', 'sunflower.png', 'ribbon.png','cute1.png', 'kitty.png', 'chick.png', 'clouds.png','teddy.png'];
  const [activeStickers, setActiveStickers] = useState([]);
  const [editingStickerId, setEditingStickerId] = useState(null);

  useEffect(() => {
    localStorage.setItem('myCutePhotos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        alert("Oops! I need camera access! 🥺");
      }
    }
    if (currentView === 'booth') startCamera();
  }, [currentView]);

  // ==========================================
  // STICKER LOGIC
  // ==========================================
  const addSticker = (stickerName) => {
    const newId = Date.now();
    setActiveStickers(prev => [...prev, { id: newId, name: stickerName, x: 100, y: 100, scale: 1, rotation: 0 }]);
    setEditingStickerId(newId); 
  };

  const onStickerDrag = (id, e) => {
    const cameraBox = document.querySelector('.camera-inner');
    if (!cameraBox) return;
    const bounds = cameraBox.getBoundingClientRect();
    let newX = e.clientX - bounds.left - 50; 
    let newY = e.clientY - bounds.top - 50;
    setActiveStickers(prev => prev.map(stk => (stk.id === id ? { ...stk, x: newX, y: newY } : stk)));
  };

  const updateActiveSticker = (property, value) => {
    setActiveStickers(prev => prev.map(stk => (stk.id === editingStickerId ? { ...stk, [property]: value } : stk)));
  };

  const deleteActiveSticker = () => {
    setActiveStickers(prev => prev.filter(stk => stk.id !== editingStickerId));
    setEditingStickerId(null);
  };

  // ==========================================
  // THE NEW MAGIC DRAWING LOGIC! 🖌️
  // ==========================================
  // We added "async" so it can wait for stickers to load
  const drawBaseImage = async (exportCanvas, exportCtx) => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    
    exportCanvas.width = video.videoWidth;
    exportCanvas.height = video.videoHeight;
    
    // 1. Draw the Video (Flipped like a mirror)
    exportCtx.translate(exportCanvas.width, 0);
    exportCtx.scale(-1, 1);
    exportCtx.filter = filter; 
    exportCtx.drawImage(video, 0, 0, exportCanvas.width, exportCanvas.height);
    
    // 2. RESET the flip and filter so stickers draw normally!
    exportCtx.setTransform(1, 0, 0, 1, 0, 0); 
    exportCtx.filter = 'none';

    // 3. DO THE MATH: Figure out where to draw the stickers
    const cameraBox = document.querySelector('.camera-inner');
    if (cameraBox && activeStickers.length > 0) {
      
      // Calculate the size difference between the screen and the raw photo
      const scaleX = exportCanvas.width / cameraBox.clientWidth;
      const scaleY = exportCanvas.height / cameraBox.clientHeight;

      // Load all sticker images into memory
      const loadedImages = await Promise.all(activeStickers.map(stk => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ img, stk });
          img.src = `/${stk.name}`;
        });
      }));

      // Draw each sticker onto the final canvas!
      loadedImages.forEach(({ img, stk }) => {
        const domSize = 100; // Base width of our stickers
        
        // Find the exact center point on the canvas
        const centerX = (stk.x + domSize / 2) * scaleX;
        const centerY = (stk.y + domSize / 2) * scaleY;
        
        // Find the exact scaled size
        const drawSizeX = domSize * scaleX * stk.scale;
        const drawSizeY = domSize * scaleY * stk.scale;

        exportCtx.translate(centerX, centerY); // Move to the center
        exportCtx.rotate((stk.rotation * Math.PI) / 180); // Spin it
        exportCtx.drawImage(img, -drawSizeX / 2, -drawSizeY / 2, drawSizeX, drawSizeY); // Draw it!
        exportCtx.setTransform(1, 0, 0, 1, 0, 0); // Reset for the next sticker
      });
    }
  };

  // We had to add "async" here so it can wait for the drawing!
  const takeSinglePhoto = async () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) return;
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    
    await drawBaseImage(exportCanvas, exportCtx); // WAIT for drawing
    
    const imageUrl = exportCanvas.toDataURL('image/png');
    setPhotos(prevPhotos => [{ id: Date.now(), url: imageUrl, note: '', date: new Date().toLocaleString(), type: 'single' }, ...prevPhotos]);
    setActiveStickers([]);
    setEditingStickerId(null);
  };

  const startTimer = () => {
    if (countdown !== null || isTakingStrip) return; 
    setCountdown(3); 
    setEditingStickerId(null); 
    let timerNumber = 3;
    const interval = setInterval(() => {
      timerNumber -= 1;
      if (timerNumber > 0) {
        setCountdown(timerNumber); 
      } else {
        clearInterval(interval); 
        setCountdown(null); 
        takeSinglePhoto(); 
      }
    }, 1000); 
  };

  const startStrip = async () => {
    if (countdown !== null || isTakingStrip || !videoRef.current || videoRef.current.videoWidth === 0) return;
    setIsTakingStrip(true);
    setEditingStickerId(null);
    const capturedUrls = [];
    const video = videoRef.current;

    for (let i = 1; i <= 4; i++) {
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(null);
      
      const exportCanvas = document.createElement('canvas');
      await drawBaseImage(exportCanvas, exportCanvas.getContext('2d')); // WAIT for drawing
      capturedUrls.push(exportCanvas.toDataURL('image/png'));
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const stripCanvas = document.createElement('canvas');
    const sCtx = stripCanvas.getContext('2d');
    const padding = 20; const bottomSpace = 100;
    const imgWidth = video.videoWidth; const imgHeight = video.videoHeight;
    stripCanvas.width = imgWidth + (padding * 2);
    stripCanvas.height = (imgHeight * 4) + (padding * 5) + bottomSpace;
    sCtx.fillStyle = '#FFFFFF'; sCtx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);
    
    const loadedImages = await Promise.all(capturedUrls.map(url => {
      return new Promise(res => { const img = new Image(); img.onload = () => res(img); img.src = url; });
    }));
    
    loadedImages.forEach((img, index) => {
      sCtx.drawImage(img, padding, padding + (index * (imgHeight + padding)), imgWidth, imgHeight);
    });
    
    sCtx.fillStyle = '#FFB6C1'; sCtx.font = 'bold 40px Quicksand, sans-serif'; sCtx.textAlign = 'center';
    sCtx.fillText('✨ My Cute Photobooth ✨', stripCanvas.width / 2, stripCanvas.height - 40);
    
    setPhotos(prev => [{ id: Date.now(), url: stripCanvas.toDataURL('image/png'), note: '', date: new Date().toLocaleString(), type: 'strip' }, ...prev]);
    setIsTakingStrip(false);
  };

  const deletePhoto = (idToRemove) => setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== idToRemove));
  const updateNote = (id, newNoteText) => setPhotos(prevPhotos => prevPhotos.map(photo => (photo.id === id ? { ...photo, note: newNoteText } : photo)));

  return (
    <div className="app-main-layout">
      
      <nav className="side-nav">
        <div className="nav-logo">✨</div>
        <button className={`nav-btn ${currentView === 'booth' ? 'active' : ''}`} onClick={() => setCurrentView('booth')}>📸<br/>Booth</button>
        <button className={`nav-btn ${currentView === 'scrapbook' ? 'active' : ''}`} onClick={() => setCurrentView('scrapbook')}>📚<br/>Scrapbook</button>
      </nav>

      {currentView === 'booth' && (
        <div className="center-stage animate-fade-in">
          <h1>My Cute Photobooth</h1>
          
          <div className="camera-box">
            {countdown !== null && <div className="countdown-overlay">{countdown}</div>}
            {isTakingStrip && countdown === null && <div className="countdown-overlay" style={{fontSize: '4rem'}}>📸 Snap!</div>}
            
            <div className="camera-inner" onClick={(e) => { if (e.target.tagName !== 'IMG') setEditingStickerId(null); }}>
              {activeStickers.map(stk => (
                <img 
                  key={stk.id} src={`/${stk.name}`} alt="Sticker"
                  className={`sticker-overlay ${editingStickerId === stk.id ? 'is-editing' : ''}`}
                  style={{ left: stk.x, top: stk.y, transform: `scale(${stk.scale}) rotate(${stk.rotation}deg)` }}
                  draggable="true" onDragEnd={(e) => onStickerDrag(stk.id, e)}
                  onClick={(e) => { e.stopPropagation(); setEditingStickerId(stk.id); }}
                />
              ))}
              <video ref={videoRef} autoPlay playsInline className="mirror-video" style={{ filter: filter }}></video>
            </div>
          </div>

          {editingStickerId ? (
            <div className="sticker-editor-panel animate-slide-up">
              <h3>🎨 Edit Sticker</h3>
              <div className="editor-controls">
                <label>Size: <input type="range" min="0.5" max="3" step="0.1" value={activeStickers.find(s => s.id === editingStickerId)?.scale || 1} onChange={(e) => updateActiveSticker('scale', parseFloat(e.target.value))} /></label>
                <label>Spin: <input type="range" min="-180" max="180" step="5" value={activeStickers.find(s => s.id === editingStickerId)?.rotation || 0} onChange={(e) => updateActiveSticker('rotation', parseInt(e.target.value))} /></label>
                <button className="delete-sticker-btn" onClick={deleteActiveSticker}>🗑️ Remove</button>
              </div>
            </div>
          ) : (
            <div className="sticker-panel">
              <h3>🎀 Add a Sticker!</h3>
              <div className="sticker-list">
                {availableStickers.map(stkName => (
                  <button key={stkName} className="sticker-pick-btn" onClick={() => addSticker(stkName)}>
                    <img src={`/${stkName}`} alt="Sticker" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 🌟 THE NEW 8-BUTTON FILTER ROW */}
          <div className="filter-row">
            <button className="filter-btn" onClick={() => setFilter('none')} title="Normal">🌸</button>
            <button className="filter-btn" onClick={() => setFilter('grayscale(100%)')} title="B&W">🖤</button>
            <button className="filter-btn" onClick={() => setFilter('sepia(80%)')} title="Vintage">🕰️</button>
            <button className="filter-btn pink-f" onClick={() => setFilter('sepia(50%) hue-rotate(290deg) saturate(150%)')} title="Pink">🎀</button>
            
            <button className="filter-btn" onClick={() => setFilter('invert(100%)')} title="Invert" style={{borderColor: '#b2fba5', color: '#888'}}>👽</button>
            <button className="filter-btn" onClick={() => setFilter('blur(4px)')} title="Soft Blur" style={{borderColor: '#aec6cf', color: '#888'}}>☁️</button>
            <button className="filter-btn" onClick={() => setFilter('contrast(150%) brightness(110%)')} title="Pop Contrast" style={{borderColor: '#ffd1dc', color: '#888'}}>🍿</button>
            <button className="filter-btn" onClick={() => setFilter('hue-rotate(180deg) saturate(150%)')} title="Cool Ice" style={{borderColor: '#e0f7fa', color: '#888'}}>🧊</button>
          </div>

          <div className="action-button-row">
            <button className="capture-btn giant-snap-btn" onClick={startTimer} disabled={isTakingStrip}>📸 Single Pic</button>
            <button className="capture-btn giant-snap-btn strip-btn" onClick={startStrip} disabled={isTakingStrip}>🎞️ 4-Pic Strip!</button>
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
      )}

      {currentView === 'scrapbook' && (
        <div className="center-stage scrapbook-stage animate-fade-in">
          <h2>📚 My Scrapbook</h2>
          {photos.length === 0 ? (
            <p className="empty-text">Your scrapbook is empty! Go take some cute photos! 📸</p>
          ) : (
            <div className="scrapbook-grid">
              {photos.map((photo) => (
                <div key={photo.id} className="scrapbook-card-v2">
                  <div className="card-image-container">
                    <img src={photo.url} alt="Memory" className="scrapbook-img" />
                    <button onClick={() => deletePhoto(photo.id)} className="delete-memory-btn">❌</button>
                  </div>
                  <div className="card-details">
                    <small className="date-text">{photo.date}</small>
                    <textarea className="memory-input" value={photo.note} placeholder="Write your memory here... ✨" onChange={(e) => updateNote(photo.id, e.target.value)} />
                    <a href={photo.url} download={`memory-${photo.id}.png`} className="download-memory-btn">⬇️ Download Photo</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}