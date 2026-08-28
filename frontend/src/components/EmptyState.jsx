import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyState({ title, body, to, cta }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{body}</p>
      {to && cta && (
        <Link to={to} className="btn btn-primary">
          {cta}
        </Link>
      )}
    </div>
  );
}
