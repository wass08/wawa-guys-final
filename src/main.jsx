import { insertCoin } from "playroomkit";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

insertCoin({
  skipLobby: true,
  gameId: "Nrkxf84kYcXG6I3RY6sJ",
  discord: true,
}).then(() =>
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
);
