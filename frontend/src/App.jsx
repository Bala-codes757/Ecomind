import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WorkspaceProvider } from './context/WorkspaceContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Modules from './pages/Modules';
import Survey from './pages/Survey';
import DataIngestion from './pages/DataIngestion';
import Analysis from './pages/Analysis';
import Results from './pages/Results';
import Improve from './pages/Improve';
import Compare from './pages/Compare';
import Simulator from './pages/Simulator';
import Progress from './pages/Progress';
import Admin from './pages/Admin';
import DataPortability from './pages/DataPortability';

export default function App() {
  return (
    <WorkspaceProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="modules" element={<Modules />} />
            <Route path="survey" element={<Survey />} />
            <Route path="survey/:module" element={<Survey />} />
            <Route path="data" element={<DataIngestion />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="results" element={<Results />} />
            <Route path="improve" element={<Improve />} />
            <Route path="recommendations" element={<Improve />} />
            <Route path="compare" element={<Compare />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="progress" element={<Progress />} />
            <Route path="portability" element={<DataPortability />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WorkspaceProvider>
  );
}

