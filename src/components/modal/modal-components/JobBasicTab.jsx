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
            className={fieldCls("title")}
            value={form.title || ""}
            onChange={(e) => set("title", e.target.value)}
          />

          {errors.title && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">
              Required
            </p>
          )}
        </div>
        <input
          type="date"
          className={fieldCls()}
          value={form.application_date || ""}
          onChange={(e) => set("application_date", e.target.value)}
        />
         <input
        type="email"
        placeholder="Recruiter email"
        className={fieldCls()}
        value={form.recruiter_email || ""}
        onChange={(e) => set("recruiter_email", e.target.value)}
      />
      <div className="col-span-2">
  <input
    type="url"
    placeholder="Job posting URL"
    className={fieldCls()}
    value={form.url || ""}
    onChange={(e) => set("url", e.target.value)}
  />
</div>
      </div>
      <div className="mt-2.5">
  <textarea
    placeholder="Paste the job description here…"
    rows={4}
    className={fieldCls() + " resize-none leading-relaxed"}
    value={form.description || ""}
    onChange={(e) => set("description", e.target.value)}
  />

  <p className="text-[11px] text-gray-400 dark:text-white/20 mt-1">
    Powers resume analysis, interview prep, and tailored emails
  </p>
</div>

    </Section>
  );
}
