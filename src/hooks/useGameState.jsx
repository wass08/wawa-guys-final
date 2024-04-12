import {
  Joystick,
  isHost,
  onPlayerJoin,
  useMultiplayerState,
} from "playroomkit";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { randFloat } from "three/src/math/MathUtils.js";
import {
  HEX_X_SPACING,
  HEX_Z_SPACING,
  NB_COLUMNS,
  NB_ROWS,
} from "../components/GameArena";

const GameStateContext = createContext();

const NEXT_STAGE = {
  lobby: "countdown",
  countdown: "game",
  game: "winner",
  winner: "lobby",
};

const TIMER_STAGE = {
  lobby: -1,
  countdown: 3,
  game: 0,
  winner: 5,
};

export const GameStateProvider = ({ children }) => {
  const [winner, setWinner] = useMultiplayerState("winner", null);
  const [stage, setStage] = useMultiplayerState("gameStage", "lobby");
  const [timer, setTimer] = useMultiplayerState("timer", TIMER_STAGE.lobby);
  const [players, setPlayers] = useState([]);
  const [soloGame, setSoloGame] = useState(false);

  const host = isHost();
  const isInit = useRef(false);
  useEffect(() => {
    if (isInit.current) {
      return;
    }
    isInit.current = true;
    onPlayerJoin((state) => {
      const controls = new Joystick(state, {
        type: "angular",
        buttons: [{ id: "Jump", label: "Jump" }],
      });
      const newPlayer = { state, controls };

      if (host) {
        state.setState("dead", stage === "game");
        state.setState("startingPos", {
          x: randFloat(
            (-(NB_COLUMNS - 1) * HEX_X_SPACING) / 2,
            ((NB_COLUMNS - 1) * HEX_X_SPACING) / 2
          ),
          z: randFloat(
            (-(NB_ROWS - 1) * HEX_Z_SPACING) / 2,
            ((NB_ROWS - 1) * HEX_Z_SPACING) / 2
          ),
        });
      }

      setPlayers((players) => [...players, newPlayer]);
      state.onQuit(() => {
        setPlayers((players) => players.filter((p) => p.state.id !== state.id));
      });
    });
  }, []);

  useEffect(() => {
    if (!host) {
      return;
    }
    if (stage === "lobby") {
      return;
    }
    const timeout = setTimeout(() => {
      let newTime = stage === "game" ? timer + 1 : timer - 1;
      if (newTime === 0) {
        const nextStage = NEXT_STAGE[stage];
        if (nextStage === "lobby" || nextStage === "countdown") {
          // RESET PLAYERS
          players.forEach((p) => {
            p.state.setState("dead", false);
            p.state.setState("pos", null);
            p.state.setState("rot", null);
          });
        }
        setStage(nextStage, true);
        newTime = TIMER_STAGE[nextStage];
      } else {
        // CHECK GAME END
        if (stage === "game") {
          const playersAlive = players.filter((p) => !p.state.getState("dead"));
          if (playersAlive.length < (soloGame ? 1 : 2)) {
            setStage("winner", true);
            setWinner(playersAlive[0]?.state.state.profile, true);
            newTime = TIMER_STAGE.winner;
          }
        }
      }
      setTimer(newTime, true);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [host, timer, stage, soloGame]);

  const startGame = () => {
    setStage("countdown");
    setTimer(TIMER_STAGE.countdown);
    setSoloGame(players.length === 1);
  };

  return (
    <GameStateContext.Provider
      value={{
        stage,
        timer,
        players,
        host,
        startGame,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
};
