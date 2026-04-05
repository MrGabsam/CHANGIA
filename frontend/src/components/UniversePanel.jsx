import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { kes } from '../utils/format.js';

const gradients = {
  Galaxy: ['grad-fuchsia', 'grad-cyan', 'grad-violet'],
  Savannah: ['grad-amber', 'grad-yellow', 'grad-emerald'],
  Ocean: ['grad-cyan', 'grad-sky', 'grad-teal'],
  'Neon City': ['grad-violet', 'grad-cyan', 'grad-pink'],
  'Lantern Sky': ['grad-amber', 'grad-orange', 'grad-yellow'],
};

export function UniversePanel({ space, contributions = [], compact = false }) {
  const verified = contributions.filter((item) => item.status === 'Verified');
  const raised = verified.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const palette = gradients[space.theme] || gradients.Galaxy;

  const nodes = useMemo(() => {
    const source = contributions.length ? contributions.slice(0, 8) : [{ amount: 1 }, { amount: 3 }, { amount: 2 }];
    return source.map((item, index) => {
      const amount = Number(item.amount || 0);
      return {
        size: amount >= 5000 ? 56 : amount >= 2500 ? 44 : 32,
        left: `${8 + (index % 4) * 22}%`,
        top: `${18 + Math.floor(index / 4) * 24}%`,
        color: palette[index % palette.length],
      };
    });
  }, [contributions, palette]);

  return (
    <div className="universe-panel">
      <div className="universe-bg" />
      <div className="universe-grid" />
      {nodes.map((node, index) => (
        <motion.div
          key={`${space._id || space.id}-${index}`}
          className={`universe-node ${node.color}`}
          style={{ left: node.left, top: node.top, width: node.size, height: node.size }}
          initial={{ opacity: 0.7, scale: 0.95 }}
          animate={{ opacity: [0.65, 1, 0.75], scale: [0.96, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 3.8 + index, ease: 'easeInOut' }}
        />
      ))}
      <div className="universe-bottom">
        <div className={`universe-summary ${compact ? 'compact' : ''}`}>
          <div className="glass-card">
            <div className="row-between gap-12">
              <div>
                <div className="eyebrow">{space.theme} Universe</div>
                <h3>{space.title}</h3>
              </div>
              <span className="badge badge-dark">Live</span>
            </div>
            <p className="muted-white">{space.description}</p>
            <div className="summary-grid">
              <div className="summary-box"><span>Raised</span><strong>{kes(raised)}</strong></div>
              <div className="summary-box"><span>People</span><strong>{contributions.length}</strong></div>
              <div className="summary-box"><span>Visibility</span><strong>{space.visibilityMode}</strong></div>
            </div>
          </div>
          {!compact && (
            <div className="glass-card">
              <div className="section-label">Memory Ribbon</div>
              <div className="stack gap-8">
                {(space.memories || []).slice(0, 3).map((memory) => (
                  <div key={memory} className="memory-item">{memory}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
