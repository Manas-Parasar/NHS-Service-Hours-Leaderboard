import React from "react";
import { useUser } from "./context/UserContext";
import { BrowserRouter } from "react-router-dom";
import MainContent from "./components/MainContent";

function App() {
  const { loading } = useUser();

  if (loading) {
    return <div>Loading application...</div>; // Or a loading spinner
  }

  return (
    <BrowserRouter>
      <MainContent />
    </BrowserRouter>
  );
}

export default App;