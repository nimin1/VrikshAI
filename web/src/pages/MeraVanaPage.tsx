/**
 * Mera Vana Page - Plant Collection (Coming Soon)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Strings } from '../constants/strings';
import Card from '../components/Card';
import Button from '../components/Button';
import './PlaceholderPage.css';

export default function MeraVanaPage() {
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
            {Strings.features.vana.name}
          </h1>
          <p className="placeholder-page__subtitle">
            {Strings.features.vana.description}
          </p>
        </div>
      </header>

      <main className="placeholder-page__main">
        <div className="placeholder-page__container">
          <Card>
            <div className="placeholder-page__content">
              <div className="placeholder-page__icon">🌳</div>
              <h2 className="placeholder-page__coming-soon">Coming Soon</h2>
              <p className="placeholder-page__description">
                Build and manage your personal plant collection. Track each
                plant's health, watering schedule, and growth journey. Your
                digital botanical garden is on its way!
              </p>
              <div className="placeholder-page__features-list">
                <h3>Upcoming Features:</h3>
                <ul>
                  <li>Add plants to your personal collection</li>
                  <li>Track watering and fertilizing schedules</li>
                  <li>Monitor plant health over time</li>
                  <li>Set custom reminders and nicknames</li>
                  <li>View growth photos and history</li>
                </ul>
              </div>
              <Button onClick={() => navigate('/')} variant="secondary">
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
