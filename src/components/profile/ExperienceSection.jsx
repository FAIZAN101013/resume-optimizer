import Card from "../common/Card";
import ListEditor from "../common/ListEditor";

const FIELDS = [
  { name: "title", label: "Job title", placeholder: "Frontend Developer Intern" },
  { name: "company", label: "Company", placeholder: "ABC Technologies" },
  { name: "location", label: "Location", placeholder: "Remote" },
  { name: "employment_type", label: "Type", placeholder: "Internship / Full-time" },
  { name: "start_date", label: "Start", type: "month" },
  { name: "end_date", label: "End", type: "month" },
  { name: "current", label: "I currently work here", type: "checkbox", span: 2 },
  {
    name: "description",
    label: "What you did",
    type: "textarea",
    rows: 4,
    span: 2,
    placeholder:
      "One bullet per line. Include numbers where you have them — users served, time saved, features shipped.",
  },
];

const newExperience = () => ({
  title: "",
  company: "",
  location: "",
  employment_type: "",
  start_date: "",
  end_date: "",
  current: false,
  description: "",
});

export default function ExperienceSection({ items, onChange }) {
  return (
    <Card
      title="Experience"
      subtitle="Internships, jobs and freelance work"
    >
      <ListEditor
        items={items}
        onChange={onChange}
        fields={FIELDS}
        newItem={newExperience}
        titleKey="title"
        subtitleKey="company"
        addLabel="Add experience"
        emptyLabel="No experience added yet. Add your internships and roles — the Resume Optimizer reads from here."
      />
    </Card>
  );
}
