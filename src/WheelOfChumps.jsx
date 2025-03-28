import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const WheelOfChumps = () => {
  const [names, setNames] = useState('');
  const [task, setTask] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');

  const handleSpin = () => {
    const nameList = names.split(',').map(n => n.trim()).filter(Boolean);
    if (nameList.length === 0 || !task) {
      alert('Please provide at least one name and a task.');
      return;
    }

    setMessage('Round and round it goes, where the wheel of chumps stops, nobody knows! 🌌');
    setSpinning(true);
    setResult(null);

    setTimeout(() => {
      const chosen = nameList[Math.floor(Math.random() * nameList.length)];
      setResult(chosen);
      setMessage(`Ohhh noes! It looks like <span class='text-pink-500 font-extrabold'>${chosen}</span> is the chump that has to <span class='text-cyan-400 font-bold'>${task}</span>!`);
      setSpinning(false);
    }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white flex flex-col items-center justify-center p-6 font-mono overflow-hidden">
      <h1 className="text-5xl font-extrabold mb-8 z-10 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-500 to-purple-600 drop-shadow-[0_0_20px_#f472b6] animate-pulse">
        The Wheel of Chumps
      </h1>

      <Card className="w-full max-w-xl bg-white/10 backdrop-blur-md border-fuchsia-500/60 border shadow-xl z-10">
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter names separated by commas"
            value={names}
            onChange={e => setNames(e.target.value)}
            className="text-black"
          />
          <Input
            placeholder="Enter a task (e.g. Wash the dishes)"
            value={task}
            onChange={e => setTask(e.target.value)}
            className="text-black"
          />
          <Button onClick={handleSpin} disabled={spinning} className="w-full font-bold text-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 text-white shadow-lg shadow-pink-500/30">
            ⚡ Spin the Wheel!
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-center items-center h-64 mt-6 z-10">
        {spinning && (
          <motion.div
            animate={{ rotate: 360 * 6 }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            className="w-52 h-52 rounded-full border-[18px] border-cyan-400 shadow-[0_0_50px_rgba(255,0,255,0.6)] animate-spin-slow bg-gradient-to-tr from-cyan-400 via-purple-600 to-pink-500 relative"
          >
            <div className="absolute inset-0 flex items-center justify-center text-2xl text-white font-extrabold animate-pulse">
              🎯
            </div>
          </motion.div>
        )}
      </div>

      {message && (
        <div
          className="text-center mt-10 text-2xl font-bold bg-black/60 p-6 rounded-xl shadow-xl border border-pink-500 max-w-xl z-10"
          dangerouslySetInnerHTML={{ __html: message }}
        />
      )}
    </div>
  );
};

export default WheelOfChumps;

