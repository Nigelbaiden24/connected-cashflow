import { Navigate } from "react-router-dom";

// FlowPulse Finance admin portal is temporarily hidden from view.
// Redirect to the unified admin login. Original implementation preserved in git history.
export default function AdminLoginFinance() {
  return <Navigate to="/admin/login" replace />;
}
