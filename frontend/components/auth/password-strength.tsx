import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) {
    return { score: 0, label: "", color: "" };
  }

  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const isLongEnough = password.length >= 8;
  const isVeryLong = password.length >= 12;

  // Count the requirements met
  const requirements = [
    hasLowercase,
    hasUppercase,
    hasNumber,
    hasSpecialChar,
    isLongEnough,
    isVeryLong,
  ].filter(Boolean).length;

  if (requirements <= 1) {
    return { score: 1, label: "Very weak", color: "bg-destructive" };
  } else if (requirements === 2) {
    return { score: 2, label: "Weak", color: "bg-destructive/80" };
  } else if (requirements === 3) {
    return { score: 3, label: "Medium", color: "bg-chart-4" };
  } else if (requirements === 4) {
    return { score: 4, label: "Strong", color: "bg-chart-2" };
  } else {
    return { score: 5, label: "Very strong", color: "bg-chart-3" };
  }
}

export function PasswordStrengthIndicator({
  password,
}: {
  password: string;
}) {
  const [strength, setStrength] = useState({
    score: 0,
    label: "",
    color: "",
  });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const newStrength = getPasswordStrength(password);
    setStrength(newStrength);
    
    if (password) {
      setAnimated(true);
    }
  }, [password]);

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2 space-y-1">
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
        {[1, 2, 3, 4, 5].map((segment) => (
          <div
            key={segment}
            className={cn(
              "h-full w-1/5 transition-all duration-300",
              segment <= strength.score ? strength.color : "bg-transparent",
              animated && "animate-pulse"
            )}
            onAnimationEnd={() => setAnimated(false)}
          />
        ))}
      </div>
      {strength.label && (
        <p
          className={cn(
            "text-xs",
            strength.score <= 2 
              ? "text-destructive" 
              : strength.score <= 3 
                ? "text-chart-4" 
                : "text-chart-2"
          )}
        >
          {strength.label} password
        </p>
      )}
    </div>
  );
}