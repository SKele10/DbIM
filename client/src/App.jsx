import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Artists from "./pages/Artists";
import ArtistDetails from "./pages/ArtistDetails";
import Albums from "./pages/Albums";
import AlbumDetails from "./pages/AlbumDetails";
import Companies from "./pages/Companies";
import CompanyDetails from "./pages/CompanyDetails";
import QuerySearch from "./pages/QuerySearch";
import Rating from "./pages/Rating";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/artists/:id" element={<ArtistDetails />} />
        <Route path="/albums" element={<Albums />} />
        <Route path="/albums/:id" element={<AlbumDetails />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:id" element={<CompanyDetails />} />
        <Route path="/search" element={<QuerySearch />} />
        <Route path="/rating" element={<Rating />} />
      </Routes>
    </Router>
  );
};

export default App;
