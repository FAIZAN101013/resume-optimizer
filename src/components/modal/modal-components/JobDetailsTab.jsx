import Section from "./Section";
import Divider from "./Divider";

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
                "py-1.5 rounded-lg border text-xs font-medium transition-all " +
                (form.status === key ? active : STATUS_INACTIVE)
              }
            >
              {key}
            </button>
          ))}
        </div>
      </Section>
      <Divider />

      <Section label="Timeline">
        <div className="grid grid-cols-1 gap-2.5">
          <input
            type="date"
            className={fieldCls()}
            value={form.assessmentDate || ""}
            onChange={(e) => set("assessmentDate", e.target.value)}
          />

          <input
            type="date"
            className={fieldCls()}
            value={form.interviewDate || ""}
            onChange={(e) => set("interviewDate", e.target.value)}
          />

          <input
            type="date"
            className={fieldCls()}
            value={form.followUpDate || ""}
            onChange={(e) => set("followUpDate", e.target.value)}
          />
        </div>
      </Section>
      <Section label="Referral">
        <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors">
          <input
            type="checkbox"
            className="w-4 h-4 accent-violet-500 cursor-pointer"
            checked={form.isReferral}
            onChange={(e) => set("isReferral", e.target.checked)}
          />

          <span className="text-sm text-gray-600 dark:text-white/50">
            This application came through a referral
          </span>
        </label>

        {form.isReferral && (
          <div className="mt-2.5">
            <input
              type="email"
              placeholder="Referral contact email"
              className={fieldCls()}
              value={form.referralEmail || ""}
              onChange={(e) => set("referralEmail", e.target.value)}
            />
          </div>
        )}
      </Section>
    </div>
  );
}
