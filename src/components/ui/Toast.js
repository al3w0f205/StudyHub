"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 10000, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

function ToastItem({ message, type, onClose, duration }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle size={18} color="var(--success-400)" />,
    error: <AlertCircle size={18} color="var(--danger-400)" />,
    warning: <AlertTriangle size={18} color="var(--warning-400)" />,
    info: <Info size={18} color="var(--primary-400)" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95, x: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      style={{
        minWidth: "280px",
        maxWidth: "400px",
        background: "var(--bg-secondary)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--border-default)",
        borderRadius: "12px",
        padding: "0.875rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ flexShrink: 0 }}>{icons[type]}</div>
      <div style={{ flex: 1, fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>{message}</div>
      <button 
        onClick={onClose}
        style={{ background: "none", border: "none", color: "var(--text-tertiary)", cursor: "pointer", padding: "4px", display: "flex" }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
