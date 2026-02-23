// Global styles component — premium edition v2
export const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');

    .font-bebas { font-family: 'Bebas Neue', sans-serif; }
    .font-inter { font-family: 'Inter', sans-serif; }
    .font-mono-tech { font-family: 'JetBrains Mono', monospace; }

    .glass-panel {
      background: rgba(10, 10, 10, 0.85);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
      position: relative;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }

    .glass-panel:hover {
      border-color: rgba(255, 255, 255, 0.1);
    }

    /* Gradient border on glass panels */
    .glass-panel::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(
        135deg,
        rgba(255,255,255,0.08) 0%,
        rgba(255,255,255,0.02) 40%,
        rgba(52,211,153,0.06) 100%
      );
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: rgba(52, 211, 153, 0.3) !important;
      box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.1), 0 0 20px -5px rgba(52, 211, 153, 0.1);
    }

    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar { width: 3px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.15);
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.3);
    }

    /* Interactive element hover */
    button, a, [role="button"] {
      transition: all 0.2s ease;
    }
    
    /* Select option styling for dark theme */
    select option {
      background: #0a0a0a;
      color: white;
    }
  `}</style>
);
