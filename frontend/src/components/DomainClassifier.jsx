/**
 * DomainClassifier.jsx
 * React component for domain classification
 * 
 * Usage:
 * import DomainClassifier from './components/DomainClassifier';
 * 
 * <DomainClassifier onClassify={(domain, confidence) => console.log(domain)} />
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

/**
 * Domain Classification Component
 * 
 * Features:
 * - Single text classification
 * - Batch classification
 * - Real-time predictions
 * - Error handling
 * - Loading states
 */
const DomainClassifier = ({ onClassify, onError }) => {
  const [text, setText] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [topK, setTopK] = useState(1);
  const [modelInfo, setModelInfo] = useState(null);

  // Fetch model info on component mount
  useEffect(() => {
    fetchModelInfo();
  }, []);

  /**
   * Fetch model information
   */
  const fetchModelInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`);
      setModelInfo(response.data);
    } catch (err) {
      console.error('Failed to fetch model info:', err);
    }
  };

  /**
   * Classify single text
   */
  const classifySingleText = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      setError('Please enter text to classify');
      return;
    }

    setLoading(true);
    setError(null);
    setPredictions([]);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/classify`, {
        text: text,
        top_k: topK
      });

      setPredictions(response.data);

      // Callback with top prediction
      if (response.data.length > 0 && onClassify) {
        onClassify(response.data[0].domain, response.data[0].confidence);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to classify text';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Example classifications
   */
  const examples = [
    {
      text: 'The landlord hasn\'t returned my security deposit after I moved out',
      domain: 'tenant'
    },
    {
      text: 'My employer hasn\'t paid overtime compensation',
      domain: 'labor'
    },
    {
      text: 'I need to know my consumer privacy rights',
      domain: 'consumer'
    }
  ];

  /**
   * Load example
   */
  const loadExample = (exampleText) => {
    setText(exampleText);
  };

  /**
   * Get domain badge color
   */
  const getDomainColor = (domain) => {
    const colors = {
      tenant: '#ef4444',    // red
      labor: '#3b82f6',     // blue
      consumer: '#10b981'   // green
    };
    return colors[domain] || '#6b7280';
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Domain Classifier</h1>
        <p className="text-gray-600">
          Classify legal text into tenant, labor, or consumer domains
        </p>
      </div>

      {/* Model Info */}
      {modelInfo && (
        <div className="bg-blue-50 p-4 rounded mb-6 border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Model Status:</strong> {modelInfo.status} • 
            <strong> Device:</strong> {modelInfo.device} • 
            <strong> Domains:</strong> {modelInfo.domains.join(', ')}
          </p>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={classifySingleText} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text to Classify
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="4"
            placeholder="Enter text to classify..."
          />
        </div>

        {/* Top-K Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Predictions (Top-K)
          </label>
          <select
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">Top 1</option>
            <option value="2">Top 2</option>
            <option value="3">Top 3</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Classifying...' : 'Classify'}
        </button>
      </form>

      {/* Examples */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Quick Examples
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => loadExample(example.text)}
              className="text-left p-3 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 text-sm"
            >
              <div className="font-medium text-gray-900">{example.domain}</div>
              <div className="text-gray-600 truncate">{example.text}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {predictions.length > 0 && (
        <div className="bg-gray-50 p-6 rounded border border-gray-200">
          <h3 className="text-lg font-bold mb-4">Classification Results</h3>

          {predictions.map((pred, idx) => (
            <div key={idx} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: getDomainColor(pred.domain) }}
                  >
                    {pred.domain.toUpperCase()}
                  </span>
                  <span className="text-gray-600">
                    Confidence: <strong>{(pred.confidence * 100).toFixed(2)}%</strong>
                  </span>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${pred.confidence * 100}%`,
                    backgroundColor: getDomainColor(pred.domain)
                  }}
                />
              </div>
            </div>
          ))}

          {/* Callback Info */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            <strong>Next Step:</strong> Pass this domain to fact extraction module
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-6">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-2 text-gray-600">Classifying text...</p>
        </div>
      )}
    </div>
  );
};

export default DomainClassifier;
