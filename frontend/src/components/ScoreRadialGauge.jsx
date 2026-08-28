import React from 'react';

export default function ScoreRadialGauge({ score = 74, grade = 'B+', size = 160, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Determine color based on performance
  let strokeColor = '#829877'; // Olive green
  let glowColor = 'rgba(130, 152, 119, 0.25)';
  let gradeBg = '#3d4a38';

  if (normalizedScore >= 85) {
    strokeColor = '#5a6b52'; // Rich forest
    glowColor = 'rgba(90, 107, 82, 0.3)';
    gradeBg = '#3d4a38';
  } else if (normalizedScore >= 70) {
    strokeColor = '#c49a45'; // Brass
    glowColor = 'rgba(196, 154, 69, 0.25)';
    gradeBg = '#8c6a32';
  } else if (normalizedScore >= 55) {
    strokeColor = '#9a4a32'; // Clay
    glowColor = 'rgba(154, 74, 50, 0.25)';
    gradeBg = '#9a4a32';
  } else {
    strokeColor = '#b84328';
    glowColor = 'rgba(184, 67, 40, 0.25)';
    gradeBg = '#b84328';
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth={strokeWidth}
        />
        {/* Animated Active Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 6px ${glowColor})`
          }}
        />
      </svg>

      {/* Central Content HUD */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.4rem',
            fontWeight: 700,
            lineHeight: 1,
            color: '#faf7f1'
          }}
        >
          {normalizedScore}
        </span>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginTop: '0.25rem',
            background: gradeBg,
            color: '#fff',
            fontSize: '0.74rem',
            fontWeight: 600,
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
            letterSpacing: '0.04em'
          }}
        >
          GRADE {grade}
        </div>
      </div>
    </div>
  );
}
