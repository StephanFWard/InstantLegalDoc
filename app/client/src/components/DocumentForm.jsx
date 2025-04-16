import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DocumentForm = () => {
  const [formData, setFormData] = useState({
    document_type: '',
    business_name: '',
    business_type: '',
    state: '',
    industry: '',
    protection_level: '2',
    clause_confidentiality: false,
    clause_arbitration: false,
    clause_termination: false,
    clause_ip: false,
    additional_instructions: ''
  });

  const [hours, setHours] = useState('07');
  const [minutes, setMinutes] = useState('23');
  const [seconds, setSeconds] = useState('45');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const documentTypes = {
    "nda": "Non-Disclosure Agreement (NDA)",
    "terms": "Website Terms of Service",
    "privacy": "Privacy Policy",
    "contract": "Freelance Contract",
    "employee": "Employment Agreement",
    "partnership": "Partnership Agreement"
  };

  const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
    "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
    "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
    "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
    "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "District of Columbia"
  ];

  const industries = [
    "Technology/Software", "E-commerce/Retail", "Healthcare", "Financial Services", "Education",
    "Consulting", "Marketing/Advertising", "Manufacturing", "Construction", "Food Service",
    "Entertainment", "Other"
  ];

  useEffect(() => {
    // Countdown timer
    const now = new Date();
    const targetDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const countdown = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;
      
      if (diff <= 0) {
        clearInterval(countdown);
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setHours(hours.toString().padStart(2, '0'));
      setMinutes(minutes.toString().padStart(2, '0'));
      setSeconds(seconds.toString().padStart(2, '0'));
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const formDataObj = new FormData();
      for (const key in formData) {
        formDataObj.append(key, formData[key]);
      }
      formDataObj.append('hostUrl', window.location.origin + '/');

      const response = await fetch('/create-checkout-session', {
        method: 'POST',
        body: formDataObj
      });

      const data = await response.json();
      
      if (response.ok) {
        // Redirect to Stripe checkout
        const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
        stripe.redirectToCheckout({
          sessionId: data.sessionId
        });
      } else {
        setError(data.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('Failed to process your request. Please try again.');
    }
  };

  return (
    <div className="hero-form">
      <h2 className="form-title">Generate Your Custom Legal Document</h2>
      
      <div className="special-offer-timer">
        <div className="timer-label">24-HOUR SPECIAL PRICE ENDS IN:</div>
        <div className="timer-display">
          <div className="timer-unit">
            <div className="timer-value">{hours}</div>
            <div className="timer-label">HOURS</div>
          </div>
          <div className="timer-unit">
            <div className="timer-value">{minutes}</div>
            <div className="timer-label">MINS</div>
          </div>
          <div className="timer-unit">
            <div className="timer-value">{seconds}</div>
            <div className="timer-label">SECS</div>
          </div>
        </div>
      </div>
      
      <form id="document-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="document-type">Document Type</label>
          <select 
            id="document-type" 
            name="document_type" 
            value={formData.document_type}
            onChange={handleChange}
            required
          >
            <option value="">Select document type...</option>
            {Object.entries(documentTypes).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="business-name">Business Name</label>
            <input 
              type="text" 
              id="business-name" 
              name="business_name" 
              value={formData.business_name}
              onChange={handleChange}
              placeholder="Enter your business name" 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="business-type">Business Type</label>
            <select 
              id="business-type" 
              name="business_type" 
              value={formData.business_type}
              onChange={handleChange}
              required
            >
              <option value="">Select business type...</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="LLC">LLC</option>
              <option value="Corporation">Corporation</option>
              <option value="Partnership">Partnership</option>
              <option value="Non-Profit">Non-Profit</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="state">State/Jurisdiction</label>
          <select 
            id="state" 
            name="state" 
            value={formData.state}
            onChange={handleChange}
            required
          >
            <option value="">Select state...</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="industry">Industry</label>
          <select 
            id="industry" 
            name="industry" 
            value={formData.industry}
            onChange={handleChange}
            required
          >
            <option value="">Select industry...</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Document Protection Level</label>
          <input 
            type="range" 
            min="1" 
            max="3" 
            value={formData.protection_level}
            className="range-slider" 
            id="protection-level" 
            name="protection_level"
            onChange={handleChange}
          />
          <div className="slider-labels">
            <span>Standard</span>
            <span>Comprehensive</span>
            <span>Maximum</span>
          </div>
        </div>
        
        <div className="form-group">
          <label>Special Clauses (Optional)</label>
          <div className="checkbox-group">
            {[
              { id: "clause-confidentiality", name: "clause_confidentiality", label: "Enhanced Confidentiality" },
              { id: "clause-arbitration", name: "clause_arbitration", label: "Arbitration Provision" },
              { id: "clause-termination", name: "clause_termination", label: "Advanced Termination Options" },
              { id: "clause-ip", name: "clause_ip", label: "Intellectual Property Protection" }
            ].map((checkbox) => (
              <div key={checkbox.id} className="checkbox-item">
                <input 
                  type="checkbox" 
                  id={checkbox.id} 
                  name={checkbox.name}
                  checked={formData[checkbox.name]}
                  onChange={handleChange}
                />
                <label htmlFor={checkbox.id}>{checkbox.label}</label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="additional-instructions">Additional Instructions (Optional)</label>
          <textarea 
            id="additional-instructions" 
            name="additional_instructions" 
            rows="4" 
            value={formData.additional_instructions}
            onChange={handleChange}
            placeholder="Enter any specific requirements, details, or custom clauses you'd like to include in your document..."
          ></textarea>
        </div>
        
        <div className="pricing-section">
          <div className="price-display">
            <span className="price-amount">$19.99</span>
            <span className="price-period">per document</span>
          </div>
          <div className="price-original">Regular price: $49.99 - Save 60% today!</div>
          <div className="price-features">
            {[
              "Enhanced document customization",
              "PDF + Word formats",
              "1 free revision",
              "Special clauses included"
            ].map((feature, index) => (
              <div key={index} className="price-feature">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {feature}
              </div>
            ))}
          </div>
          <div className="limited-offer">Only 14 documents remaining at this price today!</div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="submit-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V16M12 16L8 12M12 16L16 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Generate Document Now
        </button>
      </form>
    </div>
  );
};

export default DocumentForm;