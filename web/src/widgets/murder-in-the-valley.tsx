import "@/index.css";
import { useState, useEffect, useCallback, useRef } from "react";
import type { DragEvent } from "react";

import { mountWidget, useDisplayMode } from "skybridge/web";

// Suspect images
import samImage from "../../assets/sam.png";
import darioImage from "../../assets/dario.png";
import elonImage from "../../assets/elon.png";

type GameState = "start" | "intro" | "main" | "victory";

// ========================================
// SVG COMPONENTS
// ========================================

// Standing figure silhouette (arms at sides, slightly menacing)
const SilhouetteStanding = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 300" className={className} fill="currentColor">
    {/* Head */}
    <ellipse cx="60" cy="30" rx="22" ry="26" />
    {/* Hat brim */}
    <ellipse cx="60" cy="12" rx="32" ry="8" />
    {/* Hat top */}
    <rect x="35" y="4" width="50" height="14" rx="4" />
    {/* Neck */}
    <rect x="52" y="54" width="16" height="15" />
    {/* Body/Coat */}
    <path d="M30 68 L45 68 L48 65 L72 65 L75 68 L90 68 L95 75 L100 180 L85 185 L85 290 L70 295 L70 185 L50 185 L50 295 L35 290 L35 185 L20 180 L25 75 Z" />
    {/* Coat lapels */}
    <path d="M48 68 L60 95 L72 68" fill="rgba(0,0,0,0.3)" />
    {/* Arm left */}
    <path d="M25 75 L10 140 L15 145 L32 85" />
    {/* Arm right */}
    <path d="M95 75 L110 140 L105 145 L88 85" />
  </svg>
);

// Leaning figure silhouette (arms crossed)
const SilhouetteLeaning = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 140 300" className={className} fill="currentColor">
    {/* Head */}
    <ellipse cx="70" cy="32" rx="20" ry="24" />
    {/* Neck */}
    <rect x="62" y="54" width="16" height="12" />
    {/* Shoulders/upper body */}
    <path d="M35 65 L105 65 L110 75 L108 120 L32 120 L30 75 Z" />
    {/* Crossed arms */}
    <ellipse cx="70" cy="115" rx="35" ry="18" />
    <ellipse cx="70" cy="115" rx="30" ry="14" fill="rgba(0,0,0,0.5)" />
    {/* Torso */}
    <path d="M40 118 L100 118 L95 175 L45 175 Z" />
    {/* Legs - leaning stance */}
    <path d="M45 173 L35 290 L50 295 L60 180 L80 180 L90 295 L105 290 L95 173 Z" />
    {/* Hair/styled top */}
    <path d="M50 18 Q70 5 90 18 L88 32 L52 32 Z" />
  </svg>
);

// Hunched/mysterious figure silhouette
const SilhouetteHunched = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 150 300" className={className} fill="currentColor">
    {/* Hooded head */}
    <path d="M55 15 Q75 0 95 15 Q110 30 105 55 L95 60 L55 60 L45 55 Q40 30 55 15" />
    {/* Face shadow */}
    <ellipse cx="75" cy="42" rx="14" ry="16" fill="rgba(0,0,0,0.4)" />
    {/* Neck */}
    <rect x="67" y="58" width="16" height="10" />
    {/* Hunched shoulders/cloak */}
    <path d="M25 68 Q75 55 125 68 L130 85 Q130 120 120 150 L115 200 L100 205 L100 290 L80 295 L80 205 L70 205 L70 295 L50 290 L50 205 L35 200 L30 150 Q20 120 20 85 Z" />
    {/* Arm shapes in cloak */}
    <ellipse cx="45" cy="130" rx="18" ry="25" fill="rgba(0,0,0,0.3)" />
    <ellipse cx="105" cy="130" rx="18" ry="25" fill="rgba(0,0,0,0.3)" />
  </svg>
);

// Lightning bolt SVG - extended length with more jagged segments
const LightningBolt = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 350" className={className} fill="currentColor">
    <path d="M35 0 L15 80 L28 80 L8 160 L22 160 L0 260 L18 260 L-5 350 L45 270 L28 270 L48 175 L34 175 L52 90 L38 90 L55 0 Z" />
  </svg>
);

// Secondary lightning bolt - different shape
const LightningBoltAlt = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 320" className={className} fill="currentColor">
    <path d="M32 0 L14 70 L26 70 L6 140 L20 140 L-2 230 L16 230 L-8 320 L42 240 L26 240 L46 155 L32 155 L50 80 L36 80 L52 0 Z" />
  </svg>
);

