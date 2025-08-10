import React from "react";
import Navbar from "./components/Navbar";
import RoleRouter from "./components/RoleRouter";

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