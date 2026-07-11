'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, Edit3, Image as ImageIcon, Sparkles, RefreshCw, Trash2, ArrowUp, Scissors, Play, Upload } from 'lucide-react';

interface SolverCanvasProps {
  onSolve: (query: string, base64Image: string | null) => void;
  targetExam: string;
}

function generateTextAsBase64Image(text: string): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Background gradient for a modern feel
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#0f172a'); // slate-900
  gradient.addColorStop(1, '#1e1b4b'); // indigo-950
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Outer decorative border
  ctx.strokeStyle = '#3b82f6'; // blue-500
  ctx.lineWidth = 6;
  ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
  
  // Inner border
  ctx.strokeStyle = '#1d4ed8'; // blue-700
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Label watermark at top
  ctx.fillStyle = '#60a5fa'; // blue-400
  ctx.font = '900 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXAMSPRINT AI - LIVE SCANNER', canvas.width / 2, 45);
  
  // Text styling for the question
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Wrap text
  const words = text.split(' ');
  let line = '';
  const lines = [];
  const maxWidth = canvas.width - 80;
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  
  // Draw lines centered
  const startY = (canvas.height - (lines.length * 30)) / 2 + 15;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i].trim(), canvas.width / 2, startY + i * 32);
  }
  
  return canvas.toDataURL('image/jpeg');
}

const MOCK_OCR_SAMPLES = [
  {
    id: "tw-sample",
    label: "⏱️ Time & Work Sample",
    text: "A can do a work in 10 days, B can do it in 15 days. In how many days can they complete it together?"
  },
  {
    id: "pct-sample",
    label: "📈 Percentage Net Change",
    text: "The price of sugar increases by 20% and consumption decreases by 10%. Find net change."
  }
];

