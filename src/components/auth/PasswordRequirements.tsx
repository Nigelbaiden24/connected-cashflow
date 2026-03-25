import { Check, X } from "lucide-react";
import { getPasswordRequirements, calculatePasswordStrength, getPasswordStrengthLabel } from "@/utils/passwordValidation";

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const requirements = getPasswordRequirements(password);
  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength
                ? strength <= 2
                  ? "bg-destructive"
                  : strength <= 3
                  ? "bg-orange-500"
                  : "bg-green-500"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{getPasswordStrengthLabel(strength)}</p>
      <ul className="space-y-1">
        {requirements.map((req, i) => (
          <li key={i} className="flex items-center gap-1.5 text-xs">
            {req.met ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground" />
            )}
            <span className={req.met ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
