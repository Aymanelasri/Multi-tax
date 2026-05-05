import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * GroupedValidationMessages - Optimized for large invoice lists
 * Groups repetitive messages and provides collapsible details
 */
const GroupedValidationMessages = ({ errors = [], warnings = [], infos = [] }) => {
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [expandAll, setExpandAll] = useState(false);

  // Group messages by pattern
  const groupMessages = (messages, severity) => {
    const groups = {};

    messages.forEach((msg) => {
      // Extract invoice number and message pattern
      const match = msg.match(/^Facture (\d+): (.+)$/);
      
      if (match) {
        const [, invoiceNum, message] = match;
        
        // Create a pattern key (remove specific values)
        let pattern = message
          .replace(/\d+\.?\d*/g, 'X') // Replace numbers with X
          .replace(/\([^)]+\)/g, '(X)') // Replace content in parentheses
          .replace(/\s+/g, ' ')
          .trim();

        if (!groups[pattern]) {
          groups[pattern] = {
            pattern,
            originalMessage: message,
            severity,
            invoices: [],
            count: 0
          };
        }

        groups[pattern].invoices.push({
          num: invoiceNum,
          fullMessage: msg
        });
        groups[pattern].count++;
      } else {
        // Non-invoice specific message
        const key = `global_${msg}`;
        groups[key] = {
          pattern: msg,
          originalMessage: msg,
          severity,
          invoices: [],
          count: 1,
          isGlobal: true
        };
      }
    });

    return Object.values(groups);
  };

  // Combine and group all messages
  const groupedData = useMemo(() => {
    return [
      ...groupMessages(errors, 'error'),
      ...groupMessages(warnings, 'warning'),
      ...groupMessages(infos, 'info')
    ].sort((a, b) => {
      // Sort by severity then by count
      const severityOrder = { error: 0, warning: 1, info: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.count - a.count;
    });
  }, [errors, warnings, infos]);

  const toggleGroup = (index) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandedGroups(new Set());
    } else {
      setExpandedGroups(new Set(groupedData.map((_, i) => i)));
    }
    setExpandAll(!expandAll);
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'error':
        return {
          icon: AlertCircle,
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.08)',
          border: 'rgba(239, 68, 68, 0.3)',
          label: '🔴 ERREUR'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: '#fbbf24',
          bg: 'rgba(251, 191, 36, 0.08)',
          border: 'rgba(251, 191, 36, 0.3)',
          label: '🟡 AVERTISSEMENT'
        };
      case 'info':
        return {
          icon: Info,
          color: '#60A5FA',
          bg: 'rgba(96, 165, 250, 0.08)',
          border: 'rgba(96, 165, 250, 0.3)',
          label: '🔵 INFO'
        };
      default:
        return {
          icon: Info,
          color: '#94a3b8',
          bg: 'rgba(148, 163, 184, 0.08)',
          border: 'rgba(148, 163, 184, 0.3)',
          label: 'INFO'
        };
    }
  };

  if (groupedData.length === 0) {
    return null;
  }

  const MAX_VISIBLE_ITEMS = 10;

  return (
    <div style={{
      background: '#0a0f1a',
      border: '1px solid #1e3a5f',
      borderRadius: 12,
      padding: '20px',
      marginTop: 16
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid #1e3a5f'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          📋 Messages de validation
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            background: 'rgba(255,255,255,0.05)',
            padding: '2px 8px',
            borderRadius: 12
          }}>
            {groupedData.length} {groupedData.length === 1 ? 'groupe' : 'groupes'}
          </span>
        </div>

        {groupedData.length > 1 && (
          <button
            onClick={toggleExpandAll}
            style={{
              background: 'transparent',
              border: '1px solid rgba(0,212,160,0.3)',
              color: '#00d4a0',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,212,160,0.1)';
              e.currentTarget.style.borderColor = 'rgba(0,212,160,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(0,212,160,0.3)';
            }}
          >
            {expandAll ? '📕 Tout réduire' : '📖 Tout développer'}
          </button>
        )}
      </div>

      {/* Grouped Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {groupedData.map((group, index) => {
          const config = getSeverityConfig(group.severity);
          const isExpanded = expandedGroups.has(index);
          const Icon = config.icon;
          const hasDetails = group.invoices.length > 0;
          const visibleInvoices = group.invoices.slice(0, MAX_VISIBLE_ITEMS);
          const remainingCount = group.invoices.length - MAX_VISIBLE_ITEMS;

          return (
            <div
              key={index}
              style={{
                background: config.bg,
                border: `1px solid ${config.border}`,
                borderRadius: 10,
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}
            >
              {/* Group Header */}
              <div
                onClick={() => hasDetails && toggleGroup(index)}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: hasDetails ? 'pointer' : 'default',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (hasDetails) {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Expand Icon */}
                {hasDetails && (
                  <div style={{ flexShrink: 0 }}>
                    {isExpanded ? (
                      <ChevronDown size={18} color={config.color} />
                    ) : (
                      <ChevronRight size={18} color={config.color} />
                    )}
                  </div>
                )}

                {/* Severity Icon */}
                <Icon size={20} color={config.color} style={{ flexShrink: 0 }} />

                {/* Message */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#ffffff',
                    marginBottom: 2
                  }}>
                    {group.originalMessage}
                  </div>
                  {!group.isGlobal && (
                    <div style={{
                      fontSize: '12px',
                      color: '#94a3b8'
                    }}>
                      {group.count} {group.count === 1 ? 'facture' : 'factures'} concernée{group.count > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Count Badge */}
                {!group.isGlobal && (
                  <div style={{
                    background: config.color,
                    color: '#0a0f1a',
                    fontSize: '13px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 20,
                    flexShrink: 0
                  }}>
                    {group.count}
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && hasDetails && (
                <div style={{
                  borderTop: `1px solid ${config.border}`,
                  padding: '12px 16px',
                  background: 'rgba(0,0,0,0.2)'
                }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 8
                  }}>
                    Détails des factures
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}>
                    {visibleInvoices.map((invoice, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: '13px',
                          color: '#e2e8f0',
                          padding: '6px 10px',
                          background: 'rgba(0,0,0,0.2)',
                          borderRadius: 6,
                          borderLeft: `3px solid ${config.color}`,
                          fontFamily: 'var(--mono)'
                        }}
                      >
                        {invoice.fullMessage}
                      </div>
                    ))}

                    {remainingCount > 0 && (
                      <div style={{
                        fontSize: '12px',
                        color: '#64748b',
                        padding: '8px 10px',
                        textAlign: 'center',
                        fontStyle: 'italic'
                      }}>
                        + {remainingCount} autre{remainingCount > 1 ? 's' : ''}...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div style={{
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px solid #1e3a5f',
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        fontSize: '12px',
        color: '#94a3b8'
      }}>
        {errors.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#ef4444', fontWeight: 700 }}>●</span>
            <span>{errors.length} erreur{errors.length > 1 ? 's' : ''}</span>
          </div>
        )}
        {warnings.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>●</span>
            <span>{warnings.length} avertissement{warnings.length > 1 ? 's' : ''}</span>
          </div>
        )}
        {infos.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#60A5FA', fontWeight: 700 }}>●</span>
            <span>{infos.length} info{infos.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupedValidationMessages;
