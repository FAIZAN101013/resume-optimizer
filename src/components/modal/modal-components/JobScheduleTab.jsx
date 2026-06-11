import Section from "./Section";

export default function JobScheduleTab({
  form,
  set,
  fieldCls,
}) {
  return (
    <Section label="Schedule">

      {form.status === "Applied" && (
        <p className="text-sm text-gray-500 dark:text-white/40">
          No scheduling required for applied applications.
        </p>
      )}

      {form.status === "Interview" && (
        <div className="space-y-3">

          <div>
            <label className="text-xs text-gray-500 dark:text-white/35 block mb-1">
              Interview Date
            </label>

            <input
              type="date"
              className={fieldCls()}
              value={form.interviewDate || ""}
              onChange={(e) =>
                set("interviewDate", e.target.value)
              }
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-white/35 block mb-1">
              Interview Time
            </label>

            <input
              type="time"
              className={fieldCls()}
              value={form.interviewTime || ""}
              onChange={(e) =>
                set("interviewTime", e.target.value)
              }
            />
          </div>

        </div>
      )}

      {form.status === "Offer" && (
        <div className="space-y-3">

          <div>
            <label className="text-xs text-gray-500 dark:text-white/35 block mb-1">
              Offer Expiry Date
            </label>

            <input
              type="date"
              className={fieldCls()}
              value={form.followUpDate || ""}
              onChange={(e) =>
                set("followUpDate", e.target.value)
              }
            />
          </div>

        </div>
      )}

      {form.status === "Rejected" && (
        <p className="text-sm text-gray-500 dark:text-white/40">
          No scheduling required for rejected applications.
        </p>
      )}

    </Section>
  );
}