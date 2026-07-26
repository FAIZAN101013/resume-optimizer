import Card from "../common/Card";
import ListEditor from "../common/ListEditor";

const FIELDS = [
  { name: "name", label: "Project name", placeholder: "JoBz" },
  { name: "role", label: "Your role", placeholder: "Solo developer" },
  { name: "url", label: "Live URL", type: "url", placeholder: "https://…" },
  { name: "repo_url", label: "Repository", type: "url", placeholder: "https://github.com/…" },
  { name: "tech", label: "Tech used", span: 2, placeholder: "React, Supabase, Tailwind" },
  {
    name: "description",
    label: "What it does",
    type: "textarea",
    rows: 3,
    span: 2,
    placeholder: "What problem it solves and what you built.",
  },
];

const newProject = () => ({
  name: "",
  role: "",
  url: "",
  repo_url: "",
  tech: "",
  description: "",
});

export default function ProjectsSection({ items, onChange }) {
  return (
    <Card title="Projects" subtitle="Things you've built">
      <ListEditor
        items={items}
        onChange={onChange}
        fields={FIELDS}
        newItem={newProject}
        titleKey="name"
        subtitleKey="tech"
        addLabel="Add project"
        emptyLabel="No projects added yet. For students and fresh graduates these often matter more than experience."
      />
    </Card>
  );
}
