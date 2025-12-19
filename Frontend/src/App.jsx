import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./pages/Homepage.jsx";
import Registerpage from "./pages/registerpage.jsx";
import Loginpage from "./pages/Loginpage.jsx";

function App() {
  const issigned = true;

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Loginpage />} />
      <Route path="/register" element={<Registerpage />} />

      {/* <Route
        path="/problempage"
        element={issigned ? <Problempage /> : <Navigate to="/" />}
      /> */}
    </Routes>
  );
}

export default App;
