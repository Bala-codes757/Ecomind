import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="footer-logo">EcoMind</div>
            <p className="footer-tagline">
              A facility scorecard for energy, water, and waste — built from the bills you already have.
            </p>
          </div>
          <div className="footer-col">
            <h4>Work</h4>
            <ul>
              <li><Link to="/survey/energy">Facility questions</Link></li>
              <li><Link to="/data">Utility records</Link></li>
              <li><Link to="/results">Scorecard</Link></li>
              <li><Link to="/simulator">Spend model</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Decisions</h4>
            <ul>
              <li><Link to="/improve">Recommended work</Link></li>
              <li><Link to="/compare">Compare options</Link></li>
              <li><Link to="/progress">Monthly history</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Setup</h4>
            <ul>
              <li><Link to="/admin">Module settings</Link></li>
              <li><Link to="/modules">All modules</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} EcoMind</p>
          <p>Scores are calculated from meter totals, not generated copy.</p>
        </div>
      </div>
    </footer>
  );
}
