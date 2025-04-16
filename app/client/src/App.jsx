import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DocumentForm from './components/DocumentForm';
import PaymentReturn from './components/PaymentReturn';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/payment-return" element={<PaymentReturn />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">Instant<span>Legal</span>AI</Link>
          <a href="mailto:support@instantlegal.ai?subject=Refund%20Request&body=Please%20provide%20your%20order%20details%20and%20reason%20for%20refund%3A%0A%0AOrder%20ID%3A%0ADocument%20Type%3A%0AReason%3A" style={{ textDecoration: 'none' }}>
            <div className="guarantee-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              100% Money-Back Guarantee
            </div>
          </a>
        </div>
      </div>
    </header>
  );
}

function Home() {
  return (
    <div className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>AI-Generated Legal Documents<br />Tailored to Your Business</h1>
            <p className="subtitle">
              Our AI technology creates custom legal documents instantly. No lawyers, no waiting, no excessive fees. Get exactly what you need in minutes, not weeks.
              <a href="https://instantaiconsultantcy.onrender.com/" target="_blank" rel="noopener noreferrer">Try Instant Business Consultancy AI</a> for fast, AI-generated business consultancy documents tailored to your business needs!
            </p>
            
            <div className="features">
              {[
                "AI-Powered Customization for Your Specific Business",
                "Instant Download - Ready in 2 Minutes",
                "Save $500+ Compared to Traditional Legal Services",
                "State-Specific Legal Compliance Built In"
              ].map((feature, index) => (
                <div key={index} className="feature">
                  <div className="feature-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>{feature}</div>
                </div>
              ))}
            </div>
          </div>
          
          <DocumentForm />
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div>
            <Link to="/" className="footer-logo">Instant<span>Legal</span>AI</Link>
            <p className="footer-description">AI-powered legal documents for modern businesses. Save time, reduce costs, and get the legal protection you need.</p>
          </div>
          
          {[
            {
              title: "Documents",
              links: ["Non-Disclosure Agreement", "Terms of Service", "Privacy Policy", "Freelance Contract", "Employment Agreement"]
            },
            {
              title: "Company",
              links: ["About Us", "How It Works", "Testimonials", "Contact"]
            },
            {
              title: "Legal",
              links: ["Terms of Service", "Privacy Policy", "Cookie Policy", "Disclaimer"]
            }
          ].map((section, index) => (
            <div key={index}>
              <h3 className="footer-title">{section.title}</h3>
              <ul className="footer-links">
                {section.links.map((link, i) => (
                  <li key={i}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="trust-features">
          {[
            { icon: "✓", text: "Secure Payment" },
            { icon: "🔒", text: "Privacy Protected" },
            { icon: "⏰", text: "24/7 Support" }
          ].map((feature, index) => (
            <div key={index} className="feature-box">
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-text">{feature.text}</div>
            </div>
          ))}
        </div>
        
        <div className="copyright">
          © {new Date().getFullYear()} InstantLegal AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default App;