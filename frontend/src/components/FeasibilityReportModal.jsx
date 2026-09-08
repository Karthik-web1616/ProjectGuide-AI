import { useState } from 'react';
import { showToast } from '../utils/toast';

export default function FeasibilityReportModal({ isOpen, onClose, report, project }) {
  if (!isOpen || !report) return null;

  const {
    overallScore = 0,
    verdict = 'Under Review',
    metrics = {},
    strengths = [],
    bottlenecks = [],
    filesAnalyzed = [],
    aiGenerated = false
  } = report;

  const title = project?.title || 'Academic Project';
  const domain = (project?.domain || 'web').toUpperCase();
  const days = project?.durationDays || 30;
  const teamSize = project?.teamSize || 3;

  const getVerdictStyle = () => {
    if (overallScore >= 80 || verdict.toLowerCase().includes('highly')) {
      return {
        bg: 'rgba(34, 197, 94, 0.12)',
        color: '#22c55e',
        border: '1px solid rgba(34, 197, 94, 0.35)',
        icon: '✅'
      };
    }
    if (overallScore >= 70 || verdict.toLowerCase().includes('guidance')) {
      return {
        bg: 'rgba(245, 158, 11, 0.12)',
        color: '#f59e0b',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        icon: '⚠️'
      };
    }
    return {
      bg: 'rgba(239, 68, 68, 0.12)',
      color: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.35)',
      icon: '🛑'
    };
  };

  const verdictStyle = getVerdictStyle();

  const handleCopy = () => {
    const text = `
=== AI FEASIBILITY ANALYSIS REPORT ===
Project: ${title}
Domain: ${domain} | Duration: ${days} Days | Team: ${teamSize}
Overall Feasibility Score: ${overallScore}%
Verdict: ${verdict}
Engine: ${aiGenerated ? 'Live CrewAI Agent (Groq LLM)' : 'Heuristic Fallback'}

METRICS:
- Technical Complexity: ${metrics.technical || 0}%
- Timeline Adequacy: ${metrics.timeline || 0}%
- Resource Availability: ${metrics.resource || 0}%
- Skill Match: ${metrics.skillMatch || 0}%

STRENGTHS:
${strengths.map(s => `• ${s}`).join('\n')}

BOTTLENECKS:
${bottlenecks.map(b => `• ${b}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    showToast('AI Feasibility report copied to clipboard!', '📋');
  };

  return (
    <div className="modal-overlay open" style={{ zIndex: 1060 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal animate-fade-up" style={{ maxWidth: '680px', width: '92%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.74rem' }}>
                {aiGenerated ? '🤖 Live AI Feasibility Agent (CrewAI + Groq)' : '⚡ Feasibility Heuristic Analysis'}
              </span>
              <span className="badge" style={{ background: 'var(--surface2)', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                {domain}
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
              {title}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Duration: {days} Days · Team Size: {teamSize} members
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="modal-close"
            style={{ position: 'static', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Score & Verdict Card */}
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', background: 'var(--surface2)', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', borderRadius: '50%', background: verdictStyle.bg, border: verdictStyle.border, flexShrink: 0 }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: verdictStyle.color, lineHeight: 1 }}>
              {overallScore}%
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Feasibility
            </span>
          </div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '16px', background: verdictStyle.bg, color: verdictStyle.color, border: verdictStyle.border, fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
              <span>{verdictStyle.icon}</span>
              <span>{verdict}</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
              {overallScore >= 80 
                ? 'High viability for academic execution within constraints. Student team and tech stack match the expected scope.' 
                : overallScore >= 70 
                ? 'Viable with guided faculty supervision. Key bottlenecks and architecture need careful milestone monitoring.' 
                : 'Scope is too broad for the timeframe. Consider prioritizing the core MVP features before full development.'}
            </p>
          </div>
        </div>

        {/* Detailed Metrics Breakdown */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
            Feasibility Evaluation Dimensions
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
            {[
              { label: 'Technical Complexity', val: metrics.technical || 0, icon: '⚙️' },
              { label: 'Timeline Sufficiency', val: metrics.timeline || 0, icon: '⏱️' },
              { label: 'Resource & Tool Availability', val: metrics.resource || 0, icon: '📦' },
              { label: 'Student Skill-Match', val: metrics.skillMatch || 0, icon: '🎯' }
            ].map((m, idx) => (
              <div key={idx} style={{ background: 'var(--surface2)', padding: '0.85rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{m.icon}</span> <span>{m.label}</span>
                  </span>
                  <span style={{ fontWeight: 700, color: m.val >= 75 ? '#22c55e' : m.val >= 60 ? '#f59e0b' : '#ef4444' }}>
                    {m.val}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${m.val}%`, 
                      height: '100%', 
                      background: m.val >= 75 ? '#22c55e' : m.val >= 60 ? '#f59e0b' : '#ef4444', 
                      borderRadius: '3px', 
                      transition: 'width 0.4s ease' 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#22c55e', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>✨</span> Key Project Strengths
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {strengths.map((str, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.45, background: 'rgba(34, 197, 94, 0.05)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                  <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottlenecks */}
        {bottlenecks.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#f59e0b', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⚠️</span> Potential Bottlenecks &amp; Challenges
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {bottlenecks.map((btn, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.45, background: 'rgba(245, 158, 11, 0.05)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                  <span style={{ color: '#f59e0b', flexShrink: 0 }}>!</span>
                  <span>{btn}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyzed Files Info */}
        {filesAnalyzed.length > 0 && (
          <div style={{ marginBottom: '1.25rem', padding: '0.65rem 0.85rem', background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>📎 Reference Files Analyzed by Agent:</strong> {filesAnalyzed.join(', ')}
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.1rem', marginTop: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={handleCopy}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📋 Copy Report
          </button>

          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={onClose}
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
