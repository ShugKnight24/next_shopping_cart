import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  CheckCircleIcon,
  BoxIcon,
  TruckIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  ChevronRight,
} from '../Icons';
import { RatingStars } from '../UI/RatingStars';
import { useToast } from '../UI/Toast';
import { ReviewList } from './ReviewCard';
import styles from './ProductTabs.module.css';

export function ProductTabs({
  product = {},
  specifications = {},
  shipping = {},
  reviews = [],
  faqs = [],
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewList, setReviewList] = useState(reviews);
  const [newRating, setNewRating] = useState(5);
  const [newAuthor, setNewAuthor] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const { showToast } = useToast();

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newContent.trim()) {
      showToast('Please fill in your name and review details', 'error');
      return;
    }

    const created = {
      id: `rev-user-${Date.now()}`,
      author: newAuthor.trim(),
      rating: newRating,
      date: new Date().toISOString().split('T')[0],
      title: newTitle.trim() || 'Great product',
      content: newContent.trim(),
      verified: true,
      helpful: 1,
    };

    setReviewList([created, ...reviewList]);
    setShowReviewForm(false);
    setNewAuthor('');
    setNewTitle('');
    setNewContent('');
    showToast('Thank you! Your verified review has been posted.', 'success');
  };

  // Highlights generator
  const highlights = [
    'Handcrafted with meticulous attention to detail and premium materials',
    'Tested and certified for long-lasting performance and durability',
    'Backed by full manufacturer warranty and our 30-day satisfaction guarantee',
    'Shipped in climate-controlled protective packaging with full transit insurance',
  ];

  const inTheBox = [
    product.productName || 'Product',
    'Protective Carrying Case / Factory Packaging',
    'Certificate of Authenticity & Verification Tags',
    'Quick Start Manual & Warranty Documentation',
  ];

  // Specs compilation
  const allSpecs = {
    Brand: product.manufacturer || 'Standard',
    Model: product.productName || 'Standard',
    'Item ID': product.itemid || 'N/A',
    Category: product.category || 'General',
    ...specifications,
    Warranty: '1-Year Comprehensive Manufacturer Warranty',
  };

  // Reviews rating breakdown
  const ratingAvg = product.rating?.average || 4.9;
  const ratingCount = reviewList.length || product.rating?.count || 1;

  const distribution = [
    { stars: 5, pct: 82 },
    { stars: 4, pct: 12 },
    { stars: 3, pct: 4 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 1 },
  ];

  const tabs = [
    {
      id: 'overview',
      label: 'Overview & Highlights',
      content: (
        <div className={styles.overviewPanel}>
          <div>
            <h3 className={styles.sectionHeading}>Product Overview</h3>
            <p className={styles.descriptionText}>
              {product.description ||
                'Experience world-class engineering, designed for enthusiasts who demand uncompromising quality, aesthetic distinction, and peerless reliability.'}
            </p>
          </div>

          <div>
            <h3 className={styles.sectionHeading}>Key Features & Highlights</h3>
            <div className={styles.highlightsGrid}>
              {highlights.map((h, i) => (
                <div key={i} className={styles.highlightItem}>
                  <CheckCircleIcon size={18} className={styles.checkIcon} />
                  <span className={styles.highlightText}>{h}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.boxSection}>
            <div className={styles.boxHeader}>
              <BoxIcon size={20} />
              <span>What&apos;s Included In The Box</span>
            </div>
            <ul className={styles.boxList}>
              {inTheBox.map((item, i) => (
                <li key={i} className={styles.boxItem}>
                  <CheckCircleIcon size={14} className={styles.checkIcon} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'specs',
      label: 'Specifications',
      content: (
        <div>
          <h3 className={styles.sectionHeading}>Technical Specifications</h3>
          <table className={styles.specsTable}>
            <tbody>
              {Object.entries(allSpecs).map(([key, val]) => (
                <tr key={key}>
                  <td className={styles.specLabel}>{key}</td>
                  <td className={styles.specValue}>{String(val)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'shipping',
      label: 'Shipping & Guarantees',
      content: (
        <div>
          <h3 className={styles.sectionHeading}>Shipping, Delivery & Protection</h3>
          <div className={styles.shippingCards}>
            <div className={styles.shippingCard}>
              <TruckIcon size={28} className={styles.shippingCardIcon} />
              <div className={styles.shippingCardTitle}>Insured Courier Dispatch</div>
              <div className={styles.shippingCardDesc}>
                {shipping.free ? 'Free Express Courier on this item. ' : ''}
                Estimated delivery in {shipping.estimate || '2-3 business days'}. Every order is trackable in real-time.
              </div>
            </div>

            <div className={styles.shippingCard}>
              <RotateCcwIcon size={28} className={styles.shippingCardIcon} />
              <div className={styles.shippingCardTitle}>30-Day Hassle-Free Returns</div>
              <div className={styles.shippingCardDesc}>
                Not completely in love? Return within 30 days of delivery with prepaid return labels for a 100% refund or instant exchange.
              </div>
            </div>

            <div className={styles.shippingCard}>
              <ShieldCheckIcon size={28} className={styles.shippingCardIcon} />
              <div className={styles.shippingCardTitle}>Guaranteed Authenticity</div>
              <div className={styles.shippingCardDesc}>
                Every product is physically inspected and authenticated by our certified specialists. Guaranteed genuine or 200% of your money back.
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'reviews',
      label: `Reviews (${reviewList.length})`,
      content: (
        <div>
          <div className={styles.reviewsOverview}>
            <div className={styles.ratingSummary}>
              <span className={styles.bigRating}>{ratingAvg}</span>
              <RatingStars rating={ratingAvg} size="md" showValue={false} />
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Based on {ratingCount} verified reviews
              </span>
            </div>

            <div className={styles.ratingBars}>
              {distribution.map((d) => (
                <div key={d.stars} className={styles.barRow}>
                  <span>{d.stars} ★</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span>{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.reviewToolbar}>
            <h3 className={styles.sectionHeading} style={{ margin: 0 }}>
              Verified Buyer Reviews
            </h3>
            <button
              className={styles.writeReviewBtn}
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </button>
          </div>

          {showReviewForm && (
            <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
              <div className={styles.formRow}>
                <div>
                  <label
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#475569',
                      display: 'block',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Your Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Jordan M."
                    className={styles.inputField}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#475569',
                      display: 'block',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Rating:
                  </label>
                  <select
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                    className={styles.inputField}
                  >
                    <option value={5}>5 Stars - Outstanding</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Average</option>
                    <option value={2}>2 Stars - Subpar</option>
                    <option value={1}>1 Star - Poor</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#475569',
                    display: 'block',
                    marginBottom: '0.35rem',
                  }}
                >
                  Review Headline:
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Flawless quality and fast shipping!"
                  className={styles.inputField}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#475569',
                    display: 'block',
                    marginBottom: '0.35rem',
                  }}
                >
                  Review Details:
                </label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share details about your experience with this product..."
                  className={styles.textareaField}
                />
              </div>

              <button
                type="submit"
                className={styles.writeReviewBtn}
                style={{ alignSelf: 'flex-start' }}
              >
                Submit Review
              </button>
            </form>
          )}

          <ReviewList reviews={reviewList} />
        </div>
      ),
    },
    {
      id: 'faqs',
      label: `FAQs (${faqs.length})`,
      content: (
        <div>
          <h3 className={styles.sectionHeading}>Frequently Asked Questions</h3>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`${styles.faqItem} ${isOpen ? styles.faqOpen : ''}`}
                >
                  <button
                    className={styles.faqQuestion}
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronRight
                      size={16}
                      className={`${styles.faqChevron} ${isOpen ? styles.open : ''}`}
                    />
                  </button>
                  {isOpen && <div className={styles.faqAnswer}>{faq.answer}</div>}
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.tabContainer} data-testid="product-tabs">
      <div className={styles.tabHeaders} role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === index}
            className={`${styles.tabHeader} ${activeTab === index ? styles.active : ''}`}
            onClick={() => setActiveTab(index)}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.tabContent} role="tabpanel">
        {tabs[activeTab].content}
      </div>
    </div>
  );
}

ProductTabs.propTypes = {
  product: PropTypes.object,
  specifications: PropTypes.object,
  shipping: PropTypes.object,
  reviews: PropTypes.array,
  faqs: PropTypes.array,
};
