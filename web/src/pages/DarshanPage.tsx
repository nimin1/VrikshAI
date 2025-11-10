/**
 * Darshan Page - AI Plant Identification
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiDarshan, processImageForUpload } from '../services/api';
import { DarshanResult } from '../types';
import { Strings } from '../constants/strings';
import { Colors } from '../constants/colors';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import './DarshanPage.css';

export default function DarshanPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DarshanResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function handleImageSelect(file: File) {
    try {
      setLoading(true);
      setResult(null);

      // Create preview
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      // Process and upload
      const base64 = await processImageForUpload(file);
      const response = await aiDarshan({ image: base64 });

      setResult(response.result);
    } catch (error: any) {
      console.error('Darshan error:', error);
      setImagePreview(null);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  }

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleCameraClick() {
    cameraInputRef.current?.click();
  }

  function handleReset() {
    setResult(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="darshan-page">
      <header className="darshan-page__header">
        <div className="darshan-page__header-content">
          <div>
            <button
              className="darshan-page__back-button"
              onClick={() => navigate('/')}
            >
              ← Back
            </button>
            <h1 className="darshan-page__title">
              {Strings.features.darshan.name}
            </h1>
            <p className="darshan-page__subtitle">
              {Strings.features.darshan.description}
            </p>
          </div>
        </div>
      </header>

      <main className="darshan-page__main">
        <div className="darshan-page__container">
          {!result && !loading && (
            <Card>
              <div className="darshan-page__upload">
                {/* Hidden file input for gallery */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {/* Hidden file input for camera - uses capture attribute for mobile */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div className="darshan-page__upload-icon">📸</div>
                <h2 className="darshan-page__upload-title">
                  Identify a Plant
                </h2>
                <p className="darshan-page__upload-description">
                  Take a clear photo of any plant and I'll identify it for you
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', width: '100%', maxWidth: '300px' }}>
                  {/* Show "Take Photo" button on mobile, hide on desktop */}
                  {/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && (
                    <Button size="large" onClick={handleCameraClick} fullWidth>
                      📷 Take Photo
                    </Button>
                  )}
                  <Button
                    size="large"
                    onClick={handleUploadClick}
                    variant={/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? "secondary" : "primary"}
                    fullWidth
                  >
                    🖼️ {/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'Choose from Gallery' : 'Choose Photo'}
                  </Button>
                </div>

                <p className="darshan-page__upload-hint">
                  Supports JPEG, PNG, WebP (max 5MB)
                </p>
              </div>
            </Card>
          )}

          {loading && (
            <Card>
              <div className="darshan-page__loading">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Plant preview"
                    className="darshan-page__preview"
                  />
                )}
                <LoadingSpinner size="large" message="Identifying plant..." />
              </div>
            </Card>
          )}

          {result && imagePreview && (
            <div className="darshan-page__result">
              <Card>
                <img
                  src={imagePreview}
                  alt="Plant"
                  className="darshan-page__result-image"
                />
              </Card>

              <Card>
                <div className="darshan-page__result-header">
                  <div>
                    <h2 className="darshan-page__result-title">
                      {result.common_name}
                    </h2>
                    <p className="darshan-page__result-scientific">
                      {result.scientific_name}
                    </p>
                    {result.sanskrit_name && (
                      <p className="darshan-page__result-sanskrit">
                        Sanskrit: {result.sanskrit_name}
                      </p>
                    )}
                    <p className="darshan-page__result-meta">
                      {result.plant_type} • {result.family}
                    </p>
                  </div>
                  <div
                    className="darshan-page__confidence"
                    style={{
                      backgroundColor:
                        result.confidence >= 0.8
                          ? Colors.status.healthy
                          : result.confidence >= 0.6
                          ? Colors.status.warning
                          : Colors.status.critical,
                    }}
                  >
                    {Math.round(result.confidence * 100)}%
                  </div>
                </div>

                {/* Health Status */}
                {result.health_status && result.health_notes && (
                  <div className="darshan-page__result-section">
                    <h3>🌿 Health Status</h3>
                    <div
                      className="darshan-page__health-badge"
                      style={{
                        backgroundColor:
                          result.health_status === 'thriving' || result.health_status === 'healthy'
                            ? Colors.status.healthy
                            : result.health_status === 'needs_attention'
                            ? Colors.status.warning
                            : Colors.status.critical,
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        display: 'inline-block',
                        textTransform: 'capitalize',
                        marginBottom: '0.5rem'
                      }}
                    >
                      {result.health_status.replace(/_/g, ' ')}
                    </div>
                    <p>{result.health_notes}</p>
                  </div>
                )}

                {/* Description */}
                {result.description && (
                  <div className="darshan-page__result-section">
                    <h3>📝 Description</h3>
                    {result.description.appearance && (
                      <p><strong>Appearance:</strong> {result.description.appearance}</p>
                    )}
                    {result.description.leaves && (
                      <p><strong>Leaves:</strong> {result.description.leaves}</p>
                    )}
                    {result.description.flowers_fruits && (
                      <p><strong>Flowers/Fruits:</strong> {result.description.flowers_fruits}</p>
                    )}
                    {result.description.origin && (
                      <p><strong>Origin:</strong> {result.description.origin}</p>
                    )}
                    {result.description.lifespan && (
                      <p><strong>Lifespan:</strong> {result.description.lifespan}</p>
                    )}
                  </div>
                )}

                {/* Care Guide */}
                {result.care_guide && (
                  <div className="darshan-page__result-section">
                    <h3>🌱 Care Guide</h3>
                    <div className="darshan-page__care-grid">
                      {result.care_guide.light && (
                        <div>
                          <strong>☀️ Light:</strong> {result.care_guide.light}
                        </div>
                      )}
                      {result.care_guide.water && (
                        <div>
                          <strong>💧 Water:</strong> {result.care_guide.water}
                        </div>
                      )}
                      {result.care_guide.soil && (
                        <div>
                          <strong>🌍 Soil:</strong> {result.care_guide.soil}
                        </div>
                      )}
                      {result.care_guide.temperature && (
                        <div>
                          <strong>🌡️ Temperature:</strong> {result.care_guide.temperature}
                        </div>
                      )}
                      {result.care_guide.humidity && (
                        <div>
                          <strong>💨 Humidity:</strong> {result.care_guide.humidity}
                        </div>
                      )}
                      {result.care_guide.fertilizer && (
                        <div>
                          <strong>🌿 Fertilizer:</strong> {result.care_guide.fertilizer}
                        </div>
                      )}
                      {result.care_guide.pruning && (
                        <div>
                          <strong>✂️ Pruning:</strong> {result.care_guide.pruning}
                        </div>
                      )}
                      {result.care_guide.pests_diseases && (
                        <div>
                          <strong>🐛 Pests/Diseases:</strong> {result.care_guide.pests_diseases}
                        </div>
                      )}
                      {result.care_guide.difficulty && (
                        <div>
                          <strong>📊 Difficulty:</strong> <span style={{ textTransform: 'capitalize' }}>{result.care_guide.difficulty}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Vastu Shastra */}
                {result.vastu && (
                  <div className="darshan-page__result-section">
                    <h3>🏡 Vastu Shastra Guidance</h3>
                    {result.vastu.direction && (
                      <p><strong>Best Direction:</strong> {result.vastu.direction}</p>
                    )}
                    {result.vastu.location && (
                      <p><strong>Location:</strong> {result.vastu.location}</p>
                    )}
                    {result.vastu.benefits && result.vastu.benefits.length > 0 && (
                      <>
                        <p><strong>Benefits:</strong></p>
                        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                          {result.vastu.benefits.map((benefit, idx) => (
                            <li key={idx}>{benefit}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {result.vastu.suitable_rooms && result.vastu.suitable_rooms.length > 0 && (
                      <p><strong>Suitable Rooms:</strong> {result.vastu.suitable_rooms.join(', ')}</p>
                    )}
                    {result.vastu.considerations && (
                      <p><strong>Considerations:</strong> {result.vastu.considerations}</p>
                    )}
                  </div>
                )}

                {/* Traditional Significance */}
                {result.traditional_significance &&
                  (result.traditional_significance.ayurvedic_uses ||
                  result.traditional_significance.medicinal_properties ||
                  result.traditional_significance.cultural_importance ||
                  result.traditional_significance.festivals_rituals) && (
                  <div className="darshan-page__result-section">
                    <h3>🕉️ Traditional & Cultural Significance</h3>
                    {result.traditional_significance.ayurvedic_uses && (
                      <p><strong>Ayurvedic Uses:</strong> {result.traditional_significance.ayurvedic_uses}</p>
                    )}
                    {result.traditional_significance.medicinal_properties && (
                      <p><strong>Medicinal Properties:</strong> {result.traditional_significance.medicinal_properties}</p>
                    )}
                    {result.traditional_significance.cultural_importance && (
                      <p><strong>Cultural Importance:</strong> {result.traditional_significance.cultural_importance}</p>
                    )}
                    {result.traditional_significance.festivals_rituals && (
                      <p><strong>Festivals & Rituals:</strong> {result.traditional_significance.festivals_rituals}</p>
                    )}
                  </div>
                )}

                {/* Interesting Facts */}
                {result.interesting_facts && result.interesting_facts.length > 0 && (
                  <div className="darshan-page__result-section">
                    <h3>✨ Interesting Facts</h3>
                    <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                      {result.interesting_facts.map((fact, idx) => (
                        <li key={idx} style={{ marginBottom: '0.5rem' }}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {result.warnings &&
                  (result.warnings.toxicity_humans ||
                  result.warnings.toxicity_pets ||
                  result.warnings.skin_irritation ||
                  result.warnings.handling_precautions) && (
                  <div className="darshan-page__result-section" style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ffc107' }}>
                    <h3>⚠️ Safety Warnings</h3>
                    {result.warnings.toxicity_humans && (
                      <p><strong>Human Toxicity:</strong> {result.warnings.toxicity_humans}</p>
                    )}
                    {result.warnings.toxicity_pets && (
                      <p><strong>Pet Safety:</strong> {result.warnings.toxicity_pets}</p>
                    )}
                    {result.warnings.skin_irritation && (
                      <p><strong>Skin Irritation:</strong> {result.warnings.skin_irritation}</p>
                    )}
                    {result.warnings.handling_precautions && (
                      <p><strong>Handling Precautions:</strong> {result.warnings.handling_precautions}</p>
                    )}
                  </div>
                )}

                <div className="darshan-page__result-actions">
                  <Button onClick={handleReset} variant="secondary" fullWidth>
                    Identify Another Plant
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
