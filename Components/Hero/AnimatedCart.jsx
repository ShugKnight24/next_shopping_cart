// TODO: Convert into it's own module
import styles from './Hero.module.scss';

export function AnimatedCart({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Metal gradients for realistic cart */}
        <linearGradient id="metalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a8a8a8" />
          <stop offset="30%" stopColor="#d4d4d4" />
          <stop offset="50%" stopColor="#e8e8e8" />
          <stop offset="70%" stopColor="#c0c0c0" />
          <stop offset="100%" stopColor="#909090" />
        </linearGradient>
        <linearGradient id="metalDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#707070" />
          <stop offset="50%" stopColor="#909090" />
          <stop offset="100%" stopColor="#606060" />
        </linearGradient>
        <linearGradient id="handleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#505050" />
          <stop offset="50%" stopColor="#808080" />
          <stop offset="100%" stopColor="#505050" />
        </linearGradient>
        <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#404040" />
          <stop offset="50%" stopColor="#606060" />
          <stop offset="100%" stopColor="#303030" />
        </linearGradient>
        <linearGradient id="wheelCenter" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#909090" />
          <stop offset="100%" stopColor="#606060" />
        </linearGradient>
        <filter id="cartShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="3" dy="6" stdDeviation="8" floodOpacity="0.35" />
        </filter>
        <filter id="innerShadow">
          <feOffset dx="0" dy="2" />
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Cart Frame/Body - Wire basket style */}
      <g filter="url(#cartShadow)" className={styles.cartBody}>
        {/* Back panel of basket */}
        <path
          d="M50 35 L55 100 L185 100 L190 35 Z"
          fill="url(#metalGradient)"
          stroke="url(#metalDark)"
          strokeWidth="2"
        />

        {/* Wire mesh pattern on basket */}
        <g stroke="#a0a0a0" strokeWidth="0.75" opacity="0.6">
          {/* Horizontal wires */}
          <line x1="52" y1="50" x2="188" y2="50" />
          <line x1="53" y1="65" x2="187" y2="65" />
          <line x1="54" y1="80" x2="186" y2="80" />
          {/* Vertical wires */}
          <line x1="70" y1="37" x2="68" y2="98" />
          <line x1="95" y1="36" x2="93" y2="99" />
          <line x1="120" y1="35" x2="120" y2="100" />
          <line x1="145" y1="36" x2="147" y2="99" />
          <line x1="170" y1="37" x2="172" y2="98" />
        </g>

        {/* Top rim of basket */}
        <path
          d="M45 35 L195 35"
          stroke="url(#handleGradient)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Front lip of basket */}
        <path
          d="M55 100 L185 100"
          stroke="url(#metalDark)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Handle bar */}
        <path
          d="M35 35 L20 15"
          stroke="url(#handleGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Handle grip */}
        <path
          d="M20 15 L8 15"
          stroke="#404040"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M20 15 L8 15"
          stroke="#606060"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Cart frame/legs */}
        <path
          d="M55 100 L60 130"
          stroke="url(#metalDark)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M185 100 L180 130"
          stroke="url(#metalDark)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Cross support bar */}
        <path
          d="M60 120 L180 120"
          stroke="url(#metalDark)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* Items in cart - Start empty, items appear via CSS animation */}
      <g className={styles.cartItems}>
        {/* Item 1: Headphones - purple */}
        <g className={styles.cartItem1}>
          <ellipse cx="72" cy="72" rx="12" ry="8" fill="#8b5cf6" />
          <path
            d="M64 72 Q72 60 80 72"
            stroke="#a78bfa"
            strokeWidth="3"
            fill="none"
          />
        </g>
        {/* Item 2: Smartphone - blue */}
        <g className={styles.cartItem2}>
          <rect x="95" y="55" width="16" height="28" rx="2" fill="#3b82f6" />
          <rect x="98" y="58" width="10" height="18" rx="1" fill="#60a5fa" />
        </g>
        {/* Item 3: Watch - green */}
        <g className={styles.cartItem3}>
          <circle cx="130" cy="70" r="10" fill="#10b981" />
          <circle cx="130" cy="70" r="6" fill="#34d399" />
          <rect x="127" y="55" width="6" height="6" rx="1" fill="#10b981" />
        </g>
        {/* Item 4: Laptop - orange */}
        <g className={styles.cartItem4}>
          <rect x="148" y="62" width="24" height="15" rx="1" fill="#f59e0b" />
          <rect x="150" y="64" width="20" height="10" rx="0" fill="#fbbf24" />
          <rect x="145" y="77" width="30" height="3" rx="1" fill="#d97706" />
        </g>
      </g>

      {/* Wheels - Simple design that won't break during animation */}
      <g className={styles.wheels}>
        {/* Left wheel assembly */}
        <g className={styles.leftWheelAssembly}>
          {/* Wheel mount */}
          <rect
            x="55"
            y="128"
            width="16"
            height="8"
            rx="2"
            fill="url(#metalDark)"
          />
          {/* Wheel - simplified, no inline transform-origin */}
          <circle cx="63" cy="145" r="12" fill="url(#wheelGradient)" />
          <circle cx="63" cy="145" r="8" fill="#505050" />
          <circle cx="63" cy="145" r="4" fill="url(#wheelCenter)" />
        </g>

        {/* Right wheel assembly */}
        <g className={styles.rightWheelAssembly}>
          {/* Wheel mount */}
          <rect
            x="169"
            y="128"
            width="16"
            height="8"
            rx="2"
            fill="url(#metalDark)"
          />
          {/* Wheel - simplified */}
          <circle cx="177" cy="145" r="12" fill="url(#wheelGradient)" />
          <circle cx="177" cy="145" r="8" fill="#505050" />
          <circle cx="177" cy="145" r="4" fill="url(#wheelCenter)" />
        </g>
      </g>

      {/* Motion lines - appear when cart speeds up */}
      <g className={styles.motionLines}>
        <line
          x1="-10"
          y1="60"
          x2="20"
          y2="60"
          stroke="#b0b0b0"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0"
        />
        <line
          x1="-20"
          y1="80"
          x2="15"
          y2="80"
          stroke="#909090"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0"
        />
        <line
          x1="-15"
          y1="100"
          x2="25"
          y2="100"
          stroke="#b0b0b0"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0"
        />
        <line
          x1="-5"
          y1="120"
          x2="10"
          y2="120"
          stroke="#909090"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0"
        />
      </g>

      {/* Speed particles */}
      <g className={styles.speedParticles}>
        <circle cx="-5" cy="55" r="2" fill="#c0c0c0" opacity="0" />
        <circle cx="0" cy="75" r="1.5" fill="#a0a0a0" opacity="0" />
        <circle cx="-10" cy="95" r="2" fill="#c0c0c0" opacity="0" />
        <circle cx="5" cy="115" r="1.5" fill="#a0a0a0" opacity="0" />
      </g>

      {/* Ground/shadow */}
      <ellipse
        cx="120"
        cy="162"
        rx="70"
        ry="6"
        fill="rgba(0,0,0,0.15)"
        className={styles.groundShadow}
      />
    </svg>
  );
}