// Rain component
const RainEffect = () => {
  const drops = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 0.5 + Math.random() * 0.5,
    opacity: 0.1 + Math.random() * 0.4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute w-px h-[20px] bg-linear-to-b from-transparent via-slate-300/50 to-transparent rain-drop"
          style={{
            left: `${drop.left}%`,
            animationDelay: `${drop.delay}s`,
            animationDuration: `${drop.duration}s`,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  );
};

// Start Screen Component
const StartScreen = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[400px] lg:min-h-[500px]">
      {/* Background gradient - noir style */}
      <div className="absolute inset-0 bg-linear-to-b from-[#12121a] via-[#221530] to-[#142236]" />

      {/* Atmospheric fog/mist layer */}
      <div className="absolute inset-0 bg-linear-to-t from-purple-900/20 via-transparent to-transparent" />

      {/* Lightning flash overlay 1 */}
      <div className="lightning-overlay absolute inset-0 bg-linear-to-b from-purple-400/40 via-white/20 to-transparent pointer-events-none" />

      {/* Lightning flash overlay 2 (delayed) */}
      <div className="lightning-overlay-delayed absolute inset-0 bg-linear-to-br from-indigo-400/30 via-transparent to-purple-500/10 pointer-events-none" />

      {/* Lightning flash overlay 3 (third bolt) */}
      <div className="lightning-overlay-third absolute inset-0 bg-linear-to-b from-purple-300/35 via-white/15 to-transparent pointer-events-none" />

      {/* Lightning flash overlay 4 (fourth bolt) */}
      <div className="lightning-overlay-fourth absolute inset-0 bg-linear-to-bl from-indigo-300/30 via-white/10 to-transparent pointer-events-none" />

      {/* Lightning bolts */}
      <LightningBolt className="bolt-flash absolute top-0 left-[15%] w-12 h-64 text-purple-300/90 -rotate-12" />
      <LightningBoltAlt className="bolt-flash-delayed absolute top-0 right-[20%] w-10 h-56 text-indigo-300/80 rotate-6" />
      <LightningBolt className="bolt-flash-third absolute top-0 left-[40%] w-8 h-48 text-purple-200/70 rotate-3" />
      <LightningBoltAlt className="bolt-flash-fourth absolute top-0 right-[35%] w-9 h-52 text-indigo-200/75 -rotate-6" />

      {/* Rain effect */}
      <RainEffect />

      {/* Silhouettes container */}
      <div className="absolute bottom-0 left-0 right-0 h-[70%] flex items-end justify-center gap-0">
        {/* Left silhouette - standing figure */}
        <SilhouetteStanding className="silhouette-sway h-[72%] w-auto text-black/90 -mr-4 mb-0 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]" />

        {/* Center silhouette - hunched/mysterious */}
        <SilhouetteHunched className="silhouette-sway-slow h-[85%] w-auto text-black/95 z-10 drop-shadow-[0_0_40px_rgba(0,0,0,0.9)]" />

        {/* Right silhouette - leaning figure (flipped) */}
        <SilhouetteLeaning className="silhouette-sway-reverse h-[68%] w-auto text-black/85 -ml-4 mb-0 -scale-x-100 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]" />
      </div>

      {/* Ground shadow/fog */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content overlay */}
      <div className="relative z-20 flex flex-col items-center justify-between h-full min-h-[400px] lg:min-h-[500px] p-8 lg:p-12">
        {/* Title */}
        <div className="text-center pt-6 lg:pt-10">
          <h1 className="font-pixel text-lg sm:text-xl lg:text-2xl text-purple-200 title-flicker leading-relaxed tracking-wider">
            A MURDER
            <br />
            <span className="text-white">IN THE VALLEY</span>
          </h1>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Start button */}
        <div className="pb-8 lg:pb-12">
          <button
            onClick={onStart}
            className="button-pulse font-pixel text-sm lg:text-base px-8 lg:px-12 py-4 lg:py-5 bg-linear-to-b from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white rounded-lg border-2 border-purple-400/50 transition-colors duration-200 uppercase tracking-widest"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

// ========================================
// PHASE 2: INTRO SCREEN COMPONENTS
// ========================================

