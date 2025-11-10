import { RotateCcw, CircleCheck } from 'lucide-react';

interface ActionButtonsProps {
  onReviewAgain: () => void;
  onGotIt: () => void;
}

export const ActionButtons = ({ onReviewAgain, onGotIt }: ActionButtonsProps) => {
  return (
    <div className="flex gap-4">
      <button
        onClick={onReviewAgain}
        className="flex items-center gap-2 px-8 py-3.5 bg-white border-2 border-red-300 text-red-500 rounded-2xl font-semibold hover:bg-red-50 transition-colors shadow-sm"
      >
        <RotateCcw size={20} />
        Review Again
      </button>
      <button
        onClick={onGotIt}
        className="flex items-center gap-2 px-8 py-3.5 bg-emerald-500 text-white rounded-2xl font-semibold hover:bg-emerald-600 transition-colors shadow-sm"
      >
        <CircleCheck size={20} />
        Got it!
      </button>
    </div>
  );
};