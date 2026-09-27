import React from 'react';
import { Box } from '@mui/material';

export const RedGridBackground: React.FC = () => {
  return (
    <Box className="red-grid-container">
      {/* Primary Red Grid */}
      <Box className="red-grid-bg" />
      
      {/* Secondary Fine Grid */}
      <Box className="red-grid-bg-fine" />
      
      {/* Radial Glow Orbs */}
      <Box className="red-radial-glow" />
      
      {/* Horizontal Scanning Laser 1 */}
      <Box className="red-laser-line-h" />
      
      {/* Horizontal Scanning Laser 2 (Reverse) */}
      <Box className="red-laser-line-h2" />
      
      {/* Vertical Scanning Laser */}
      <Box className="red-laser-line-v" />
    </Box>
  );
};
