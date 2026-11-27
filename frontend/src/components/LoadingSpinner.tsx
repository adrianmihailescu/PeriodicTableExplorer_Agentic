interface LoadingSpinnerProps {
  label: string;
  size?: "inline" | "large";
}

export default function LoadingSpinner({ label, size = "inline" }: LoadingSpinnerProps) {
  return (
    <div className={`loading-state loading-state--${size}`} role="status">
      <span className="loading-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