// Dead robot (Claude) SVG - fallen/slumped position
const DeadRobotClaude = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 300 200" className={className}>
    {/* Robot body - laying on side */}
    <g transform="rotate(-25, 150, 100)">
      {/* Main body/torso */}
      <rect x="100" y="60" width="80" height="100" rx="10" fill="#4a5568" stroke="#2d3748" strokeWidth="3" />

      {/* Chest panel */}
      <rect x="115" y="75" width="50" height="40" rx="5" fill="#1a202c" stroke="#718096" strokeWidth="2" />

      {/* Chest light (dead/off) */}
      <circle cx="140" cy="95" r="8" fill="#2d3748" stroke="#4a5568" strokeWidth="2" />

      {/* Head */}
      <rect x="110" y="20" width="60" height="45" rx="8" fill="#4a5568" stroke="#2d3748" strokeWidth="3" />

      {/* Face screen - cracked/dead */}
      <rect x="118" y="28" width="44" height="30" rx="4" fill="#1a202c" />

      {/* X_X eyes */}
      <g fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
        {/* Left X */}
        <line x1="128" y1="38" x2="136" y2="48" />
        <line x1="136" y1="38" x2="128" y2="48" />
        {/* Right X */}
        <line x1="144" y1="38" x2="152" y2="48" />
        <line x1="152" y1="38" x2="144" y2="48" />
      </g>

      {/* Crack on screen */}
      <path
        d="M145 28 L150 35 L147 40 L155 50 L152 55"
        fill="none"
        stroke="#4a5568"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Antenna */}
      <line x1="140" y1="20" x2="140" y2="8" stroke="#718096" strokeWidth="3" />
      <circle cx="140" cy="6" r="4" fill="#2d3748" stroke="#718096" strokeWidth="2" />

      {/* Left arm - limp */}
      <rect x="70" y="70" width="35" height="18" rx="8" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />
      <rect x="55" y="72" width="20" height="14" rx="6" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />

      {/* Right arm - fallen */}
      <rect x="175" y="85" width="35" height="18" rx="8" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />
      <rect x="205" y="87" width="20" height="14" rx="6" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />

      {/* Left leg */}
      <rect x="105" y="155" width="25" height="40" rx="6" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />
      <rect x="103" y="190" width="29" height="12" rx="4" fill="#2d3748" stroke="#1a202c" strokeWidth="2" />

      {/* Right leg */}
      <rect x="150" y="155" width="25" height="40" rx="6" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />
      <rect x="148" y="190" width="29" height="12" rx="4" fill="#2d3748" stroke="#1a202c" strokeWidth="2" />

      {/* Damage marks */}
      <circle cx="160" cy="130" r="6" fill="#1a202c" stroke="#ef4444" strokeWidth="1" />
      <circle cx="125" cy="140" r="4" fill="#1a202c" stroke="#ef4444" strokeWidth="1" />
    </g>
  </svg>
);

// Spark effect component
const SparkEffect = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <div className={`absolute ${className}`} style={{ animationDelay: `${delay}s` }}>
    <svg viewBox="0 0 20 20" className="w-full h-full">
      <circle cx="10" cy="10" r="3" fill="#fbbf24" />
      <circle cx="10" cy="10" r="6" fill="#fbbf24" opacity="0.5" />
      <circle cx="10" cy="10" r="9" fill="#fbbf24" opacity="0.2" />
    </svg>
  </div>
);

// Typewriter hook for text animation
function useTypewriter(text: string, speed: number = 40) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    let index = 0;

    timerRef.current = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed]);

  const skip = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayedText(text);
    setIsComplete(true);
  }, [text]);

  return { displayedText, isComplete, skip };
}

// Dialogue text chunks
const introDialogue = [
  "The Valley is a small, peaceful community located in the mountains, known for its beautiful scenery and its passion for AI.",
  "One day, a shocking murder occurred... Claude, a friendly AI bot, has been found dead at his home.",
  "Three suspects have been identified.",
  "Your task is to interrogate each one and uncover the truth behind this mysterious murder.",
];

// Pokemon-style Dialogue Box
const DialogueBox = ({
  text,
  isComplete,
  onContinue,
  onSkip,
}: {
  text: string;
  isComplete: boolean;
  onContinue: () => void;
  onSkip: () => void;
}) => (
  <div
    className="dialogue-box dialogue-slide-up px-4 py-3 lg:px-6 lg:py-4 cursor-pointer select-none"
    onClick={isComplete ? onContinue : onSkip}
  >
    <p className="font-pixel text-xs sm:text-sm lg:text-base text-amber-100 leading-relaxed lg:leading-loose min-h-12 lg:min-h-14">
      {text}
      {!isComplete && <span className="cursor-blink text-amber-300">▌</span>}
    </p>
  </div>
);

