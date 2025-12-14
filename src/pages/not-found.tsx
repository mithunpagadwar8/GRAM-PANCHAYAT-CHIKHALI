import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <AlertCircle size={20} />
        <span>Page Not Found</span>
      </div>
    </div>
  );
}
