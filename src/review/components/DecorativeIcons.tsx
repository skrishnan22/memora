import { Calendar, Lightbulb, BookOpen, Pen, Lock, Sparkle } from 'lucide-react';

export const DecorativeIcons = () => {
  return (
    <>
      {/* Top Left - Calendar */}
      <div className="absolute top-8 left-8 text-orange-300 opacity-60">
        <Calendar size={48} strokeWidth={1.5} />
      </div>

      {/* Top Right - Lightbulb */}
      <div className="absolute top-24 right-16 text-yellow-300 opacity-60">
        <Lightbulb size={56} strokeWidth={1.5} />
      </div>

      {/* Left Side - Book */}
      <div className="absolute top-1/2 left-12 -translate-y-1/2 text-teal-300 opacity-60">
        <BookOpen size={64} strokeWidth={1.5} />
      </div>

      {/* Bottom Left - Pen */}
      <div className="absolute bottom-24 left-32 text-cyan-300 opacity-60">
        <Pen size={52} strokeWidth={1.5} />
      </div>

      {/* Bottom Right - Lock */}
      <div className="absolute bottom-16 right-24 text-orange-300 opacity-60">
        <Lock size={60} strokeWidth={1.5} />
      </div>

      {/* Right Side - Star */}
      <div className="absolute top-1/3 right-20 text-yellow-400 opacity-70">
        <Sparkle size={72} strokeWidth={1.5} fill="currentColor" />
      </div>
    </>
  );
};