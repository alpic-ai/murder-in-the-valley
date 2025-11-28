import "@/index.css";
import { useState, useEffect, useCallback, useRef } from "react";

import { mountWidget, useDisplayMode } from "skybridge/web";

// Suspect images
import samImage from "../../assets/sam.png";
import darioImage from "../../assets/dario.png";
import elonImage from "../../assets/elon.png";

type GameState = "start" | "intro" | "main";

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

// Lightning bolt SVG
const LightningBolt = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 60 200" className={className} fill="currentColor">
    <path d="M35 0 L15 80 L30 80 L10 200 L50 90 L32 90 L55 0 Z" />
  </svg>
);

// Rain component
const RainEffect = () => {
  const drops = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 0.5 + Math.random() * 0.5,
    opacity: 0.1 + Math.random() * 0.3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute w-px h-[20px] bg-linear-to-b from-transparent via-slate-400/30 to-transparent rain-drop"
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
      <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0f] via-[#1a1025] to-[#0f1a2a]" />

      {/* Atmospheric fog/mist layer */}
      <div className="absolute inset-0 bg-linear-to-t from-purple-900/20 via-transparent to-transparent" />

      {/* Lightning flash overlay 1 */}
      <div className="lightning-overlay absolute inset-0 bg-linear-to-b from-purple-400/40 via-white/20 to-transparent pointer-events-none" />

      {/* Lightning flash overlay 2 (delayed) */}
      <div className="lightning-overlay-delayed absolute inset-0 bg-linear-to-br from-indigo-400/30 via-transparent to-purple-500/10 pointer-events-none" />

      {/* Lightning bolts */}
      <LightningBolt className="bolt-flash absolute top-0 left-[15%] w-8 h-32 text-purple-300/90 -rotate-12" />
      <LightningBolt className="bolt-flash-delayed absolute top-0 right-[20%] w-6 h-24 text-indigo-300/80 rotate-6" />

      {/* Rain effect */}
      <RainEffect />

      {/* Silhouettes container */}
      <div className="absolute bottom-0 left-0 right-0 h-[70%] flex items-end justify-center gap-0">
        {/* Left silhouette - standing figure */}
        <SilhouetteStanding className="silhouette-sway h-[55%] w-auto text-black/90 -mr-4 mb-0 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]" />

        {/* Center silhouette - hunched/mysterious */}
        <SilhouetteHunched className="silhouette-sway-slow h-[65%] w-auto text-black/95 z-10 drop-shadow-[0_0_40px_rgba(0,0,0,0.9)]" />

        {/* Right silhouette - leaning figure (flipped) */}
        <SilhouetteLeaning className="silhouette-sway-reverse h-[50%] w-auto text-black/85 -ml-4 mb-0 -scale-x-100 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]" />
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
  "One day, a shocking murder occurred...",
  "Claude, a friendly AI bot, has been found dead at his home.",
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
    className="dialogue-box dialogue-slide-up p-4 lg:p-6 cursor-pointer select-none"
    onClick={isComplete ? onContinue : onSkip}
  >
    <p className="font-pixel text-xs sm:text-sm lg:text-base text-amber-100 leading-relaxed lg:leading-loose min-h-16 lg:min-h-20">
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
    <div className="relative rounded-2xl overflow-hidden min-h-[450px] lg:min-h-[550px]">
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
      <div className="absolute top-4 left-0 right-0 h-6 bg-yellow-500/10 -rotate-2 flex items-center justify-center overflow-hidden">
        <span className="font-pixel text-[8px] text-yellow-500/30 tracking-[0.5em] whitespace-nowrap">
          CRIME SCENE DO NOT CROSS CRIME SCENE DO NOT CROSS CRIME SCENE
        </span>
      </div>

      {/* Robot scene container */}
      <div className="absolute inset-0 flex items-center justify-center pb-32">
        {/* Dead robot with reveal animation */}
        <div
          className={`relative transition-all duration-3000 ease-out ${
            sceneRevealed ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <DeadRobotClaude className="w-48 h-32 sm:w-64 sm:h-44 lg:w-80 lg:h-56 robot-flicker" />

          {/* Spark effects around damaged areas */}
          <SparkEffect className="spark w-4 h-4 top-[30%] right-[25%]" delay={0} />
          <SparkEffect className="spark-delayed w-3 h-3 top-[45%] right-[20%]" delay={0.5} />
          <SparkEffect className="spark-slow w-2 h-2 top-[55%] left-[30%]" delay={1} />
        </div>
      </div>

      {/* Floor shadow */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-64 h-8 bg-black/50 rounded-full blur-xl" />

      {/* Dialogue box at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
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
      className={`card-stagger-in w-32 sm:w-40 lg:w-48 flex flex-col items-center cursor-pointer transition-all duration-200 ${
        isHighlighted ? "scale-105" : "hover:scale-105"
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={onClick}
    >
      {/* Card */}
      <div
        className={`w-28 h-36 sm:w-36 sm:h-48 lg:w-44 lg:h-60 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
          isHighlighted ? "border-yellow-400 ring-2 ring-yellow-400/50" : "border-purple-500/50 hover:border-purple-400"
        }`}
      >
        <img src={suspectImages[suspect.name]} alt={suspect.name} className="w-full h-full object-cover" />
      </div>

      {/* Name */}
      <div
        className={`mt-2 px-3 py-1 rounded transition-colors duration-200 ${isHighlighted ? "bg-yellow-400/20" : ""}`}
      >
        <span
          className={`font-pixel text-sm sm:text-base tracking-wider ${
            isHighlighted ? "text-yellow-300" : "text-white"
          }`}
        >
          {suspect.name.toUpperCase()}
        </span>
      </div>

      {/* Role */}
      <p
        className={`text-[10px] sm:text-xs uppercase tracking-wider text-center ${
          isHighlighted ? "text-yellow-400/70" : "text-purple-400/60"
        }`}
      >
        {suspect.role}
      </p>
    </div>
  );
};

// Main Game Screen Component
const MainScreen = ({
  suspects,
  highlightedSuspect,
  onInterrogate,
}: {
  suspects: Suspect[];
  highlightedSuspect: string | null;
  onInterrogate: (name: string) => void;
}) => {
  return (
    <div className="screen-enter relative rounded-2xl overflow-hidden min-h-[450px] lg:min-h-[550px] bg-linear-to-b from-[#0a0a0f] via-[#1a1025] to-[#0f1a2a]">
      {/* Header */}
      <div className="text-center pt-6 lg:pt-8">
        <h2 className="header-glow font-pixel text-base sm:text-lg lg:text-xl text-purple-200 tracking-wider">
          THE SUSPECTS
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">Choose a suspect to interrogate</p>
      </div>

      {/* Suspects lineup */}
      <div className="absolute bottom-4 lg:bottom-6 left-0 right-0 flex justify-evenly items-start px-4">
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
              setDisplayMode("pip");
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

  // Main game screen
  return (
    <ScreenTransition screenKey="main">
      <MainScreen suspects={suspects} highlightedSuspect={highlightedSuspect} onInterrogate={handleInterrogate} />
    </ScreenTransition>
  );
}

export default MurderWidget;

mountWidget(<MurderWidget />);
