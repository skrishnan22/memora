import {
  CheckCircle2,
  HelpCircle,
  LucideIcon,
  Sparkles,
  XCircle,
} from "lucide-react";

export type ReviewResponse = "slipped" | "patchy" | "onPoint" | "sharp";

interface ActionButtonsProps {
  onSelectResponse: (response: ReviewResponse) => void;
  disabled?: boolean;
}

const responseOptions: Array<{
  id: ReviewResponse;
  label: string;
  description: string;
  icon: LucideIcon;
  className: string;
}> = [
  {
    id: "slipped",
    label: "Slipped",
    description: "Didn't recall",
    icon: XCircle,
    className:
      "bg-rose-50 border border-rose-100 text-rose-600 hover:border-rose-200",
  },
  {
    id: "patchy",
    label: "Patchy",
    description: "Barely remembered",
    icon: HelpCircle,
    className:
      "bg-amber-50 border border-amber-100 text-amber-600 hover:border-amber-200",
  },
  {
    id: "onPoint",
    label: "On Point",
    description: "Recalled fine",
    icon: CheckCircle2,
    className:
      "bg-indigo-50 border border-indigo-100 text-indigo-600 hover:border-indigo-200",
  },
  {
    id: "sharp",
    label: "Sharp",
    description: "Instant recall",
    icon: Sparkles,
    className:
      "bg-emerald-50 border border-emerald-100 text-emerald-600 hover:border-emerald-200",
  },
];

export const ActionButtons = ({
  onSelectResponse,
  disabled = false,
}: ActionButtonsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-4xl">
      {responseOptions.map(
        ({ id, label, description, icon: Icon, className }) => (
          <button
            key={id}
            onClick={() => onSelectResponse(id)}
            disabled={disabled}
            className={[
              "flex flex-col items-start gap-1 rounded-2xl px-5 py-4 text-left transition-all duration-300 shadow-sm hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none",
              className,
            ].join(" ")}
          >
            <div className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <Icon size={18} className="shrink-0" />
              {label}
            </div>
            <p className="text-xs text-slate-500">{description}</p>
          </button>
        )
      )}
    </div>
  );
};
