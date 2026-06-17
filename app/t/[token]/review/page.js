'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import { RESTAURANT_NAME } from '@/lib/constants';
import './review.css';

export default function ReviewPage({ params }) {
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const emojis = [
    { value: 'great', emoji: '😍', label: 'Loved it!' },
    { value: 'good', emoji: '😊', label: 'Good' },
    { value: 'okay', emoji: '😐', label: 'Okay' },
    { value: 'bad', emoji: '😟', label: 'Not great' },
  ];

  const handleSubmit = () => {
    setSubmitted(true);
    if (rating === 'great' || rating === 'good') {
      // Simulate redirect to Google Review
      setTimeout(() => {
        window.open('https://g.page/r/review', '_blank');
      }, 1500);
    }
  };

  if (submitted) {
    return (
      <div className="review-container">
        <div className="review-card submitted">
          <div className="submitted-icon">
            {rating === 'great' || rating === 'good' ? '🎉' : '🙏'}
          </div>
          <h2>
            {rating === 'great' || rating === 'good'
              ? 'Thank You!'
              : 'We Appreciate Your Feedback'}
          </h2>
          <p>
            {rating === 'great' || rating === 'good'
              ? 'We\'re glad you enjoyed your meal! Redirecting you to leave a Google Review...'
              : 'We\'re sorry about your experience. We\'ll work to improve!'}
          </p>
          {(rating === 'great' || rating === 'good') && (
            <a
              href="https://g.page/r/review"
              target="_blank"
              rel="noopener noreferrer"
              className="google-review-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Leave a Google Review
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="review-container">
      <div className="review-card">
        <div className="review-header">
          <h1>{RESTAURANT_NAME}</h1>
          <p className="review-subtitle">We value your feedback!</p>
        </div>

        <h2 className="review-question">How was your experience?</h2>

        <div className="emoji-grid">
          {emojis.map((item) => (
            <button
              key={item.value}
              className={`emoji-btn ${rating === item.value ? 'selected' : ''}`}
              onClick={() => setRating(item.value)}
            >
              <span className="emoji">{item.emoji}</span>
              <span className="emoji-label">{item.label}</span>
            </button>
          ))}
        </div>

        {rating && (rating === 'okay' || rating === 'bad') && (
          <div className="feedback-section">
            <textarea
              placeholder="Tell us how we can improve..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {rating && (
          <button className="submit-review-btn" onClick={handleSubmit}>
            Submit Feedback
          </button>
        )}
      </div>
    </div>
  );
}
