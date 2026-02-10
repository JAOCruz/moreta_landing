// Section header component
export const SectionHeader = ({ number, title }) => (
  <div className="flex justify-between items-end mb-6 border-b border-neutral-800 pb-2">
    <h2 className="font-bebas text-3xl tracking-wide text-white">{title}</h2>
    <span className="font-mono-tech text-xs text-neutral-600 tracking-widest">[ {number} ]</span>
  </div>
);
