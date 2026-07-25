import Card from "../common/Card";
import ListEditor from "../common/ListEditor";

const FIELDS = [
  { name: "school", label: "School / University", span: 2, placeholder: "VTU, Bengaluru" },
  { name: "degree", label: "Degree", placeholder: "B.E." },
  { name: "field", label: "Field of study", placeholder: "Computer Science" },
  { name: "start_date", label: "Start", type: "month" },
  { name: "end_date", label: "End (or expected)", type: "month" },
  { name: "grade", label: "Grade / CGPA", placeholder: "8.4 CGPA" },
];

const newEducation = () => ({
  school: "",
  degree: "",
  field: "",
  start_date: "",
  end_date: "",
  grade: "",
});

export default function EducationSection({ items, onChange }) {
  return (
    <Card title="Education" subtitle="Degrees and coursework">
      <ListEditor
        items={items}
        onChange={onChange}
        fields={FIELDS}
        newItem={newEducation}
        titleKey="school"
        subtitleKey="degree"
        addLabel="Add education"
        emptyLabel="No education added yet."
      />
    </Card>
  );
}
