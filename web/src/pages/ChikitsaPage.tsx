/**
 * Chikitsa Page - Plant Health Diagnosis (Coming Soon)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PlaceholderPage.css';

export default function ChikitsaPage() {
  const navigate = useNavigate();

  return (
    <div className="placeholder-page">
      <header className="placeholder-page__header">
        <div className="placeholder-page__header-content">
          <button
            className="placeholder-page__back-button"
            onClick={() => navigate('/')}
          >
            ← Back
          </button>
          <h1 className="placeholder-page__title">
            AI Chikitsa
          </h1>
          <p className="placeholder-page__subtitle">
            Diagnose and treat plant issues
          </p>
        </div>
      </header>

      <main className="placeholder-page__main">
        <div className="placeholder-page__container">
          <div className="placeholder-page__content">
            <div className="placeholder-page__icon">🌿</div>
            <h2 className="placeholder-page__coming-soon">Coming Soon</h2>
            <p className="placeholder-page__description">
              AI-powered plant health diagnosis and treatment recommendations.
              Describe symptoms or upload photos, and receive expert guidance
              to nurse your plants back to health.
            </p>
            <div className="placeholder-page__features-list">
              <h3>Upcoming Features:</h3>
              <ul>
                <li>Diagnose plant diseases and pests</li>
                <li>Get severity assessment and confidence scores</li>
                <li>Receive treatment recommendations</li>
                <li>Learn natural and chemical remedies</li>
                <li>Prevention tips and warning signs</li>
                <li>Traditional Ayurvedic plant wisdom</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
