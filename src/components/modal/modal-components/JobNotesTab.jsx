import Section from "./Section"

export default function JobNotesTab({
  form,
  set,
  fieldCls,
}) {
  return (
    <Section label="Notes">
      <textarea
        placeholder="Any extra context, links, or reminders…"
        rows={6}
        className={fieldCls() + " resize-none leading-relaxed"}
        value={form.notes || ""}
        onChange={(e) => set("notes", e.target.value)}
      />

      <p className="text-[11px] text-gray-400 dark:text-white/20 mt-1">
        Optional — saved with your application for reference
      </p>
    </Section>
  )
}