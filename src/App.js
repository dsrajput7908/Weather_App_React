import React, { useState } from "react";
import CurrentLocation from "./currentLocation";
import "./App.css";

function App() {
  return (
    <React.Fragment>
      <div className="container">
        <CurrentLocation />
      </div>
      <div className="footer-info">
        <a href="https://github.com/dsrajput7908">
          Source Code-@Github
        </a>{" "}
        | Developed by{" "}
        <a target="_blank" href="https://github.com/dsrajput7908">
          Dhiraj Kumar Singh
        </a>
      </div>
    </React.Fragment>
  );
}

export default App;
