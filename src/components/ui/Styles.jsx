// Global styles component
export const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');

    .font-bebas { font-family: 'Bebas Neue', sans-serif; }
    .font-inter { font-family: 'Inter', sans-serif; }
    .font-mono-tech { font-family: 'JetBrains Mono', monospace; }

    .glass-panel {
      background: rgba(10, 10, 10, 0.85);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
    }

    input:focus, select:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.2) !important;
    }

    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
  `}</style>
);
