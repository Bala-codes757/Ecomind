import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Droplets, Trash2, Truck, TrendingUp, Layers, ArrowRight, Lock } from 'lucide-react';

const iconMap = {
  Zap,
  Droplets,
  Trash2,
  Truck,
  TrendingUp,
  Layers
};

export default function ModuleCard({ module }) {
  const Icon = iconMap[module.icon] || Layers;
  const disabled = module.disabled || module.is_active === false;

  return (
    <article className={`module-card ${disabled ? 'disabled-card' : 'active-card'}`}>
      <div>
        <div className="card-header">
          <div className="card-icon">
            <Icon size={18} />
          </div>
          <span className={`badge ${disabled ? 'badge-disabled' : 'badge-active'}`}>
            {module.badge}
          </span>
        </div>
        <h3 className="card-title">{module.name}</h3>
        <p className="card-description">{module.description}</p>
        {module.kpis && (
          <div className="card-kpis">
            <span>Score <b>{module.kpis.score}</b></span>
            <span>Trend <b>{module.kpis.trend}</b></span>
            <span>{module.kpis.mainDriver}</span>
          </div>
        )}
      </div>
      <div className="card-footer">
        {disabled ? (
          <span className="card-action-text text-muted">
            <Lock size={14} /> Not available yet
          </span>
        ) : (
          <Link to={module.route || `/survey/${module.key || module.id}`} className="card-action-text">
            Open {module.name.split(' ')[0].toLowerCase()}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </article>
  );
}
