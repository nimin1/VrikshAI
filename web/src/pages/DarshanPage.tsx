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

                <div className="darshan-page__result-section">
                  <h3>Family</h3>
                  <p>{result.family}</p>
                </div>

                <div className="darshan-page__result-section">
                  <h3>Care Summary</h3>
                  <div className="darshan-page__care-grid">
                    <div>
                      <strong>Water:</strong> {result.care_summary.water_frequency}
                    </div>
                    <div>
                      <strong>Sunlight:</strong> {result.care_summary.sunlight}
                    </div>
                    <div>
                      <strong>Soil:</strong> {result.care_summary.soil_type}
                    </div>
                    <div>
                      <strong>Difficulty:</strong> {result.care_summary.difficulty}
                    </div>
                  </div>
                </div>

                {result.traditional_use && (
                  <div className="darshan-page__result-section">
                    <h3>Traditional Use</h3>
                    <p>{result.traditional_use}</p>
                  </div>
                )}

                <div className="darshan-page__result-section">
                  <h3>Fun Fact</h3>
                  <p>{result.fun_fact}</p>
                </div>

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
