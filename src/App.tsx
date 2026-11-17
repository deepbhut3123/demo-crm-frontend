import React from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CrmProvider } from './crm/store';
import { Workspace } from './crm/Workspace';
import { modules } from './crm/data';
import './index.css';
import 'antd/dist/reset.css';

const App: React.FC = () => <ConfigProvider theme={{
  token: {
    colorPrimary: '#0067E8',
    colorInfo: '#0067E8',
    colorText: '#041B39',
    colorBgLayout: '#F4F8FC',
    colorBorder: '#D2E3F0',
    colorLink: '#0067E8',
    borderRadius: 8,
  },
}}>
  <CrmProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Workspace />} />
        <Route path="/dashboard" element={<Workspace />} />
        {modules.map((module) => <Route key={module.key} path={`/${module.key}`} element={<Workspace />} />)}
        <Route path="/reports" element={<Workspace />} />
        <Route path="/ai-automations" element={<Workspace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </CrmProvider>
</ConfigProvider>;

export default App;
