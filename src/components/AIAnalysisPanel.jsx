import React from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, Eye, Camera, 
  Copy, Zap, TrendingUp, Shield 
} from 'lucide-react';
import './AIAnalysisPanel.css';

const AIAnalysisPanel = ({ aiAnalysis, compact = false }) => {
  if (!aiAnalysis) {
    return (
      <div className="ai-analysis-panel">
        <div className="ai-header">
          <Zap size={20} />
          <span>AI Analysis</span>
        </div>
        <div className="ai-content">
          <p className="no-analysis">No AI analysis available</p>
        </div>
      </div>
    );
  }

  const {
    face_confidence = 0,
    object_detected = false,
    quality_score = 0,
    is_duplicate = false,
    ai_recommendation = 'manual_review',
    confidence_level = 'low'
  } = aiAnalysis;

  const getStatusIcon = (status, threshold) => {
    if (status >= threshold) return <CheckCircle size={16} className="status-pass" />;
    if (status >= threshold * 0.6) return <AlertTriangle size={16} className="status-warning" />;
    return <XCircle size={16} className="status-fail" />;
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'auto_approve': return 'success';
      case 'auto_reject': return 'danger';
      default: return 'warning';
    }
  };

  const getRecommendationText = (recommendation) => {
    switch (recommendation) {
      case 'auto_approve': return 'Auto-Approve Recommended';
      case 'auto_reject': return 'Auto-Reject Recommended';
      default: return 'Manual Review Required';
    }
  };

  if (compact) {
    return (
      <div className="ai-analysis-compact">
        <div className="ai-badges">
          <div className={`ai-badge ${confidence_level}`}>
            <Eye size={14} />
            <span>{face_confidence.toFixed(1)}%</span>
          </div>
          <div className={`ai-badge ${object_detected ? 'success' : 'danger'}`}>
            <Camera size={14} />
            <span>{object_detected ? 'Objects' : 'No Objects'}</span>
          </div>
          <div className={`ai-badge ${quality_score >= 70 ? 'success' : quality_score >= 40 ? 'warning' : 'danger'}`}>
            <TrendingUp size={14} />
            <span>{quality_score.toFixed(0)}</span>
          </div>
        </div>
        <div className={`ai-recommendation ${getRecommendationColor(ai_recommendation)}`}>
          {ai_recommendation === 'auto_approve' && <CheckCircle size={14} />}
          {ai_recommendation === 'auto_reject' && <XCircle size={14} />}
          {ai_recommendation === 'manual_review' && <AlertTriangle size={14} />}
          <span>{getRecommendationText(ai_recommendation)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-analysis-panel">
      <div className="ai-header">
        <Zap size={20} />
        <span>AI Analysis Results</span>
        <div className={`confidence-badge ${confidence_level}`}>
          {confidence_level.toUpperCase()}
        </div>
      </div>

      <div className="ai-content">
        <div className="analysis-grid">
          {/* Face Verification */}
          <div className="analysis-item">
            <div className="analysis-header">
              {getStatusIcon(face_confidence, 60)}
              <Eye size={18} />
              <span>Face Match</span>
            </div>
            <div className="analysis-value">
              <span className="percentage">{face_confidence.toFixed(1)}%</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${Math.min(face_confidence, 100)}%`,
                    backgroundColor: face_confidence >= 60 ? '#10b981' : face_confidence >= 30 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Object Detection */}
          <div className="analysis-item">
            <div className="analysis-header">
              {object_detected ? 
                <CheckCircle size={16} className="status-pass" /> : 
                <XCircle size={16} className="status-fail" />
              }
              <Camera size={18} />
              <span>Objects</span>
            </div>
            <div className="analysis-value">
              <span className={`status-text ${object_detected ? 'success' : 'danger'}`}>
                {object_detected ? 'Detected' : 'Not Found'}
              </span>
            </div>
          </div>

          {/* Image Quality */}
          <div className="analysis-item">
            <div className="analysis-header">
              {getStatusIcon(quality_score, 70)}
              <TrendingUp size={18} />
              <span>Quality</span>
            </div>
            <div className="analysis-value">
              <span className="percentage">{quality_score.toFixed(0)}/100</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${Math.min(quality_score, 100)}%`,
                    backgroundColor: quality_score >= 70 ? '#10b981' : quality_score >= 40 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Duplicate Check */}
          <div className="analysis-item">
            <div className="analysis-header">
              {is_duplicate ? 
                <XCircle size={16} className="status-fail" /> : 
                <CheckCircle size={16} className="status-pass" />
              }
              <Copy size={18} />
              <span>Duplicate</span>
            </div>
            <div className="analysis-value">
              <span className={`status-text ${is_duplicate ? 'danger' : 'success'}`}>
                {is_duplicate ? 'Found' : 'Unique'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Recommendation */}
        <div className="ai-recommendation-panel">
          <div className="recommendation-header">
            <Shield size={18} />
            <span>AI Recommendation</span>
          </div>
          <div className={`recommendation-badge ${getRecommendationColor(ai_recommendation)}`}>
            {ai_recommendation === 'auto_approve' && <CheckCircle size={16} />}
            {ai_recommendation === 'auto_reject' && <XCircle size={16} />}
            {ai_recommendation === 'manual_review' && <AlertTriangle size={16} />}
            <span>{getRecommendationText(ai_recommendation)}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-label">Confidence</span>
            <span className={`stat-value ${confidence_level}`}>
              {confidence_level.toUpperCase()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Overall</span>
            <span className="stat-value">
              {Math.round((face_confidence + quality_score + (object_detected ? 100 : 0) + (is_duplicate ? 0 : 100)) / 4)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisPanel;