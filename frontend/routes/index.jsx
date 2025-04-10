import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoveTreeHome from '../components/home/LoveTreeHome';
import LoveTreeDetail from '../components/detail/LoveTreeDetail';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LoveTreeHome />} />
      <Route path="/tree/:id" element={<LoveTreeDetail />} />
    </Routes>
  );
}; 