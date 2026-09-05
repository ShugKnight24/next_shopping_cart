import { useEffect, useRef, useState } from 'react';
import styles from './HowItWorks.module.css';

const steps = [
  {
    id: 1,
    icon: 'browse',
    title: 'Browse & Discover',
    description:
      'Explore our curated collection of premium products with smart search and personalized recommendations.',
  },
  {
    id: 2,
    icon: 'cart',
    title: 'Add to Cart',
    description:
      'Seamlessly add items to your cart with one click. Save favorites and create wishlists for later.',
  },
  {
    id: 3,
    icon: 'checkout',
    title: 'Quick Checkout',
    description:
      'Secure, lightning-fast checkout with multiple payment options and saved preferences.',
  },
  {
    id: 4,
    icon: 'delivery',
    title: 'Fast Delivery',
    description:
      'Track your order in real-time with 24-hour delivery options and hassle-free returns.',
  },
];

function StepIcon({ type }) {
  const icons = {
    browse: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="3" />
        <path
          d="M30 30L42 42"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M14 20h12M20 14v12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    ),
    cart: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 8h6l4 24h20l4-16H16"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="40" r="4" fill="currentColor" />
        <circle cx="36" cy="40" r="4" fill="currentColor" />
        <path
          d="M20 16l4 4 8-8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
    ),
    checkout: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          x="6"
          y="10"
          width="36"
          height="28"
          rx="4"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path d="M6 18h36" stroke="currentColor" strokeWidth="3" />
        <path
          d="M12 28h8M12 34h12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <circle cx="36" cy="32" r="6" stroke="currentColor" strokeWidth="2" />
        <path
          d="M34 32l2 2 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    delivery: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 28h24V12H4v16z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M28 20h8l8 8v8H28V20z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="36" r="5" stroke="currentColor" strokeWidth="3" />
        <circle cx="38" cy="36" r="5" stroke="currentColor" strokeWidth="3" />
        <path
          d="M10 20l4 4 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
    ),
  };

  return <div className={styles.stepIcon}>{icons[type]}</div>;
}

// This is a simple implementation of the "How It Works" section with animated steps. In this case, this component is not really needed
// The idea for this component is to illustrate the different actions a user can take on the site in a visually appealing way.
export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section
      id="how-it-works"
      className={`${styles.howItWorks} ${isVisible ? styles.visible : ''}`}
      ref={sectionRef}
    >
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <span className={styles.badge}>Simple Process</span>
          <h2 className={styles.title}>
            How It <span className={styles.accent}>Works</span>
          </h2>
          <p className={styles.subtitle}>
            From browsing to delivery, we've made every step effortless
          </p>
        </div>

        {/* Steps Timeline */}
        <div className={styles.stepsContainer}>
          {/* Progress Line */}
          <div className={styles.progressLine}>
            <div
              className={styles.progressFill}
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Step Cards */}
          <div className={styles.steps}>
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`${styles.step} ${index === activeStep ? styles.active : ''} ${index < activeStep ? styles.completed : ''}`}
                onClick={() => setActiveStep(index)}
              >
                <div className={styles.stepNumber}>
                  {index < activeStep ? (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12l5 5L20 7"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <StepIcon type={step.icon} />
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          <button className={styles.ctaButton}>
            Start Shopping Now
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