export default function SolverCanvas({ onSolve, targetExam }: SolverCanvasProps) {
  const [mode, setMode] = useState<'type' | 'draw' | 'camera'>('type');
  const [typedQuery, setTypedQuery] = useState('');
  
  // Sketch Canvas States
  const sketchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Camera & Cropper States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState(MOCK_OCR_SAMPLES[0]);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  
  // Crop coordinates (Click & Drag)
  const [cropStart, setCropStart] = useState<{ x: number, y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number, y: number } | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  // Initialize Sketch Canvas
  useEffect(() => {
    if (mode !== 'draw') return;
    const canvas = sketchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [mode]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // ✅ CRITICAL FIX: Attach stream to video element AFTER React renders the <video> node
  // videoRef.current is null until cameraActive=true causes a re-render.
  // This effect runs after that re-render so videoRef.current is available.
  useEffect(() => {
    if (!stream || !cameraActive) return;
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    video.play().catch(err => console.warn('Video play error:', err));
  }, [stream, cameraActive]);

  // Synchronously draw uploaded/captured image when canvas element is loaded in DOM
  useEffect(() => {
    if (!capturedImage || cameraActive) return;

    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxW = 400;
      const scale = Math.min(maxW / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      setCropStart({ x: 10, y: 10 });
      setCropEnd({ x: canvas.width - 10, y: canvas.height - 10 });
    };
    img.src = capturedImage;
  }, [capturedImage, cameraActive, mode]);

  // Sketch pad drawing
  const startSketchDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    drawSketch(e);
  };

  const stopSketchDraw = () => {
    setIsDrawing(false);
    sketchCanvasRef.current?.getContext('2d')?.beginPath();
  };

  const drawSketch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sketchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearSketch = () => {
    const canvas = sketchCanvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSolveDraw = () => {
    const canvas = sketchCanvasRef.current;
    if (!canvas) return;
    setScanning(true);
    setScanStep('Running handwriting vectorizer...');
    
    setTimeout(() => {
      setScanning(false);
      // Convert sketch canvas to base64 image and send
      const dataUrl = canvas.toDataURL('image/jpeg');
      onSolve("Handwritten equation", dataUrl);
    }, 1500);
  };

  // Real Camera Operations
  const startCamera = async () => {
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      setCameraActive(true);
      // ✅ DO NOT set srcObject here — videoRef.current is null until after re-render.
      // The useEffect above handles this after cameraActive triggers the <video> to mount.
    } catch (err) {
      console.warn('Camera failed to initialize. Falling back to file uploads.', err);
      // Try rear camera (mobile) before giving up
      try {
        const fallback = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(fallback);
        setCameraActive(true);
      } catch {
        alert('Camera not accessible. Please upload an image file instead.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  const captureSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    setScanning(true);
    setScanStep('📸 Capturing frame...');

    setTimeout(() => {
      setScanStep('🔍 Processing image for AI solver...');
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
      setScanning(false);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        stopCamera(); // Stop live webcam stream
        setCapturedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Crop Canvas mouse/touch drag handlers
  const handleCropperMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCropStart({ x, y });
    setCropEnd({ x, y });
    setIsCropping(true);
  };

  const handleCropperMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !cropStart) return;
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCropEnd({ x, y });
  };

  const handleCropperMouseUp = () => {
    setIsCropping(false);
  };

  const handleCropperTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    setCropStart({ x, y });
    setCropEnd({ x, y });
    setIsCropping(true);
  };

  const handleCropperTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isCropping || !cropStart) return;
    e.preventDefault(); // Prevent page bounce/scroll on mobile
    const canvas = cropCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    setCropEnd({ x, y });
  };

  const handleCropperTouchEnd = () => {
    setIsCropping(false);
  };

  // Trigger solver using cropped image part
  const handleCropAndSolve = () => {
    const canvas = cropCanvasRef.current;
    if (!canvas || !cropStart || !cropEnd || !capturedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setScanning(true);
    setScanStep('Aligning crop crop bounds...');

    setTimeout(() => {
      setScanStep('Sending image to Gemini Vision model...');
      
      // Slice and generate cropped base64 image
      const x = Math.min(cropStart.x, cropEnd.x);
      const y = Math.min(cropStart.y, cropEnd.y);
      const w = Math.abs(cropStart.x - cropEnd.x);
      const h = Math.abs(cropStart.y - cropEnd.y);

      // Create temporary canvas to extract cropped pixels
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = w || 100;
      tempCanvas.height = h || 100;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        tempCtx.drawImage(canvas, x, y, w, h, 0, 0, tempCanvas.width, tempCanvas.height);
        const croppedBase64 = tempCanvas.toDataURL('image/jpeg');
        setScanning(false);
        onSolve("Vision OCR math formula", croppedBase64);
      } else {
        setScanning(false);
        onSolve("Vision OCR math formula", capturedImage);
      }
    }, 1200);
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-6 overflow-hidden">
      {/* Mode selectors */}
      <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl mb-5">
        <button
          type="button"
          onClick={() => { stopCamera(); setMode('type'); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
            mode === 'type' ? 'bg-[var(--theme-accent)] text-white shadow-md' : 'text-[var(--theme-text-secondary)] hover:text-white'
          }`}
        >
          <Edit3 size={14} /> Keyboard Input
        </button>
        <button
          type="button"
          onClick={() => { stopCamera(); setMode('draw'); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
            mode === 'draw' ? 'bg-[var(--theme-accent)] text-white shadow-md' : 'text-[var(--theme-text-secondary)] hover:text-white'
          }`}
        >
          <Sparkles size={14} /> Sketch Pad
        </button>
        <button
          type="button"
          onClick={() => { stopCamera(); setMode('camera'); }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
            mode === 'camera' ? 'bg-[var(--theme-accent)] text-white shadow-md' : 'text-[var(--theme-text-secondary)] hover:text-white'
          }`}
        >
          <Camera size={14} /> Scan & Upload
        </button>
      </div>

      {/* RENDER MODES */}
      {mode === 'type' && (
        <form onSubmit={(e) => { e.preventDefault(); onSolve(typedQuery, null); }} className="space-y-4 animate-fade-in">
          <div className="relative">
            <textarea
              value={typedQuery}
              onChange={(e) => setTypedQuery(e.target.value)}
              placeholder="Type your mathematics equation, word problem, or Vedic trick target here..."
              className="w-full min-h-[140px] px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[var(--theme-accent)] focus:outline-none text-white placeholder-white/30 text-sm resize-none"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="text-[10px] text-[var(--theme-text-secondary)] font-medium">Real AI Active</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-[var(--theme-text-secondary)]">Tip: Type any algebra, geometry, or simplification problem to solve.</span>
            <button
              type="submit"
              disabled={!typedQuery.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-xs font-bold hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer shadow-lg"
            >
              Solve Problem <ArrowUp size={14} />
            </button>
          </div>
        </form>
      )}

      {mode === 'draw' && (
        <div className="space-y-4 animate-fade-in relative">
          <div className="relative border border-white/10 bg-slate-950/60 rounded-xl overflow-hidden h-[180px]">
            <canvas
              ref={sketchCanvasRef}
              width={500}
              height={180}
              onMouseDown={startSketchDraw}
              onMouseUp={stopSketchDraw}
              onMouseLeave={stopSketchDraw}
              onMouseMove={drawSketch}
              onTouchStart={startSketchDraw}
              onTouchEnd={stopSketchDraw}
              onTouchMove={drawSketch}
              className="w-full h-full cursor-crosshair touch-none"
            />
            
            <div className="absolute top-2 right-2 flex items-center gap-2">
              <button
                type="button"
                onClick={clearSketch}
                className="p-2 bg-white/5 border border-white/10 rounded-lg text-[var(--theme-text-secondary)] hover:text-white hover:bg-white/10 transition-all"
                title="Clear Sketchpad"
              >
                <Trash2 size={13} />
              </button>
            </div>
            
            {scanning && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-center p-4">
                <div className="w-8 h-8 border-3 border-[var(--theme-accent)] border-t-transparent rounded-full animate-spin mb-3" />
                <div className="text-sm font-semibold text-gradient">{scanStep}</div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSolveDraw}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-xs font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-lg"
            >
              Analyze Handwriting <Sparkles size={14} />
            </button>
          </div>
        </div>
      )}

      {mode === 'camera' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preset Samples Loader */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-text-secondary)] block mb-1">Preset Practice Cards</span>
              <div className="flex flex-wrap gap-1.5">
                {MOCK_OCR_SAMPLES.map(sample => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      stopCamera();
                      const base64Data = generateTextAsBase64Image(sample.text);
                      setCapturedImage(base64Data);
                    }}
                    className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-[10px] rounded-lg text-white font-semibold cursor-pointer transition-all hover:bg-white/10"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Active Control Bar */}
            {(cameraActive || capturedImage) && (
              <div className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-xl border border-white/5 self-end min-h-[48px]">
                {cameraActive ? (
                  <>
                    <span className="text-[10px] text-green-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live Feed
                    </span>
                    <button
                      type="button"
                      onClick={captureSnapshot}
                      className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-[10px] font-black text-slate-950 active:scale-95 transition-all cursor-pointer"
                    >
                      Snap Photo
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-1.5">
                      📷 Image Loaded
                    </span>
                    <div className="flex gap-2">
                      <label className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] text-white font-bold rounded-lg cursor-pointer transition-all active:scale-95">
                        Replace File
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload} 
                          className="hidden" 
                        />
                      </label>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] text-white font-bold rounded-lg transition-all active:scale-95"
                      >
                        Use Cam
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Rendering active screen (video or crop canvas) */}
          <div className="relative border border-white/10 bg-slate-950/60 rounded-xl overflow-hidden min-h-[220px] flex items-center justify-center p-4">
            
            {/* Live Video Feed */}
            {cameraActive && (
              <div className="relative">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline
                  className="w-full max-w-sm h-48 object-cover rounded-lg"
                />
                {/* Live scanner animation overlay */}
                <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan-line" />
                </div>
              </div>
            )}

            {/* Cropping Editor Canvas */}
            {!cameraActive && capturedImage && (
              <div className="relative">
                <canvas
                  ref={cropCanvasRef}
                  onMouseDown={handleCropperMouseDown}
                  onMouseMove={handleCropperMouseMove}
                  onMouseUp={handleCropperMouseUp}
                  onTouchStart={handleCropperTouchStart}
                  onTouchMove={handleCropperTouchMove}
                  onTouchEnd={handleCropperTouchEnd}
                  className="max-w-full rounded-lg border border-white/5 cursor-crosshair"
                />
                
                {/* Crop Box guidelines overlay */}
                {cropStart && cropEnd && (
                  <div 
                    className="absolute border-2 border-dashed border-yellow-400 bg-yellow-400/5 pointer-events-none"
                    style={{
                      left: `${Math.min(cropStart.x, cropEnd.x)}px`,
                      top: `${Math.min(cropStart.y, cropEnd.y)}px`,
                      width: `${Math.abs(cropStart.x - cropEnd.x)}px`,
                      height: `${Math.abs(cropStart.y - cropEnd.y)}px`
                    }}
                  />
                )}
              </div>
            )}

            {!cameraActive && !capturedImage && (
              <div className="text-center text-[var(--theme-text-secondary)] py-8 px-4 max-w-sm mx-auto space-y-4">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-[var(--theme-accent)]">
                  <Upload size={24} className="animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-1">Upload or Scan Question</p>
                  <p className="text-xs text-[var(--theme-text-secondary)]">Drag and drop or select a question photo, use a sample, or activate the camera scanner.</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <label className="flex items-center gap-1.5 py-2 px-4 bg-[var(--theme-accent)] hover:opacity-90 text-xs text-white font-bold rounded-xl cursor-pointer transition-all shadow-lg active:scale-95">
                    <Upload size={13} /> Select Image
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center gap-1.5 py-2 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white font-bold rounded-xl transition-all active:scale-95"
                  >
                    <Camera size={13} /> Use Camera
                  </button>
                </div>
              </div>
            )}

            {scanning && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-4 z-10">
                <div className="w-8 h-8 border-3 border-[var(--theme-accent)] border-t-transparent rounded-full animate-spin mb-3" />
                <div className="text-sm font-semibold text-gradient">{scanStep}</div>
              </div>
            )}
          </div>

          {!cameraActive && capturedImage && (
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[var(--theme-text-secondary)]">Drag bounding coordinates over math formulas to crop exactly.</span>
              <button
                type="button"
                onClick={handleCropAndSolve}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 rounded-lg text-xs font-bold text-white active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                Solve Cropped Image <Sparkles size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