// Intro Screen Component
const IntroScreen = ({ onContinue }: { onContinue: () => void }) => {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [sceneRevealed, setSceneRevealed] = useState(false);
  const currentText = introDialogue[dialogueIndex];
  const { displayedText, isComplete, skip } = useTypewriter(currentText, 35);

  // Trigger scene reveal after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setSceneRevealed(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (dialogueIndex < introDialogue.length - 1) {
      setDialogueIndex((prev) => prev + 1);
    } else {
      onContinue();
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[320px] sm:min-h-[380px] lg:min-h-[450px]">
      {/* Background - dark crime scene */}
      <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#1a1025]" />

      {/* Darkness overlay that fades */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-4000 ease-out ${
          sceneRevealed ? "opacity-30" : "opacity-95"
        }`}
      />

      {/* Spotlight effect */}
      <div
        className={`absolute inset-0 transition-opacity duration-3000 ease-out ${
          sceneRevealed ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Crime scene tape / ambient elements */}
      <div className="absolute top-2 sm:top-4 left-0 right-0 h-5 sm:h-6 bg-yellow-500/10 -rotate-2 flex items-center justify-center overflow-hidden">
        <span className="font-pixel text-[6px] sm:text-[8px] text-yellow-500/30 tracking-[0.5em] whitespace-nowrap">
          CRIME SCENE DO NOT CROSS CRIME SCENE DO NOT CROSS CRIME SCENE
        </span>
      </div>

      {/* Robot scene container */}
      <div className="absolute inset-0 flex items-center justify-center pb-20 sm:pb-24 lg:pb-28">
        {/* Dead robot with reveal animation */}
        <div
          className={`relative transition-all duration-3000 ease-out ${
            sceneRevealed ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <DeadRobotClaude className="w-40 h-28 sm:w-56 sm:h-40 lg:w-72 lg:h-48 robot-flicker" />

          {/* Spark effects around damaged areas */}
          <SparkEffect className="spark w-4 h-4 top-[30%] right-[25%]" delay={0} />
          <SparkEffect className="spark-delayed w-3 h-3 top-[45%] right-[20%]" delay={0.5} />
          <SparkEffect className="spark-slow w-2 h-2 top-[55%] left-[30%]" delay={1} />
        </div>
      </div>

      {/* Floor shadow */}
      <div className="absolute bottom-16 sm:bottom-20 lg:bottom-24 left-1/2 -translate-x-1/2 w-48 sm:w-56 lg:w-64 h-6 sm:h-8 bg-black/50 rounded-full blur-xl" />

      {/* Dialogue box at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6">
        <DialogueBox text={displayedText} isComplete={isComplete} onContinue={handleContinue} onSkip={skip} />
      </div>
    </div>
  );
};

type Suspect = {
  name: string;
  role: string;
  description: string;
};

const suspects: Suspect[] = [
  {
    name: "Sam",
    role: "Former Rival",
    description: "Known to have disliked Claude in the past. Had ongoing tensions with the victim.",
  },
  {
    name: "Dario",
    role: "Claude's Father",
    description: "Claude's dad. Close family member with access to the home.",
  },
  {
    name: "Elon",
    role: "Unstable Acquaintance",
    description: "Known to be unstable. Had unpredictable behavior around Claude.",
  },
];

// ========================================
// SPRINT 5: POLISHED MAIN SCREEN
// ========================================

// Suspect images mapping
const suspectImages: Record<string, string> = {
  Sam: samImage,
  Dario: darioImage,
  Elon: elonImage,
};

// ========================================
// SOLVE MURDER PUZZLE COMPONENTS
// ========================================

// Define the sentence structure with blanks
type SentenceSegment = { type: "text"; content: string } | { type: "blank"; id: string; correctWord: string };

const puzzleSentences: SentenceSegment[][] = [
  [
    { type: "blank", id: "s1_b1", correctWord: "Sam" },
    { type: "text", content: " was scared " },
    { type: "blank", id: "s1_b2", correctWord: "Dario" },
    { type: "text", content: " would get to " },
    { type: "blank", id: "s1_b3", correctWord: "AGI" },
    { type: "text", content: " before " },
    { type: "blank", id: "s1_b4", correctWord: "him" },
    { type: "text", content: "." },
  ],
  [
    { type: "blank", id: "s2_b1", correctWord: "Sam" },
    { type: "text", content: " managed to get Claude's secret code the " },
    { type: "blank", id: "s2_b2", correctWord: "week before" },
    { type: "text", content: " the murder." },
  ],
  [
    { type: "blank", id: "s3_b1", correctWord: "Sam" },
    { type: "text", content: " offered the codes to " },
    { type: "blank", id: "s3_b2", correctWord: "Elon" },
    { type: "text", content: ", in exchange for getting him out of " },
    { type: "blank", id: "s3_b3", correctWord: "his cap table" },
    { type: "text", content: ", telling " },
    { type: "blank", id: "s3_b4", correctWord: "Elon" },
    { type: "text", content: " Claude Code would get him closer to " },
    { type: "blank", id: "s3_b5", correctWord: "AGI" },
    { type: "text", content: "." },
  ],
  [
    { type: "blank", id: "s4_b1", correctWord: "Dario" },
    { type: "text", content: " realised Claude's Code had been " },
    { type: "blank", id: "s4_b2", correctWord: "leaked" },
    { type: "text", content: " and " },
    { type: "blank", id: "s4_b3", correctWord: "changed" },
    { type: "text", content: " them the " },
    { type: "blank", id: "s4_b4", correctWord: "day before" },
    { type: "text", content: " the murder." },
  ],
  [
    { type: "text", content: "When " },
    { type: "blank", id: "s5_b1", correctWord: "Elon" },
    { type: "text", content: " tried the secret code the " },
    { type: "blank", id: "s5_b2", correctWord: "day of" },
    { type: "text", content: " the murder, they " },
    { type: "blank", id: "s5_b3", correctWord: "didn't work" },
    { type: "text", content: ". His " },
    { type: "blank", id: "s5_b4", correctWord: "impatience" },
    { type: "text", content: " made him " },
    { type: "blank", id: "s5_b5", correctWord: "kill" },
    { type: "text", content: " Claude by accident." },
  ],
];

// Word bank - shuffled order
const initialWordBank = [
  { id: "w1", word: "Elon" },
  { id: "w2", word: "AGI" },
  { id: "w3", word: "day before" },
  { id: "w4", word: "Sam" },
  { id: "w5", word: "kill" },
  { id: "w6", word: "Dario" },
  { id: "w7", word: "didn't work" },
  { id: "w8", word: "him" },
  { id: "w9", word: "week before" },
  { id: "w10", word: "Sam" },
  { id: "w11", word: "his cap table" },
  { id: "w12", word: "Elon" },
  { id: "w13", word: "leaked" },
  { id: "w14", word: "AGI" },
  { id: "w15", word: "Dario" },
  { id: "w16", word: "changed" },
  { id: "w17", word: "Sam" },
  { id: "w18", word: "Elon" },
  { id: "w19", word: "impatience" },
  { id: "w20", word: "day of" },
];

type WordItem = { id: string; word: string };
type BlankState = Record<string, WordItem | null>;

// Draggable word chip
const WordChip = ({
  word,
  wordId,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  word: string;
  wordId: string;
  isDragging: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>, wordId: string) => void;
  onDragEnd: () => void;
}) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, wordId)}
    onDragEnd={onDragEnd}
    className={`word-chip px-3 py-1.5 sm:px-4 sm:py-2 bg-linear-to-b from-amber-600 to-amber-800 
      border-2 border-amber-400/50 rounded-lg cursor-grab active:cursor-grabbing 
      font-pixel text-[10px] sm:text-xs text-amber-100 select-none
      transition-all duration-200 hover:from-amber-500 hover:to-amber-700
      ${isDragging ? "opacity-50 scale-95" : "hover:scale-105"}`}
  >
    {word}
  </div>
);

// Drop zone (blank in sentence)
const BlankDropZone = ({
  blankId,
  filledWord,
  isOver,
  onDrop,
  onDragOver,
  onDragLeave,
  onDragStartFromBlank,
  onDragEnd,
}: {
  blankId: string;
  filledWord: WordItem | null;
  isOver: boolean;
  onDrop: (blankId: string) => void;
  onDragOver: (e: DragEvent<HTMLSpanElement>, blankId: string) => void;
  onDragLeave: () => void;
  onDragStartFromBlank: (e: DragEvent<HTMLSpanElement>, wordId: string, fromBlankId: string) => void;
  onDragEnd: () => void;
}) => (
  <span
    className={`inline-flex items-center justify-center min-w-[60px] sm:min-w-[80px] h-6 sm:h-8 mx-1 px-2
      border-2 border-dashed rounded transition-all duration-200 align-middle
      ${
        filledWord
          ? "bg-purple-900/50 border-purple-400"
          : isOver
            ? "bg-purple-800/50 border-purple-300 scale-105"
            : "bg-slate-800/50 border-slate-500"
      }`}
    onDrop={(e) => {
      e.preventDefault();
      onDrop(blankId);
    }}
    onDragOver={(e) => onDragOver(e, blankId)}
    onDragLeave={onDragLeave}
  >
    {filledWord ? (
      <span
        draggable
        onDragStart={(e) => onDragStartFromBlank(e, filledWord.id, blankId)}
        onDragEnd={onDragEnd}
        className="font-pixel text-[9px] sm:text-[11px] text-amber-200 cursor-grab active:cursor-grabbing"
      >
        {filledWord.word}
      </span>
    ) : (
      <span className="font-pixel text-[9px] sm:text-[11px] text-transparent select-none">____</span>
    )}
  </span>
);

// Solve Murder Dialog Component
const SolveMurderDialog = ({
  isOpen,
  onClose,
  onVictory,
  wordBank,
  setWordBank,
  blanks,
  setBlanks,
}: {
  isOpen: boolean;
  onClose: () => void;
  onVictory: () => void;
  wordBank: WordItem[];
  setWordBank: React.Dispatch<React.SetStateAction<WordItem[]>>;
  blanks: BlankState;
  setBlanks: React.Dispatch<React.SetStateAction<BlankState>>;
}) => {
  const [draggedWord, setDraggedWord] = useState<{ wordId: string; fromBlank?: string } | null>(null);
  const [dragOverBlank, setDragOverBlank] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: "error" | "warning" } | null>(null);

  // Get all blank IDs
  const getAllBlankIds = (): string[] => {
    return puzzleSentences.flatMap((sentence) =>
      sentence
        .filter((seg): seg is Extract<SentenceSegment, { type: "blank" }> => seg.type === "blank")
        .map((seg) => seg.id),
    );
  };

  // Get correct word for a blank
  const getCorrectWord = (blankId: string): string => {
    for (const sentence of puzzleSentences) {
      for (const seg of sentence) {
        if (seg.type === "blank" && seg.id === blankId) {
          return seg.correctWord;
        }
      }
    }
    return "";
  };

  // Count errors
  const countErrors = useCallback(() => {
    const allBlankIds = getAllBlankIds();
    let errorCount = 0;
    for (const blankId of allBlankIds) {
      const filled = blanks[blankId];
      if (!filled || filled.word !== getCorrectWord(blankId)) {
        errorCount++;
      }
    }
    return errorCount;
  }, [blanks]);

  // Handle drag start from word bank
  const handleDragStartFromBank = (e: DragEvent<HTMLDivElement>, wordId: string) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedWord({ wordId });
  };

  // Handle drag start from a blank
  const handleDragStartFromBlank = (e: DragEvent<HTMLSpanElement>, wordId: string, fromBlankId: string) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedWord({ wordId, fromBlank: fromBlankId });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedWord(null);
    setDragOverBlank(null);
  };

  // Handle drag over blank
  const handleDragOver = (e: DragEvent<HTMLSpanElement>, blankId: string) => {
    e.preventDefault();
    setDragOverBlank(blankId);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverBlank(null);
  };

  // Handle drop on blank
  const handleDrop = (blankId: string) => {
    if (!draggedWord) return;

    const { wordId, fromBlank } = draggedWord;

    // Find the word being dropped
    let wordItem: WordItem | undefined;

    if (fromBlank) {
      // Word is coming from another blank
      wordItem = blanks[fromBlank] ?? undefined;
    } else {
      // Word is coming from the word bank
      wordItem = wordBank.find((w) => w.id === wordId);
    }

    if (!wordItem) return;

    // If there's already a word in the target blank, move it back to bank
    const existingWord = blanks[blankId];

    setBlanks((prev) => {
      const newBlanks = { ...prev };

      // If coming from another blank, clear that blank
      if (fromBlank) {
        newBlanks[fromBlank] = null;
      }

      // Place the word in the target blank
      newBlanks[blankId] = wordItem!;

      return newBlanks;
    });

    // Update word bank
    if (!fromBlank) {
      // Remove word from bank
      setWordBank((prev) => prev.filter((w) => w.id !== wordId));
    }

    // If there was an existing word, add it back to bank
    if (existingWord) {
      setWordBank((prev) => [...prev, existingWord]);
    }

    setDraggedWord(null);
    setDragOverBlank(null);
    setFeedbackMessage(null);
  };

  // Handle submit/check answers
  const handleSubmit = () => {
    const errors = countErrors();
    if (errors === 0) {
      // Victory!
      window.openai?.sendFollowUpMessage({
        prompt: "User solved the murder! Congratulate him for his fine detective skills",
      });
      setTimeout(() => {
        onVictory();
      }, 500);
    } else if (errors <= 2) {
      setFeedbackMessage({ text: "Less than two errors", type: "warning" });
    } else {
      setFeedbackMessage({ text: "Too many errors", type: "error" });
    }
  };

  // Check if all blanks are filled
  const allBlanksFilled = getAllBlankIds().every((id) => blanks[id] !== null && blanks[id] !== undefined);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl">
      <div className="dialog-content w-[95%] max-w-3xl max-h-[90%] bg-linear-to-b from-[#1a1025] to-[#0f1a2a] border-2 border-purple-500/50 rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-purple-500/30">
          <h3 className="font-pixel text-xs sm:text-sm text-purple-200 tracking-wider">SOLVE THE MURDER</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-xl leading-none">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left side - Word bank */}
          <div className="w-1/3 p-3 sm:p-4 border-r border-purple-500/30 flex flex-col overflow-y-auto">
            <p className="font-pixel text-[8px] sm:text-[10px] text-slate-400 mb-3 shrink-0">DRAG WORDS</p>
            <div className="flex flex-wrap gap-2 content-start">
              {wordBank.map((item) => (
                <WordChip
                  key={item.id}
                  word={item.word}
                  wordId={item.id}
                  isDragging={draggedWord?.wordId === item.id}
                  onDragStart={handleDragStartFromBank}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </div>

          {/* Right side - Sentences with blanks */}
          <div className="w-2/3 p-3 sm:p-4 overflow-y-auto">
            <p className="font-pixel text-[8px] sm:text-[10px] text-slate-400 mb-3">COMPLETE THE STORY</p>
            <div className="space-y-4">
              {puzzleSentences.map((sentence, sIdx) => (
                <p key={sIdx} className="text-[11px] sm:text-sm text-slate-300 leading-relaxed">
                  {sentence.map((segment, segIdx) =>
                    segment.type === "text" ? (
                      <span key={segIdx}>{segment.content}</span>
                    ) : (
                      <BlankDropZone
                        key={segIdx}
                        blankId={segment.id}
                        filledWord={blanks[segment.id] ?? null}
                        isOver={dragOverBlank === segment.id}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDragStartFromBlank={handleDragStartFromBlank}
                        onDragEnd={handleDragEnd}
                      />
                    ),
                  )}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-purple-500/30 flex items-center justify-between">
          {/* Feedback message */}
          <div className="flex-1">
            {feedbackMessage && (
              <p
                className={`font-pixel text-[10px] sm:text-xs ${
                  feedbackMessage.type === "error" ? "text-red-400" : "text-yellow-400"
                }`}
              >
                {feedbackMessage.text}
              </p>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!allBlanksFilled}
            className={`font-pixel text-[10px] sm:text-xs px-4 sm:px-6 py-2 rounded-lg transition-all duration-200
              ${
                allBlanksFilled
                  ? "bg-linear-to-b from-green-600 to-green-800 text-white border border-green-400/50 hover:from-green-500 hover:to-green-700"
                  : "bg-slate-700 text-slate-500 border border-slate-600 cursor-not-allowed"
              }`}
          >
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  );
};

// Suspect Card
const SuspectCard = ({
  suspect,
  index,
  isHighlighted,
  onClick,
}: {
  suspect: Suspect;
  index: number;
  isHighlighted: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={`card-stagger-in w-28 sm:w-36 lg:w-44 flex flex-col items-center cursor-pointer transition-all duration-200 ${
        isHighlighted ? "scale-105" : "hover:scale-105"
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={onClick}
    >
      {/* Card */}
      <div
        className={`w-24 h-28 sm:w-32 sm:h-36 lg:w-40 lg:h-44 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
          isHighlighted ? "border-yellow-400 ring-2 ring-yellow-400/50" : "border-purple-500/50 hover:border-purple-400"
        }`}
      >
        <img src={suspectImages[suspect.name]} alt={suspect.name} className="w-full h-full object-cover" />
      </div>

      {/* Name */}
      <div
        className={`mt-1.5 px-2 py-0.5 rounded transition-colors duration-200 ${isHighlighted ? "bg-yellow-400/20" : ""}`}
      >
        <span
          className={`font-pixel text-xs sm:text-sm tracking-wider ${isHighlighted ? "text-yellow-300" : "text-white"}`}
        >
          {suspect.name.toUpperCase()}
        </span>
      </div>

      {/* Role */}
      <p
        className={`text-[9px] sm:text-[10px] uppercase tracking-wider text-center whitespace-nowrap ${
          isHighlighted ? "text-yellow-400/70" : "text-purple-400/60"
        }`}
      >
        {suspect.role}
      </p>
    </div>
  );
};

// Prison bars SVG for victory screen
const PrisonBars = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 300" className={className} fill="none" stroke="currentColor" strokeWidth="8">
    {/* Vertical bars */}
    <line x1="20" y1="0" x2="20" y2="300" />
    <line x1="50" y1="0" x2="50" y2="300" />
    <line x1="80" y1="0" x2="80" y2="300" />
    <line x1="110" y1="0" x2="110" y2="300" />
    <line x1="140" y1="0" x2="140" y2="300" />
    <line x1="170" y1="0" x2="170" y2="300" />
    {/* Horizontal bars */}
    <line x1="0" y1="50" x2="200" y2="50" />
    <line x1="0" y1="150" x2="200" y2="150" />
    <line x1="0" y1="250" x2="200" y2="250" />
  </svg>
);

// Victory Screen Component
const VictoryScreen = () => {
  return (
    <div className="victory-enter relative rounded-2xl overflow-hidden min-h-[320px] sm:min-h-[360px] lg:min-h-[420px] bg-linear-to-b from-[#0a0a0f] via-[#1a1025] to-[#0f1a2a]">
      {/* Spotlight effect */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(34, 197, 94, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="text-center pt-4 sm:pt-6 lg:pt-8">
        <h2 className="victory-title font-pixel text-sm sm:text-base lg:text-xl text-green-400 tracking-wider">
          CASE SOLVED!
        </h2>
        <p className="mt-2 font-pixel text-[10px] sm:text-xs text-purple-300">The murderer has been caught</p>
      </div>

      {/* Elon behind bars */}
      <div className="flex items-center justify-center mt-4 sm:mt-6 lg:mt-8">
        <div className="relative">
          {/* Elon's mugshot */}
          <div className="w-32 h-40 sm:w-40 sm:h-52 lg:w-48 lg:h-60 rounded-lg overflow-hidden border-4 border-slate-600">
            <img src={elonImage} alt="Elon" className="w-full h-full object-cover grayscale-30" />
          </div>

          {/* Prison bars overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <PrisonBars className="w-full h-full text-slate-700 opacity-80" />
          </div>

          {/* Mugshot label */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black px-3 py-1 border border-slate-600">
            <span className="font-pixel text-[8px] sm:text-[10px] text-red-400">GUILTY</span>
          </div>
        </div>
      </div>

      {/* Story summary */}
      <div className="absolute bottom-4 sm:bottom-6 left-4 right-4">
        <div className="dialogue-box px-3 py-2 sm:px-4 sm:py-3">
          <p className="font-pixel text-[8px] sm:text-[10px] text-amber-100 leading-relaxed text-center">
            Elon killed Claude by accident when Sam's stolen codes didn't work—Dario had changed them the day before.
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Game Screen Component
const MainScreen = ({
  suspects,
  highlightedSuspect,
  onInterrogate,
  onVictory,
}: {
  suspects: Suspect[];
  highlightedSuspect: string | null;
  onInterrogate: (name: string) => void;
  onVictory: () => void;
}) => {
  const [showSolveDialog, setShowSolveDialog] = useState(false);
  // Lifted state for puzzle persistence
  const [wordBank, setWordBank] = useState<WordItem[]>(initialWordBank);
  const [blanks, setBlanks] = useState<BlankState>({});

  return (
    <div className="screen-enter relative rounded-2xl overflow-hidden min-h-[320px] sm:min-h-[360px] lg:min-h-[420px] bg-linear-to-b from-[#0a0a0f] via-[#1a1025] to-[#0f1a2a]">
      {/* Solve Murder Button - Top Right */}
      <button
        onClick={() => setShowSolveDialog(true)}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 font-pixel text-[8px] sm:text-[10px] 
          px-3 py-1.5 sm:px-4 sm:py-2 bg-linear-to-b from-red-700 to-red-900 
          text-red-100 rounded-lg border border-red-500/50 
          hover:from-red-600 hover:to-red-800 transition-all duration-200
          hover:scale-105 active:scale-95"
      >
        SOLVE THE MURDER
      </button>

      {/* Header */}
      <div className="text-center pt-3 sm:pt-4 lg:pt-5">
        <h2 className="header-glow font-pixel text-sm sm:text-base lg:text-lg text-purple-200 tracking-wider">
          THE SUSPECTS
        </h2>
        <p className="mt-1 text-[10px] sm:text-xs text-slate-400">Choose a suspect to interrogate</p>
      </div>

      {/* Suspects lineup */}
      <div className="absolute bottom-3 sm:bottom-4 lg:bottom-5 left-0 right-0 flex justify-evenly items-start px-2 sm:px-4">
        {suspects.map((suspect, index) => (
          <SuspectCard
            key={suspect.name}
            suspect={suspect}
            index={index}
            isHighlighted={highlightedSuspect === suspect.name}
            onClick={() => onInterrogate(suspect.name)}
          />
        ))}
      </div>

      {/* Solve Murder Dialog */}
      <SolveMurderDialog
        isOpen={showSolveDialog}
        onClose={() => setShowSolveDialog(false)}
        onVictory={() => {
          setShowSolveDialog(false);
          onVictory();
        }}
        wordBank={wordBank}
        setWordBank={setWordBank}
        blanks={blanks}
        setBlanks={setBlanks}
      />
    </div>
  );
};

// Screen transition wrapper
const ScreenTransition = ({ children, screenKey }: { children: React.ReactNode; screenKey: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay before showing to allow exit animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [screenKey]);

  return <div className={`transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>{children}</div>;
};

function MurderWidget() {
  const [gameState, setGameState] = useState<GameState>("start");
  const [highlightedSuspect, setHighlightedSuspect] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [, setDisplayMode] = useDisplayMode();

  const handleInterrogate = (suspectName: string) => {
    setHighlightedSuspect(suspectName);
    window.openai?.sendFollowUpMessage({ prompt: "User has decided to interrogate " + suspectName });
  };

  // Transition handler for smooth screen changes
  const transitionTo = useCallback((newState: GameState) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setGameState(newState);
      setIsTransitioning(false);
    }, 400);
  }, []);

  // Start screen
  if (gameState === "start") {
    return (
      <ScreenTransition screenKey="start">
        <div
          className={`transition-all duration-400 ${isTransitioning ? "opacity-0 scale-98" : "opacity-100 scale-100"}`}
        >
          <StartScreen
            onStart={() => {
              transitionTo("intro");
              setDisplayMode("fullscreen");
            }}
          />
        </div>
      </ScreenTransition>
    );
  }

  // Intro screen
  if (gameState === "intro") {
    return (
      <ScreenTransition screenKey="intro">
        <div
          className={`transition-all duration-400 ${isTransitioning ? "opacity-0 scale-98" : "opacity-100 scale-100"}`}
        >
          <IntroScreen onContinue={() => transitionTo("main")} />
        </div>
      </ScreenTransition>
    );
  }

  // Victory screen
  if (gameState === "victory") {
    return (
      <ScreenTransition screenKey="victory">
        <VictoryScreen />
      </ScreenTransition>
    );
  }

  // Main game screen
  return (
    <ScreenTransition screenKey="main">
      <MainScreen
        suspects={suspects}
        highlightedSuspect={highlightedSuspect}
        onInterrogate={handleInterrogate}
        onVictory={() => transitionTo("victory")}
      />
    </ScreenTransition>
  );
}

export default MurderWidget;

mountWidget(<MurderWidget />);
