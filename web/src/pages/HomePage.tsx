/**
 * Home Page - Main Dashboard
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Strings } from "../constants/strings";
import Button from "../components/Button";
import Card from "../components/Card";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = React.useState(false);

  const features = [
    {
      id: "darshan",
      name: Strings.features.darshan.name,
      sanskrit: Strings.features.darshan.sanskrit,
      description: Strings.features.darshan.description,
      path: "/darshan",
      primary: true,
    },
    {
      id: "vana",
      name: Strings.features.vana.name,
      sanskrit: Strings.features.vana.sanskrit,
      description: Strings.features.vana.description,
      path: "/mera-vana",
      primary: false,
    },
  ];

  return (
    <div className="home-page">
      <header className="home-page__header">
        <div className="home-page__menu-container">
          <button
            className="home-page__menu-button"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Options menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="5" r="2" fill="currentColor" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <circle cx="12" cy="19" r="2" fill="currentColor" />
            </svg>
          </button>
          {showMenu && (
            <div className="home-page__dropdown">
              <button
                className="home-page__dropdown-item"
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M16 17l5-5-5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M21 12H9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                {Strings.auth.logout}
              </button>
            </div>
          )}
        </div>
        <div className="home-page__header-content">
          <div className="home-page__header-left">
            <img
              src="/logo192.png"
              alt="VrikshAI Logo"
              className="home-page__logo"
            />
            <div>
              <h1 className="home-page__app-name">{Strings.app.name}</h1>
              <p className="home-page__tagline">{Strings.app.tagline}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="home-page__main">
        <div className="home-page__container">
          <div className="home-page__welcome">
            <h2 className="home-page__greeting">
              Namaste, {user?.name || "Friend"}!
            </h2>
            <p className="home-page__subtitle">
              How can I help your plants thrive today?
            </p>
          </div>

          <div className="home-page__features">
            {features.map((feature) => (
              <div key={feature.id} className="home-page__feature">
                <button
                  className={`home-page__feature-button home-page__feature-button--${feature.id}`}
                  onClick={() => navigate(feature.path)}
                >
                  <div className="home-page__feature-button-content">
                    <span className="home-page__feature-sanskrit">
                      {feature.sanskrit}
                    </span>
                    <h3 className="home-page__feature-name">{feature.name}</h3>
                    <p className="home-page__feature-description">
                      {feature.description}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>

          <div className="home-page__info">
            <div className="home-page__info-card">
              <h3 className="home-page__info-title">About VrikshAI</h3>
              <p className="home-page__info-text">
                VrikshAI (वृक्षAI) combines ancient Ayurvedic plant wisdom with
                modern AI technology. Identify plants, diagnose health issues,
                and receive personalized care schedules - All Powered By AI.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
