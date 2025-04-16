import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [progress, setProgress] = useState(0);
  const [catchphrase, setCatchphrase] = useState("Verifying payment and preparing your document...");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const catchphrases = [
    "Turning legal jargon into plain English...",
    "Objection overruled! Your document is being prepared...",
    "Briefing the AI judge on your requirements...",
    "Citing precedents and adding legal pizzazz...",
    "Examining the fine print so you don't have to...",
    "Translating legalese into something actually readable...",
    "Preparing to make opposing counsel jealous...",
    "Dotting the i's, crossing the t's, and adding some legal flair...",
    "Summoning the ghost of legal documents past...",
    "Arguing with the AI about comma placement...",
    "Deliberating on the perfect legal tone...",
    "Calling expert witnesses to verify your document...",
    "Striking hearsay from the record...",
    "Preparing closing arguments for your document...",
    "Instructing the jury of AI models on your case..."
  ];

  const legalEmojis = [
    "⚖️", "📜", "📝", "🧑‍⚖️", "👨‍💼", "🔍", "📋", "🗂️", "📊", "🏛️", "🤝", "📁", "🗄️", "📔", "🖋️"
  ];

  useEffect(() => {
    const startTime = Date.now();
    const totalTime = 120000; // 2 minutes in milliseconds
    
    // Update progress bar and catchphrase
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(95, (elapsed / totalTime) * 100);
      setProgress(newProgress);
      
      // Update catchphrase every 5 seconds
      if (Math.floor(elapsed / 1000) % 5 === 0) {
        const randomIndex = Math.floor(Math.random() * catchphrases.length);
        setCatchphrase(`"${catchphrases[randomIndex]}"`);
        
        const emojiIndex = Math.floor(Math.random() * legalEmojis.length);
        // You could update an emoji state here if you want to display it
      }
    }, 1000);

    // Check payment status
    const checkPaymentStatus = async (retryCount = 0, maxRetries = 3) => {
      try {
        const response = await fetch(`/payment-success?session_id=${sessionId}`);
        
        if (!response.ok) {
          if (response.status === 503 && retryCount < maxRetries) {
            const delay = (retryCount + 1) * 2000;
            setCatchphrase(`"Server is busy, retrying in ${delay / 1000} seconds..."`);
            
            setTimeout(() => {
              checkPaymentStatus(retryCount + 1, maxRetries);
            }, delay);
            return;
          }
          
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          clearInterval(interval);
          setProgress(100);
          setSuccess(true);
          setDownloadUrl(data.download_url);
          
          // Auto-download the file
          const link = document.createElement('a');
          link.href = data.download_url;
          link.download = data.download_url.split('/').pop();
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (data.status === 'processing') {
          setCatchphrase(`"${data.message || 'Your document is still being generated. Please wait a moment...'}"`);
          setProgress(75);
          
          setTimeout(() => {
            checkPaymentStatus();
          }, 5000);
        } else {
          throw new Error(data.error || 'Failed to generate document');
        }
      } catch (err) {
        clearInterval(interval);
        setProgress(100);
        setError(err.message || 'An error occurred while processing your payment.');
      }
    };

    checkPaymentStatus();

    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="container">
      <a href="/" className="logo">Instant<span>Legal</span>AI</a>
      
      <div className="loading-icon">⚖️</div>
      <h1>Processing Your Payment</h1>
      
      <div className="loading-progress">
        <div className="loading-progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="loading-catchphrase">
        {catchphrase}
      </div>
      
      <p className="loading-time">This may take up to 2 minutes. Thank you for your patience!</p>
      
      {success && (
        <div className="success-message">
          Your document has been generated successfully! <a href={downloadUrl} id="download-link">Click here to download</a>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <a href="/" className="btn" style={{ display: success || error ? 'inline-block' : 'none' }}>Return to Home</a>
    </div>
  );
};

export default PaymentReturn;