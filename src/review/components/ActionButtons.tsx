import { RotateCcw, CircleCheck } from 'lucide-react';

interface ActionButtonsProps {
  onReviewAgain: () => void;
  onGotIt: () => void;
}

export const ActionButtons = ({ onReviewAgain, onGotIt }: ActionButtonsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={onReviewAgain}
        className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold tracking-tight text-sky-600 border border-sky-100 bg-white/85 shadow-sm hover:-translate-y-0.5 hover:bg-white transition-all duration-300"
      >
        <RotateCcw size={20} />
        Review Again
      </button>
      <button
        onClick={onGotIt}
        className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold tracking-tight text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-0.5"
      >
        <CircleCheck size={20} />
        Got it!
      </button>
    </div>
  );
};
