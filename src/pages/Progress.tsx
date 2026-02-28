import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Progress() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/habits", { replace: true });
  }, [navigate]);
  return null;
}
