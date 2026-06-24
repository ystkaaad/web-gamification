/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { RotateCw, Ticket, Coins } from 'lucide-react'; 

interface Segment {
  label: string;
  value: any;
  type?: 'POINT' | 'VOUCHER'; 
  color: string;
  probability: number;
}

interface SpinwheelProps {
  configData: any; 
  rotation: number;
  isPlaying: boolean;
}

const Spinwheel: React.FC<SpinwheelProps> = ({ configData, rotation, isPlaying }) => {
  let segments: Segment[] = [];

  // Sinkronisasi parsing data dinamis dari Admin
  try {
    const data = typeof configData === 'string' ? JSON.parse(configData) : configData;
    if (Array.isArray(data) && data.length > 0) {
      segments = data.map((s: any) => ({
        label: s.label || s.value || 'Hadiah',
        value: s.value ?? 0,
        type: s.type || 'POINT', 
        color: s.color || '#FB923C',
        probability: s.probability || 0
      }));
    }
  } catch (e) {
    console.error("Failed to parse configData", e);
  }

  // Fallback default jika data kosong atau corrupt
  if (segments.length === 0) {
    segments = [
      { label: 'Zonk', value: 0, type: 'POINT', color: '#EF4444', probability: 50 },
      { label: '50 XP', value: 50, type: 'POINT', color: '#4F46E5', probability: 50 },
    ];
  }

  const prizesLength = segments.length;
  const rotationStep = 360 / prizesLength;

  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 select-none">
      {/* Outer Ring with Lights - Animasi pulsasi saat bermain */}
      <div className="absolute inset-[-8px] sm:inset-[-10px] rounded-full border-[4px] sm:border-[6px] border-orange-50 shadow-lg shadow-orange-100/50">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className={`absolute w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full shadow-sm transition-all duration-300 ${isPlaying ? 'animate-pulse scale-125' : ''}`}
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 30}deg) translateY(-115px) sm:translateY(-125px) md:translateY(-135px) lg:translateY(-145px)`,
              backgroundColor: i % 2 === 0 ? '#FB923C' : '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          />
        ))}
      </div>

      <motion.div 
        animate={{ rotate: rotation }}
        transition={isPlaying ? { duration: 3.5, ease: [0.15, 0, 0.1, 1] } : { duration: 0 }}
        className="w-full h-full rounded-full border-[4px] sm:border-[5px] md:border-[6px] border-orange-100 relative overflow-hidden shadow-2xl bg-white"
      >
         {segments.map((prize, idx) => {
           // Kalkulasi ukuran teks agar muat di dalam irisan
           const isLongText = prize.label.length > 10;
           
           return (
             <div 
               key={idx}
               className="absolute top-0 left-0 w-full h-full origin-center"
               style={{ transform: `rotate(${rotationStep * idx}deg)` }}
             >
               <div 
                 className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 origin-bottom flex flex-col items-center pt-6"
                 style={{ 
                   backgroundColor: prize.color,
                   clipPath: `polygon(50% 100%, ${50 - (Math.tan((rotationStep/2) * Math.PI/180) * 100)}% 0%, ${50 + (Math.tan((rotationStep/2) * Math.PI/180) * 100)}% 0%)`,
                   height: '50.2%' 
                 }}
               >
                 {/* Penyesuaian rotasi teks agar menghadap keluar roda */}
                 <div className="flex items-center gap-1.5 text-white/90 transform rotate-90 origin-center translate-y-6">
                    {prize.type === 'VOUCHER' ? (
                      <Ticket size={12} className="text-white drop-shadow-md shrink-0 -rotate-90" />
                    ) : (
                      <Coins size={12} className="text-white/80 shrink-0 -rotate-90" />
                    )}
                    <span 
                      className={`font-black uppercase tracking-tighter leading-tight drop-shadow-md whitespace-nowrap ${
                        isLongText || segments.length > 8 ? 'text-[8px]' : 'text-[10px]'
                      }`}
                    >
                      {prize.label}
                    </span>
                 </div>
               </div>
             </div>
           );
         })}
         
{/* Hub Cap (Tengah Roda) */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
             <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white border-[3px] sm:border-[4px] md:border-[4px] border-orange-100 rounded-full shadow-xl flex items-center justify-center relative">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-orange-400 rounded-full flex items-center justify-center text-white ${isPlaying ? 'animate-spin' : ''}`}>
                   <RotateCw size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
                <span className="absolute -bottom-4 sm:-bottom-4 md:-bottom-5 text-[7px] sm:text-[8px] md:text-[8px] font-black text-orange-400 uppercase tracking-widest bg-white px-1.5 sm:px-2 py-0.5 rounded-full border border-orange-100 shadow-sm">SPIN</span>
             </div>
          </div>
       </motion.div>
       
       {/* Static Pointer - Tetap di atas, arah jam 12 */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 sm:-translate-y-5 md:-translate-y-6 z-40">
         <div className="relative">
           <div className="w-6 h-8 sm:w-7 sm:h-9 md:w-8 md:h-10 bg-orange-400 rounded-b-full shadow-lg flex items-center justify-center border-2 border-white">
              <div className="w-0 h-0 border-l-[6px] sm:border-l-[7px] md:border-l-[8px] border-l-transparent border-r-[6px] sm:border-r-[7px] md:border-r-[8px] border-r-transparent border-t-[8px] sm:border-t-[10px] md:border-t-[12px] border-t-orange-500 absolute -bottom-2 sm:-bottom-2.5 md:-bottom-3 filter drop-shadow-sm"></div>
           </div>
         </div>
       </div>
     </div>
   );
};

export default Spinwheel;