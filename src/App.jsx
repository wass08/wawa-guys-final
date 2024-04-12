import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Experience } from "./components/Experience";

import { KeyboardControls } from "@react-three/drei";
import { useMemo } from "react";
import { UI } from "./components/UI";
import { AudioManagerProvider } from "./hooks/useAudioManager";
import { GameStateProvider } from "./hooks/useGameState";

export const Controls = {
  forward: "forward",
  back: "back",
  left: "left",
  right: "right",
  jump: "jump",
};

function App() {
  const map = useMemo(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
      { name: Controls.jump, keys: ["Space"] },
    ],
    []
  );
  return (
    <KeyboardControls map={map}>
      <AudioManagerProvider>
        <GameStateProvider>
          <Canvas shadows camera={{ position: [0, 16, 10], fov: 42 }}>
            <color attach="background" args={["#041c0b"]} />
            <Physics>
              <Experience />
            </Physics>
          </Canvas>
          <UI />
        </GameStateProvider>
      </AudioManagerProvider>
    </KeyboardControls>
  );
}

export default App;
