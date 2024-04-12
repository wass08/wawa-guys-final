import { createContext, useContext, useEffect, useRef, useState } from "react";

const AudioManagerContext = createContext();

export const AudioManagerProvider = ({ children }) => {
  const lastAudioPlayed = useRef(new Date().getTime());
  const playAudio = (file, force = false) => {
    if (!audioEnabled) {
      return;
    }
    if (!force && new Date().getTime() - lastAudioPlayed.current < 100) {
      return;
    }
    lastAudioPlayed.current = new Date().getTime();
    const audio = new Audio(`/audios/${file}.mp3`);
    audio.play();
  };

  const bgAudio = useRef(new Audio("/audios/bg.mp3"));

  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    if (audioEnabled) {
      bgAudio.current.play();
      bgAudio.current.loop = true;
    } else {
      bgAudio.current.pause();
    }
  }, [audioEnabled]);

  return (
    <AudioManagerContext.Provider
      value={{ playAudio, audioEnabled, setAudioEnabled }}
    >
      {children}
    </AudioManagerContext.Provider>
  );
};

export const useAudioManager = () => {
  const audioManager = useContext(AudioManagerContext);
  if (!audioManager) {
    throw new Error(
      "useAudioManager must be used within a AudioManagerProvider"
    );
  }
  return audioManager;
};
