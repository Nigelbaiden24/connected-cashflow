import { Navigate } from "react-router-dom";

// FlowPulse Finance is temporarily hidden from view. The Finance login portal
// now forwards to the Investor login. The original implementation is preserved
// in git history and can be restored by reverting this file.
interface LoginProps {
  onLogin?: (email: string) => void;
}

export default function Login(_props: LoginProps) {
  return <Navigate to="/login-investor" replace />;
}
