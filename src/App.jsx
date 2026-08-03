import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import FloatingBackground from './components/FloatingBackground';
import CursorTrail from './components/CursorTrail';
import Mascot from './components/Mascot';
import Toasts from './components/Toasts';
import Confetti from './components/Confetti';
import PolaroidPrint from './components/PolaroidPrint';
import ThemeSwitcher, { THEMES } from './components/ThemeSwitcher';
import { sounds, setMuted, isMuted } from './sounds';

// Sticker categories for the redesigned panel
const STICKER_CATEGORIES = [
  { id: 'all', label: '✨ All' },
  { id: 'flowers', label: '🌸 Flowers' },
  { id: 'animals', label: '🐾 Animals' },
  { id: 'clouds', label: '☁️ Clouds' },
  { id: 'bows', label: '🎀 Bows' },
  { id: 'cute', label: '💖 Cute' },
];

const STICKER_META = {
  'tulip.png': 'flowers',
  'sunflower.png': 'flowers',
  'ribbon.png': 'bows',
  'cute1.png': 'cute',
  'kitty.png': 'animals',
  'chick.png': 'animals',
  'clouds.png': 'clouds',
  'teddy.png': 'animals',
};

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

  const availableStickers = ['tulip.png', 'sunflower.png', 'ribbon.png', 'cute1.png', 'kitty.png', 'chick.png', 'clouds.png', 'teddy.png'];
  const [activeStickers, setActiveStickers] = useState([]);
  const [editingStickerId, setEditingStickerId] = useState(null);

  // New premium state
  const [cameraStarted, setCameraStarted] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [print, setPrint] = useState(null);
  const [activeTab, setActiveTab] = useState('stickers');
  const [soundsOn, setSoundsOn] = useState(true);
  const [theme, setTheme] = useState('default');
  const [stickerCategory, setStickerCategory] = useState('all');
  const [stickerSearch, setStickerSearch] = useState('');
  const [isCameraOn, setIsCameraOn] = useState(false);

  useEffect(() => {
    localStorage.setItem('myCutePhotos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraStarted(true);
        setIsCameraOn(true);
      } catch (err) {
        alert("Oops! I need camera access! 🥺");
      }
    }
    if (currentView === 'booth') startCamera();
  }, [currentView]);

  // apply theme
  useEffect(() => {
    const active = THEMES.find((t) => t.id === theme) || THEMES[0];
    document.documentElement.style.setProperty('--pink', active.primary);
    document.documentElement.style.setProperty('--baby-pink', active.light);
  }, [theme]);

  // toasts auto-dismiss
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => setToasts((prev) => prev.slice(1)), 2600);
    return () => clearTimeout(timer);
  }, [toasts]);

  const addToast = (message, type = 'info') => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, type }]);
  };

  const toggleSound = () => {
    const next = !soundsOn;
    setSoundsOn(next);
    setMuted(!next);
    if (next) sounds.click();
  };

  // ==========================================
  // STICKER LOGIC
  // ==========================================
  const addSticker = (stickerName) => {
    const newId = Date.now();
    setActiveStickers(prev => [...prev, { id: newId, name: stickerName, x: 100, y: 100, scale: 1, rotation: 0 }]);
    setEditingStickerId(newId);
    sounds.sticker();
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
  const drawBaseImage = async (exportCanvas, exportCtx) => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    exportCanvas.width = video.videoWidth;
    exportCanvas.height = video.videoHeight;

    exportCtx.translate(exportCanvas.width, 0);
    exportCtx.scale(-1, 1);
    exportCtx.filter = filter;
    exportCtx.drawImage(video, 0, 0, exportCanvas.width, exportCanvas.height);

    exportCtx.setTransform(1, 0, 0, 1, 0, 0);
    exportCtx.filter = 'none';

    const cameraBox = document.querySelector('.camera-inner');
    if (cameraBox && activeStickers.length > 0) {
      const scaleX = exportCanvas.width / cameraBox.clientWidth;
      const scaleY = exportCanvas.height / cameraBox.clientHeight;

      const loadedImages = await Promise.all(activeStickers.map(stk => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ img, stk });
          img.src = `/${stk.name}`;
        });
      }));

      loadedImages.forEach(({ img, stk }) => {
        const domSize = 100;
        const centerX = (stk.x + domSize / 2) * scaleX;
        const centerY = (stk.y + domSize / 2) * scaleY;
        const drawSizeX = domSize * scaleX * stk.scale;
        const drawSizeY = domSize * scaleY * stk.scale;

        exportCtx.translate(centerX, centerY);
        exportCtx.rotate((stk.rotation * Math.PI) / 180);
        exportCtx.drawImage(img, -drawSizeX / 2, -drawSizeY / 2, drawSizeX, drawSizeY);
        exportCtx.setTransform(1, 0, 0, 1, 0, 0);
      });
    }
  };

  const takeSinglePhoto = async () => {
    if (!videoRef.current || videoRef.current.videoWidth === 0) return;
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');

    await drawBaseImage(exportCanvas, exportCtx);

    const imageUrl = exportCanvas.toDataURL('image/png');
    setPhotos(prevPhotos => [{ id: Date.now(), url: imageUrl, note: '', date: new Date().toLocaleString(), type: 'single' }, ...prevPhotos]);
    setActiveStickers([]);
    setEditingStickerId(null);
    sounds.print();
    setPrint({ id: Date.now(), url: imageUrl });
    setConfettiTrigger((n) => n + 1);
    addToast('Photo captured! So cute! 💖', 'success');
  };

  const startTimer = () => {
    if (countdown !== null || isTakingStrip) return;
    sounds.countdown();
    setCountdown(3);
    setEditingStickerId(null);
    let timerNumber = 3;
    const interval = setInterval(() => {
      timerNumber -= 1;
      if (timerNumber > 0) {
        setCountdown(timerNumber);
        sounds.countdown();
      } else {
        clearInterval(interval);
        setCountdown(null);
        sounds.shutter();
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
        sounds.countdown();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(null);
      sounds.shutter();

      const exportCanvas = document.createElement('canvas');
      await drawBaseImage(exportCanvas, exportCanvas.getContext('2d'));
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

    const stripUrl = stripCanvas.toDataURL('image/png');
    setPhotos(prev => [{ id: Date.now(), url: stripUrl, note: '', date: new Date().toLocaleString(), type: 'strip' }, ...prev]);
    setIsTakingStrip(false);
    sounds.success();
    setPrint({ id: Date.now(), url: stripUrl });
    setConfettiTrigger((n) => n + 1);
    addToast('4-pic strip printed! 🎞️', 'success');
  };

  const deletePhoto = (idToRemove) => setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== idToRemove));
  const updateNote = (id, newNoteText) => setPhotos(prevPhotos => prevPhotos.map(photo => (photo.id === id ? { ...photo, note: newNoteText } : photo)));

  // Filter definitions for ribbon tabs
  const FILTERS = [
    { id: 'none', label: 'Normal', icon: '🌸', css: 'none' },
    { id: 'bw', label: 'B&W', icon: '🖤', css: 'grayscale(100%)' },
    { id: 'vintage', label: 'Vintage', icon: '🕰️', css: 'sepia(80%)' },
    { id: 'pink', label: 'Pink', icon: '🎀', css: 'sepia(50%) hue-rotate(290deg) saturate(150%)' },
    { id: 'invert', label: 'Invert', icon: '👽', css: 'invert(100%)' },
    { id: 'blur', label: 'Soft Blur', icon: '☁️', css: 'blur(4px)' },
    { id: 'pop', label: 'Pop', icon: '🍿', css: 'contrast(150%) brightness(110%)' },
    { id: 'cool', label: 'Cool Ice', icon: '🧊', css: 'hue-rotate(180deg) saturate(150%)' },
  ];

  const filteredStickers = availableStickers.filter((name) => {
    const inCategory = stickerCategory === 'all' || STICKER_META[name] === stickerCategory;
    const matchesSearch = name.toLowerCase().includes(stickerSearch.toLowerCase());
    return inCategory && matchesSearch;
  });

  const setFilterFromCss = (css) => setFilter(css);

  return (
    <div className={`app-main-layout theme-${theme}`}>
      <FloatingBackground />
      <CursorTrail />
      <Mascot />
      <Confetti trigger={confettiTrigger} />
      <PolaroidPrint print={print} />
      <Toasts toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

      <nav className="side-nav">
        <div className="nav-logo">✨</div>
        <button
          className={`nav-btn ${currentView === 'booth' ? 'active' : ''}`}
          onClick={() => { setCurrentView('booth'); sounds.click(); }}
        >
          <span className="nav-icon">📸</span><br />Booth
        </button>
        <button
          className={`nav-btn ${currentView === 'scrapbook' ? 'active' : ''}`}
          onClick={() => { setCurrentView('scrapbook'); sounds.click(); }}
        >
          <span className="nav-icon">📚</span><br />Scrapbook
        </button>
        <div className="nav-spacer" />
        <button className="sound-toggle" onClick={toggleSound} title="Toggle sounds">
          {soundsOn ? '🔊' : '🔇'}
        </button>
      </nav>

      {currentView === 'booth' && (
        <div className="center-stage animate-fade-in">
          <h1 className="hero-title">
            <span className="title-sparkle">✨</span> My Cute Photobooth{' '}
            <span className="title-sparkle">✨</span>
          </h1>
          <p className="hero-sub">Smile! Your memories start here. 💕</p>

          <ThemeSwitcher
            currentTheme={theme}
            onSelect={(t) => { setTheme(t.id); sounds.click(); addToast(`${t.name} applied!`, 'sparkle'); }}
          />

          {/* Ribbon navigation tabs */}
          <div className="ribbon-tabs">
            {[
              { id: 'stickers', label: '🎀 Stickers' },
              { id: 'filters', label: '🎨 Filters' },
              { id: 'effects', label: '✨ Effects' },
            ].map((t) => (
              <button
                key={t.id}
                className={`ribbon-tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => { setActiveTab(t.id); sounds.click(); }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="camera-box">
            {countdown !== null && <div className="countdown-overlay">{countdown}</div>}
            {isTakingStrip && countdown === null && <div className="countdown-overlay" style={{ fontSize: '4rem' }}>📸 Snap!</div>}

            <div
              className={`camera-inner ${cameraStarted ? 'is-on' : ''} ${isCameraOn ? 'camera-live' : ''}`}
              onClick={(e) => { if (e.target.tagName !== 'IMG') setEditingStickerId(null); }}
            >
              {!cameraStarted && (
                <div className="camera-placeholder">
                  <span className="placeholder-camera">📷</span>
                  <span className="placeholder-stars">⭐</span>
                  <span className="placeholder-stars s2">✨</span>
                  <span className="placeholder-stars s3">💖</span>
                  <p>Smile! Your memories start here.</p>
                </div>
              )}
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
            (activeTab === 'stickers') && (
              <div className="sticker-panel">
                <h3>🎀 Add a Sticker!</h3>
                <div className="sticker-toolbar">
                  <input
                    className="sticker-search"
                    type="text"
                    placeholder="Search stickers..."
                    value={stickerSearch}
                    onChange={(e) => setStickerSearch(e.target.value)}
                  />
                </div>
                <div className="sticker-categories">
                  {STICKER_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      className={`category-pill ${stickerCategory === c.id ? 'active' : ''}`}
                      onClick={() => setStickerCategory(c.id)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <div className="sticker-list">
                  {filteredStickers.map(stkName => (
                    <button key={stkName} className="sticker-pick-btn" onClick={() => addSticker(stkName)}>
                      <img src={`/${stkName}`} alt="Sticker" />
                    </button>
                  ))}
                  {filteredStickers.length === 0 && <span className="no-stickers">No stickers found 🥺</span>}
                </div>
              </div>
            )
          )}

          {activeTab === 'filters' && (
            <div className="filter-row">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  className={`filter-btn ${filter === f.css ? 'selected' : ''} ${f.id === 'pink' ? 'pink-f' : ''}`}
                  onClick={() => { setFilterFromCss(f.css); sounds.click(); }}
                  title={f.label}
                >
                  <span className="filter-icon">{f.icon}</span>
                  <span className="filter-label">{f.label}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'effects' && (
            <div className="effects-panel">
              <p>✨ More effects coming soon! Keep shining! ✨</p>
            </div>
          )}

          <div className="action-button-row">
            <motion.button
              className="capture-btn giant-snap-btn"
              onClick={startTimer}
              disabled={isTakingStrip}
              whileTap={{ scale: 0.92 }}
              whileHover={{ y: -4, scale: 1.03 }}
            >
              📸 Single Pic
            </motion.button>
            <motion.button
              className="capture-btn giant-snap-btn strip-btn"
              onClick={startStrip}
              disabled={isTakingStrip}
              whileTap={{ scale: 0.92 }}
              whileHover={{ y: -4, scale: 1.03 }}
            >
              🎞️ 4-Pic Strip!
            </motion.button>
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
      )}

      {currentView === 'scrapbook' && (
        <div className="center-stage scrapbook-stage animate-fade-in">
          <h2 className="hero-title">📚 My Scrapbook</h2>
          {photos.length === 0 ? (
            <p className="empty-text">Your scrapbook is empty! Go take some cute photos! 📸</p>
          ) : (
            <div className="scrapbook-grid">
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  className="scrapbook-card-v2"
                  whileHover={{ y: -8, rotate: -1 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="washi-tape left" />
                  <div className="washi-tape right" />
                  <div className="card-image-container">
                    <img src={photo.url} alt="Memory" className="scrapbook-img" />
                    <button onClick={() => deletePhoto(photo.id)} className="delete-memory-btn">❌</button>
                  </div>
                  <div className="card-details">
                    <small className="date-text">✍️ {photo.date}</small>
                    <textarea className="memory-input" value={photo.note} placeholder="Write your memory here... ✨" onChange={(e) => updateNote(photo.id, e.target.value)} />
                    <a href={photo.url} download={`memory-${photo.id}.png`} className="download-memory-btn">⬇️ Download Photo</a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
