import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import logo from './assets/logo.svg?url';

const WheelOfChumps = () => {
  const [names, setNames] = useState('');
  const [task, setTask] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [currentDisplay, setCurrentDisplay] = useState('');
  const [rotation, setRotation] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const intervalRef = useRef(null);
  const rotationRef = useRef(null);
  const resultRef = useRef(null);

  const MAX_NAME_LENGTH = 500;
  const MAX_TASK_LENGTH = 200;
  const MAX_PARTICIPANTS = 50;
  const ALLOWED_CHARS = /^[a-zA-Z0-9\s,.\-']*$/;

  const handleNameInput = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_NAME_LENGTH && ALLOWED_CHARS.test(value)) {
      setNames(value);
    }
  };

  const handleTaskInput = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_TASK_LENGTH && ALLOWED_CHARS.test(value)) {
      setTask(value);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCurrentDisplay('');
    setRotation(0);
  };

  const handleCopyImage = async () => {
    if (!resultRef.current) return;

    try {
      setIsCapturing(true);
      await new Promise(resolve => setTimeout(resolve, 300));

      const blob = await toPng(resultRef.current, {
        cacheBust: true,
        backgroundColor: '#000000',
        pixelRatio: 2,
        skipAutoScale: true,
        filter: (node) => {
          return !node.classList?.contains('copy-exclude');
        }
      }).then(dataUrl => {
        return fetch(dataUrl).then(res => res.blob());
      });

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);

      toast.success('Result copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy image:', err);
      toast.error('Failed to copy image. Try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSpin = () => {
    const nameList = names.split(',').map(n => n.trim()).filter(Boolean);
    if (nameList.length === 0 || !task) {
      toast.error('Please provide at least one name and a task.');
      return;
    }
    if (nameList.length > MAX_PARTICIPANTS) {
      toast.error(`Too many participants! Maximum is ${MAX_PARTICIPANTS}.`);
      return;
    }

    setSpinning(true);
    setResult(null);
    setRotation(0);

    let elapsed = 0;
    let lastTime = Date.now();
    let currentRotation = 0;

    const rotateWheel = () => {
      const now = Date.now();
      const delta = now - lastTime;

      let rotationSpeed;
      if (elapsed < 1000) {
        rotationSpeed = 20; // Super fast
      } else if (elapsed < 2000) {
        rotationSpeed = 12; // Fast
      } else if (elapsed < 3000) {
        rotationSpeed = 6; // Medium
      } else if (elapsed < 3500) {
        rotationSpeed = 2; // Slow
      } else {
        rotationSpeed = 0; // Stop
      }

      if (rotationSpeed > 0) {
        currentRotation += rotationSpeed;
        setRotation(currentRotation);
        rotationRef.current = requestAnimationFrame(rotateWheel);
      }
    };

    rotateWheel();

    const cycleName = () => {
      const now = Date.now();
      elapsed += now - lastTime;
      lastTime = now;

      const randomName = nameList[Math.floor(Math.random() * nameList.length)];
      setCurrentDisplay(randomName);

      let delay;
      if (elapsed < 1000) {
        delay = 50; // Super fast
      } else if (elapsed < 2000) {
        delay = 100; // Fast
      } else if (elapsed < 3000) {
        delay = 200; // Medium
      } else if (elapsed < 3500) {
        delay = 400; // Slow
      } else {
        const chosen = nameList[Math.floor(Math.random() * nameList.length)];
        setResult(chosen);
        setCurrentDisplay(chosen);
        setSpinning(false);
        if (rotationRef.current) {
          cancelAnimationFrame(rotationRef.current);
        }

        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#d946ef', '#a855f7', '#22d3ee']
        });

        return;
      }

      intervalRef.current = setTimeout(cycleName, delay);
    };

    cycleName();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      if (rotationRef.current) {
        cancelAnimationFrame(rotationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !spinning && !result) {
        e.preventDefault();
        handleSpin();
      } else if (e.key === ' ' && result && !spinning) {
        e.preventDefault();
        handleReset();
      } else if (e.key === 'Escape' && result) {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [spinning, result, names, task]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white font-mono overflow-hidden">
      <Toaster
        position="top-center"
        toastOptions={{
          error: {
            style: {
              background: '#1a1625',
              color: '#ec4899',
              border: '1px solid #ec4899',
              fontFamily: 'monospace',
            },
          },
          success: {
            style: {
              background: '#1a1625',
              color: '#22d3ee',
              border: '1px solid #22d3ee',
              fontFamily: 'monospace',
            },
          },
        }}
      />
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <img src={logo} alt="Wheel of Chumps Logo" className="w-12 h-12 drop-shadow-[0_0_20px_rgba(236,72,153,0.6)]" />
        </motion.div>

        <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-500 to-purple-600 drop-shadow-[0_0_15px_#f472b6]">
          The Wheel of Chumps
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen p-6 pt-20">
        {!spinning && !result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-xl bg-white/5 backdrop-blur-md border border-fuchsia-500/40 shadow-2xl z-10 p-8 rounded-2xl space-y-4 mt-32"
          >
            <input
              placeholder="Enter names separated by commas"
              value={names}
              onChange={handleNameInput}
              className="w-full p-3 rounded-lg text-black bg-white/95 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
            />
            <input
              placeholder="Enter a task (e.g. Wash the dishes)"
              value={task}
              onChange={handleTaskInput}
              className="w-full p-3 rounded-lg text-black bg-white/95 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all"
            />
            <button
              onClick={handleSpin}
              className="w-full p-4 font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 text-white rounded-lg shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300 uppercase tracking-wider"
            >
              Spin the Wheel
            </button>
          </motion.div>
        )}

        <div className="flex flex-col justify-center items-center mt-4 z-10 w-full min-h-[650px]">
          {(spinning || result) && (
            <div className="relative w-[550px] h-[550px] flex items-center justify-center">
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.05s linear' }}
              >
                <div className="w-[550px] h-[550px] relative">
                  <svg className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 30px rgba(236, 72, 153, 0.6))' }}>
                    <defs>
                      <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#ec4899' }} />
                        <stop offset="50%" style={{ stopColor: '#d946ef' }} />
                        <stop offset="100%" style={{ stopColor: '#22d3ee' }} />
                      </linearGradient>
                    </defs>
                    <circle cx="275" cy="275" r="268" fill="none" stroke="url(#wheelGradient)" strokeWidth="10" opacity="0.8"/>
                    <circle cx="275" cy="275" r="252" fill="none" stroke="url(#wheelGradient)" strokeWidth="14"/>
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(12)].map((_, i) => {
                      const colors = ['#ec4899', '#d946ef', '#22d3ee', '#a855f7'];
                      const color = colors[i % 4];
                      return (
                        <div
                          key={i}
                          className="absolute w-2 h-60"
                          style={{
                            left: '50%',
                            top: '50%',
                            transformOrigin: 'center top',
                            transform: `translateX(-50%) rotate(${i * 30}deg)`,
                            background: `linear-gradient(to bottom, ${color}, transparent)`,
                            boxShadow: `0 0 12px ${color}`,
                            marginTop: '15px'
                          }}
                        />
                      );
                    })}
                  </div>

                  <div className="absolute inset-20 rounded-full border-3 border-purple-500/50"
                       style={{ boxShadow: '0 0 25px rgba(168, 85, 247, 0.4)' }}></div>

                  <div className="absolute inset-32 rounded-full border-3 border-cyan-400/60"
                       style={{ boxShadow: '0 0 25px rgba(34, 211, 238, 0.5)' }}></div>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-500 to-cyan-400"
                         style={{ boxShadow: '0 0 50px rgba(236, 72, 153, 0.8)' }}>
                      <div className="absolute inset-3 rounded-full bg-[#0f0c29] border-2 border-cyan-400"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[28px] border-l-transparent border-r-transparent border-t-cyan-400"
                     style={{
                       filter: 'drop-shadow(0 0 15px rgba(34, 211, 238, 1))'
                     }}>
                </div>
              </div>

              {result && !spinning && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="relative z-10"
                >
                  <div className="absolute -top-6 -left-6 w-8 h-8 border-t-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute -top-6 -right-6 w-8 h-8 border-t-2 border-r-2 border-cyan-400"></div>
                  <div className="absolute -bottom-6 -left-6 w-8 h-8 border-b-2 border-l-2 border-cyan-400"></div>
                  <div className="absolute -bottom-6 -right-6 w-8 h-8 border-b-2 border-r-2 border-cyan-400"></div>

                  <div ref={resultRef} className="w-80 h-80 bg-black/90 backdrop-blur-md border-2 border-cyan-400/60 rounded-2xl p-8 shadow-[0_0_80px_rgba(34,211,238,0.6)] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="text-yellow-400 text-xl font-bold mb-3"
                           style={{ textShadow: '0 0 20px rgba(250, 204, 21, 0.8)' }}>
                        Uh oh! Looks like...
                      </div>
                      <motion.div
                        animate={!isCapturing ? {
                          filter: [
                            'drop-shadow(0 0 20px rgba(236, 72, 153, 0.8))',
                            'drop-shadow(0 0 40px rgba(236, 72, 153, 1))',
                            'drop-shadow(0 0 20px rgba(236, 72, 153, 0.8))',
                          ]
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`text-6xl font-black mb-4 ${
                          isCapturing
                            ? 'text-pink-400'
                            : 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-500 to-purple-600'
                        }`}
                        style={isCapturing ? { textShadow: '0 0 30px rgba(236, 72, 153, 0.9)' } : {}}
                      >
                        {result}
                      </motion.div>
                      <div className="text-xl text-white/90 font-semibold mb-4">
                        will <span className="text-cyan-400 font-bold" style={{ textShadow: '0 0 15px rgba(34, 211, 238, 0.8)' }}>{task}</span>
                      </div>
                      <div className="text-fuchsia-400 text-base font-bold italic pt-2 border-t border-fuchsia-500/30"
                           style={{ textShadow: '0 0 20px rgba(217, 70, 239, 0.8)' }}>
                        The wheel has spoken.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: result && !spinning ? 1 : 0, scale: result && !spinning ? 1 : 0.9 }}
              transition={{ delay: 0.5 }}
              onClick={handleCopyImage}
              className="px-6 py-3 font-bold text-base bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-fuchsia-600 hover:to-pink-500 text-white rounded-lg shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300 uppercase tracking-wider z-10"
              style={{ visibility: result && !spinning ? 'visible' : 'hidden', pointerEvents: result && !spinning ? 'auto' : 'none' }}
            >
              Copy Image
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: result && !spinning ? 1 : 0, scale: result && !spinning ? 1 : 0.9 }}
              transition={{ delay: 0.5 }}
              onClick={handleReset}
              className="px-8 py-3 font-bold text-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-purple-600 hover:to-cyan-500 text-white rounded-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 uppercase tracking-wider z-10"
              style={{ visibility: result && !spinning ? 'visible' : 'hidden', pointerEvents: result && !spinning ? 'auto' : 'none' }}
            >
              Spin Again
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelOfChumps;
