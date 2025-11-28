import { Button } from "@/components/ui/button";
import "@/index.css";
import { useState } from "react";

import { mountWidget, useDisplayMode } from "skybridge/web";

type GameState = "start" | "intro" | "main";

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

function MurderWidget() {
  const [gameState, setGameState] = useState<GameState>("start");
  const [highlightedSuspect, setHighlightedSuspect] = useState<string | null>(null);
  const [, setDisplayMode] = useDisplayMode();

  const handleInterrogate = (suspectName: string) => {
    setHighlightedSuspect(suspectName);
    window.openai?.sendFollowUpMessage({ prompt: "User has decided to interrogate " + suspectName });
  };

  // Start screen
  if (gameState === "start") {
    return (
      <div className="rounded-xl flex flex-col items-center justify-center bg-white ">
        <div className="flex items-center justify-center p-12 lg:p-16">
          <Button
            onClick={() => {
              setGameState("intro");
              setDisplayMode("pip");
            }}
            className="px-12 py-6 text-xl font-bold shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            Start
          </Button>
        </div>
      </div>
    );
  }

  // Intro screen
  if (gameState === "intro") {
    return (
      <div className="rounded-3xl bg-linear-to-br from-slate-800 to-slate-900 shadow-2xl">
        <div className="flex flex-col gap-6 p-8 lg:p-12 text-white">
          <h2 className="text-3xl font-bold text-center mb-4">A Murder in the Valley</h2>
          <div className="text-lg leading-relaxed space-y-4">
            <p>
              The Valley is a small, peaceful community located in the mountains, known for its beautiful scenery and
              its passion for AI.
            </p>
            <p>One day, a shocking murder occurred: Claude, a friendly AI bot, has been found dead at his home.</p>
            <p>
              Three suspects have been identified. Your task is to interrogate each one and uncover the truth behind
              this mysterious murder.
            </p>
          </div>
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => setGameState("main")}
              className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
      <div className="flex flex-col gap-6 p-6 lg:p-8">
        <h2 className="text-2xl font-bold text-white text-center mb-4">The Suspects</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {suspects.map((suspect) => (
            <div
              key={suspect.name}
              className={`relative rounded-xl bg-white/10 backdrop-blur-sm border-2 transition-all duration-300 ${
                highlightedSuspect === suspect.name
                  ? "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] scale-105"
                  : "border-white/20"
              }`}
            >
              <div className="flex flex-col gap-4 p-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-1">{suspect.name}</h3>
                  <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{suspect.role}</p>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-slate-200 leading-relaxed">{suspect.description}</p>
                </div>

                <Button
                  onClick={() => handleInterrogate(suspect.name)}
                  variant="secondary"
                  className="w-full font-semibold"
                >
                  Interrogate
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MurderWidget;

mountWidget(<MurderWidget />);
