export default function CopyBtn({ onClick, copied, label }) {
  return (
    <button 
      onClick={onClick}
      className={`text-[10px] font-bold transition-colors ${
        copied 
          ? 'text-green-600' 
          : 'text-blue-600 hover:text-blue-700'
      }`}
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}
