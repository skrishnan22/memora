import { FileText, Eye, CircleCheck, Flame, Settings } from 'lucide-react';
import { StatCard } from './StatCard';
import { ProgressBar } from './ProgressBar';
import { VocabCard } from './VocabCard';
import { ActionButtons } from './ActionButtons';

export const ReviewApp = () => {
  const handleReviewAgain = () => {
    console.log('Review again clicked');
  };

  const handleGotIt = () => {
    console.log('Got it clicked');
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center px-4 py-10">
      {/* Main Content */}
      <div className="relative w-full max-w-6xl flex-1 flex flex-col gap-6 px-4 sm:px-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-6 w-full">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Vocab Trainer</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-medium">Session 1</span>
              <button className="text-gray-600 hover:text-gray-800 transition-colors">
                <Settings size={24} />
              </button>
              <img 
                src="https://i.pravatar.cc/150?img=5" 
                alt="User avatar"
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-6xl mx-auto mb-6 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<FileText size={20} />}
              value={50}
              label="Total Words"
              iconColor="bg-orange-100 text-orange-500"
            />
            <StatCard
              icon={<Eye size={20} />}
              value={30}
              label="Reviewed"
              iconColor="bg-cyan-100 text-cyan-500"
            />
            <StatCard
              icon={<CircleCheck size={20} />}
              value={25}
              label="Mastered"
              iconColor="bg-emerald-100 text-emerald-500"
            />
            <StatCard
              icon={<Flame size={20} />}
              value={7}
              label="Day Streak"
              iconColor="bg-orange-100 text-orange-500"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-6xl mx-auto mb-6 flex justify-center w-full">
          <ProgressBar current={3} total={10} />
        </div>

        {/* Vocab Card */}
        <div className="max-w-6xl mx-auto flex justify-center items-center mb-4 w-full flex-1">
          <VocabCard
            word="Ephemeral"
            meaning="Lasting for a very short time; transitory"
            category="Adjective"
          />
        </div>

        {/* Action Buttons */}
        <div className="max-w-6xl mx-auto flex justify-center w-full mb-4">
          <ActionButtons
            onReviewAgain={handleReviewAgain}
            onGotIt={handleGotIt}
          />
        </div>
      </div>
    </div>
  );
};
