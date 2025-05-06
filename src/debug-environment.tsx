
import React from 'react';

// This component is a simple diagnostic tool to confirm React is working
const DebugEnvironment: React.FC = () => {
  return (
    <div className="p-4 bg-red-100 rounded-lg">
      <h2 className="text-xl font-bold">Debug Environment</h2>
      <p>React version: {React.version}</p>
      <p>Node environment: {process.env.NODE_ENV}</p>
    </div>
  );
};

export default DebugEnvironment;
