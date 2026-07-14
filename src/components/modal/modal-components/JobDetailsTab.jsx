import Section from "./Section";
import Divider from "./Divider";
import { WORK_TYPES, PRIORITIES, JOB_SOURCES } from "../../../lib/constants";

export default function JobDetailsTab({
  form,
  set,
  fieldCls,
  STATUS_OPTIONS,
  STATUS_INACTIVE,
}) {
  return (
    <div className="space-y-4">
      <Section label="Status">
        <div className="grid grid-cols-4 gap-2">
          {STATUS_OPTIONS.map(({ key, active }) => (
            <button
              key={key}
              type="button"
              onClick={() => set("status", key)}
              className={
                "py-1.5 rounded-lg border text-[11px] font-medium transition-all " +
                (form.status === key ? active : STATUS_INACTIVE)
              }
            >
              {key}
            </button>
          ))}
        </div>
      </Section>
      <Divider />

      <Section label="Role details">
        <div className="grid grid-cols-2 gap-2.5">
          <input
            type="text"
            placeholder="Location"
            className={fieldCls()}
            value={form.location || ""}
            onChange={(e) => set("location", e.target.value)}
          />

          <select
            className={fieldCls()}
            value={form.work_type || ""}
            onChange={(e) => set("work_type", e.target.value)}
          >
            <option value="">Work type</option>
            {WORK_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Salary (e.g. ₹8–12 LPA)"
            className={fieldCls()}
            value={form.salary || ""}
            onChange={(e) => set("salary", e.target.value)}
          />

          <select
            className={fieldCls()}
            value={form.source || ""}
            onChange={(e) => set("source", e.target.value)}
          >
            <option value="">Source</option>
            {JOB_SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Recruiter name"
            className={fieldCls()}
            value={form.recruiter_name || ""}
            onChange={(e) => set("recruiter_name", e.target.value)}
          />

          <select
            className={fieldCls()}
            value={form.priority || "Medium"}
            onChange={(e) => set("priority", e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p} priority</option>
            ))}
          </select>
        </div>
      </Section>

      <Section label="Referral">
        <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors">
          <input
            type="checkbox"
            className="w-4 h-4 accent-violet-500 cursor-pointer"
            checked={form.is_referral || false}
            onChange={(e) => set("is_referral", e.target.checked)}
          />

          <span className="text-sm text-gray-600 dark:text-white/50">
            This application came through a referral
          </span>
        </label>

        {form.is_referral && (
          <div className="mt-2.5">
            <input
              type="email"
              placeholder="Referral contact email"
              className={fieldCls()}
              value={form.referral_email || ""}
              onChange={(e) => set("referral_email", e.target.value)}
            />
          </div>
        )}
      </Section>
    </div>
  );
}
