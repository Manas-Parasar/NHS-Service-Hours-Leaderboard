import React from "react";
import Navbar from "./components/Navbar";
import RoleRouter from "./components/RoleRouter";
import { UserProvider } from "./context/UserContext";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Navbar />
        <RoleRouter />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;