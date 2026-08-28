import React from 'react';

export default function PageIntro({ kicker, title, children, actions }) {
  return (
    <header className="page-intro">
      <div>
        {kicker && <p className="page-kicker">{kicker}</p>}
        <h1 className="page-title">{title}</h1>
        {children && <p className="page-subtitle">{children}</p>}
      </div>
      {actions && <div className="page-intro-actions">{actions}</div>}
    </header>
  );
}
