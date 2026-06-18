import { useNavigate } from "react-router-dom";

export default function Logo() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/")}
      className="cursor-pointer text-gray-900 dark:text-white"
    >
     <svg
  width="250"
  height="70"
  viewBox="0 0 500 140"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
        <defs>
          <linearGradient id="jbzGradient" x1="0" y1="0" x2="500" y2="140">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>

        <circle
          cx="70"
          cy="70"
          r="40"
          fill="url(#jbzGradient)"
          opacity="0.12"
        />

        <path
          d="M55 85V45H75V75C75 95 62 105 42 105"
          stroke="url(#jbzGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M82 58L98 42M98 42H86M98 42V54"
          stroke="#06B6D4"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text
          x="140"
          y="88"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="56"
          fontWeight="700"
          fill="currentColor"
        >
          JोBz
        </text>

        <text
          x="144"
          y="115"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="16"
          fontWeight="500"
          fill="currentColor"
          opacity="0.7"
        >
          Track • Apply • Grow
        </text>
      </svg>
    </div>
  );
}