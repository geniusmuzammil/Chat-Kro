// import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
// import Register from "./pages/Register"; // You'll create this page next
// import Messages from "./pages/Messages"; // We'll create this page for messaging

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" element={<Register />} />
        <Route path="/messages" element={<Messages />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
