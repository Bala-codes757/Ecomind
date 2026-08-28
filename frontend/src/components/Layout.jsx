import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WorkflowStrip from './WorkflowStrip';
import CommandPalette from './CommandPalette';
import { useWorkspace } from '../context/WorkspaceContext';

export default function Layout() {
  const location = useLocation();
  const { toast } = useWorkspace();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <WorkflowStrip key={location.pathname} />
      <main id="main" style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      {toast && <div className="toast" role="status">{toast.message}</div>}
    </>
  );
}
