import { useState } from "react";
import Button from "./../Button";
import JobNotesTab from "./modal-components/JobNotesTab";
import JobBasicTab from "./modal-components/JobBasicTab";
import JobDetailsTab from "./modal-components/JobDetailsTab";

import {
  FileText,
  Settings,
  StickyNote,
} from "lucide-react";
import { JOB_STATUSES, STATUS_ACTIVE, STATUS_INACTIVE } from "../../lib/constants";


const TABS = [
  {
    key: "basic",
    label: "Basic",
    icon: FileText,
  },
  {
    key: "details",
    label: "Details",
    icon: Settings,
  },
  {
    key: "notes",
    label: "Notes",
    icon: StickyNote,
  },
  // A "Schedule" tab lived here, but it wrote interview dates/times that had
  // nowhere to go. Interview scheduling belongs to the interviews table and
  // is handled by the Interviews module instead.
];
const STATUS_OPTIONS = JOB_STATUSES.map((key) => ({
  key,
  active: STATUS_ACTIVE[key],
}));

const INITIAL_FORM = {
  company: "",
  title: "",
  status: "Applied",
  application_date: "",
  recruiter_email: "",
  is_referral: false,
  referral_email: "",
  description: "",
  notes: "",
  url: "",
  location: "",
  work_type: "",
  salary: "",
  source: "",
  recruiter_name: "",
  priority: "Medium",
};

export default function JobAddModal({ onAdd, onClose }) {
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const tabIndex = TABS.findIndex((t) => t.key === tab);
  const isFirst = tabIndex === 0;
  const isLast = tabIndex === TABS.length - 1;

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }));
  };

  const validateBasic = () => {
    const next = {};
    if (!form.company.trim()) next.company = true;
    if (!form.title.trim()) next.title = true;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (tab === "basic" && !validateBasic()) return;
    setTab(TABS[tabIndex + 1].key);
  };

  const handleBack = () => setTab(TABS[tabIndex - 1].key);

  const handleSubmit = () => {
    if (!validateBasic()) {
      setTab("basic");
      return;
    }
    // No client-side id — Postgres assigns it. A "Saved" job hasn't been
    // applied to yet, so it deliberately gets no application date.
    onAdd({
      ...form,
      application_date:
        form.application_date ||
        (form.status === "Saved" ? "" : new Date().toISOString().slice(0, 10)),
    });
    onClose();
  };

  const fieldBase =
    "w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.04] border text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 transition-colors focus:outline-none focus:bg-white dark:focus:bg-white/[0.06]";

  const fieldCls = (key) =>
    fieldBase +
    (errors[key]
      ? " border-red-500/60 focus:border-red-400"
      : " border-gray-200 dark:border-white/[0.08] focus:border-violet-400 dark:focus:border-white/30");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[460px] bg-white dark:bg-[#13131c] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-6 shadow-2xl text-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[17px] font-medium tracking-tight">
              Add application
            </h2>
            <p className="text-[11px] text-gray-400 dark:text-white/25 mt-0.5">
              Step {tabIndex + 1} of {TABS.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/80 hover:border-gray-300 dark:hover:border-white/20 transition-colors text-lg leading-none flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-white/[0.07] pb-3 mb-5">
  {TABS.map(({ key, label, icon: Icon }, i) => (
    <button
      key={key}
      onClick={() => {
        if (i > tabIndex && tab === "basic" && !validateBasic()) return;
        setTab(key);
      }}
      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
        tab === key
          ? "bg-violet-600/20 text-violet-700 dark:text-violet-300"
          : i < tabIndex
          ? "text-gray-600 dark:text-white/50 hover:text-gray-800 dark:hover:text-white/70"
          : "text-gray-400 dark:text-white/25 hover:text-gray-600 dark:hover:text-white/40"
      }`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}

        <span>
          {i < tabIndex ? "✓ " : ""}
          {label}
        </span>
      </div>
    </button>
  ))}
</div>

          <div className="ml-auto flex items-center gap-1 pr-1">
            {TABS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i <= tabIndex
                    ? "w-5 bg-violet-500"
                    : "w-2 bg-gray-200 dark:bg-white/[0.1]"
                }`}
              />
            ))}
          </div>
        

        {/* Tab content */}
        {tab === "basic" && (
          <JobBasicTab
            form={form}
            set={set}
            fieldCls={fieldCls}
            errors={errors}
          />
        )}

       {tab === "details" && (
  <JobDetailsTab
    form={form}
    set={set}
    fieldCls={fieldCls}
    STATUS_OPTIONS={STATUS_OPTIONS}
    STATUS_INACTIVE={STATUS_INACTIVE}
  />
)}
        {tab === "notes" && (
          <JobNotesTab form={form} set={set} fieldCls={fieldCls} />
        )}

        <div className="flex gap-2 justify-between pt-5 mt-2 border-t border-gray-200 dark:border-white/[0.06]">
          <div>
            {!isFirst && (
              <Button variant="secondary" onClick={handleBack}>
                ← Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {isLast ? (
              <Button onClick={handleSubmit}>Add application</Button>
            ) : (
              <Button onClick={handleNext}>Next →</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
