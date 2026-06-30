import React from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";
import "./App.css";
const App = () => {
  return (
    <>
      <h1>Raabta</h1>
      <div>
        <header>
          <Show when="signed-out">
            <SignInButton mode="modal" />
            <SignUpButton mode="modal" />
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </header>
      </div>
    </>
  );
};

export default App;
