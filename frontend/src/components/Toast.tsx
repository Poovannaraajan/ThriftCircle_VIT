import { useEffect } from 'react';

type ToastProps = {
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
};

export const Toast = ({ message, type, onDismiss }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  const icon = type === "success" ? "✅" : "⚠️";

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg shadow-lg ${bgColor} px-4 py-3 text-white transition-all animate-slide-up`}>
      <span className="text-xl">{icon}</span>
      <p className="font-semibold">{message}</p>
      <button 
        onClick={onDismiss} 
        className="ml-4 opacity-70 hover:opacity-100 transition"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};
