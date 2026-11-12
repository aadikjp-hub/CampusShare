
import { Routes, Route } from "react-router-dom";

import MyRequests from "./pages/MyRequests";
import MyListings from "./pages/MyListings";
import ResourceDetails from "./pages/ResourceDetails";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import IncomingRequests from "./pages/IncomingRequests";
import CreateResource from "./pages/CreateResource";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyOTP />} />

      {/* Resources */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/resources/:id" element={<ResourceDetails />} />
      <Route path="/resource/:id" element={<ResourceDetails />} />
      <Route path="/create-resource" element={<CreateResource />} />
      <Route path="/my-listings" element={<MyListings />} />

      {/* Requests */}
      <Route path="/my-requests" element={<MyRequests />} />
      <Route
        path="/incoming-requests"
        element={<IncomingRequests />}
      />

      {/* Profile */}
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
