import Section from "./Section";

export default function JobBasicTab({ form, set, fieldCls, errors }) {
  return (
    <Section label="Position">
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <input
            type="text"
            placeholder="Company"
            className={fieldCls("company")}
            value={form.company || ""}
            onChange={(e) => set("company", e.target.value)}
          />

          {errors.company && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">
              Required
            </p>
          )}
        </div>
        <div>
          <input
            type="text"
            placeholder="Role / title"
            className={fieldCls("role")}
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
          />

          {errors.role && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">
              Required
            </p>
          )}
        </div>
        <input
          type="date"
          className={fieldCls()}
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
        />
         <input
        type="email"
        placeholder="Recruiter email"
        className={fieldCls()}
        value={form.companyEmail}
        onChange={(e) => set("companyEmail", e.target.value)}
      />
      <div className="col-span-2">
  <input
    type="url"
    placeholder="Job posting URL"
    className={fieldCls()}
    value={form.jobUrl || ""}
    onChange={(e) => set("jobUrl", e.target.value)}
  />
</div>
      </div>
      <div className="mt-2.5">
  <textarea
    placeholder="Paste the job description here (used for AI email drafts)…"
    rows={4}
    className={fieldCls() + " resize-none leading-relaxed"}
    value={form.jobDescription || ""}
    onChange={(e) => set("jobDescription", e.target.value)}
  />

  <p className="text-[11px] text-gray-400 dark:text-white/20 mt-1">
    Optional — helps generate tailored follow-up emails
  </p>
</div>
     
    </Section>
  );
}
