import { cn } from '@/lib/utils';

interface LifeHubLogoProps {
  className?: string;
}

export function LifeHubLogo({ className }: LifeHubLogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('text-primary', className)}
    >
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="10"
        className="fill-primary"
      />
      <path
        d="M24 12C17.373 12 12 17.373 12 24C12 30.627 17.373 36 24 36C30.627 36 36 30.627 36 24C36 17.373 30.627 12 24 12ZM24 14C29.523 14 34 18.477 34 24C34 29.523 29.523 34 24 34C18.477 34 14 29.523 14 24C14 18.477 18.477 14 24 14Z"
        className="fill-primary-foreground"
      />
      <circle cx="24" cy="24" r="4" className="fill-primary-foreground" />
      <path
        d="M24 16V20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-primary-foreground"
      />
      <path
        d="M24 28V32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-primary-foreground"
      />
      <path
        d="M16 24H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-primary-foreground"
      />
      <path
        d="M28 24H32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-primary-foreground"
      />
    </svg>
  );
}
