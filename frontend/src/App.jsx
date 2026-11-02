import { Routes, Route } from "react-router-dom";

import MyListings from "./pages/MyListings";
import ResourceDetails from "./pages/ResourceDetails";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateResource from "./pages/CreateResource";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/my-listings" element={<MyListings />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/resource/:id" element={<ResourceDetails />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/create-resource" element={<CreateResource />} />
    </Routes>
  );
}

export default App;