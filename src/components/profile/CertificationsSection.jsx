import Card from "../common/Card";
import ListEditor from "../common/ListEditor";

const FIELDS = [
  { name: "name", label: "Certification", span: 2, placeholder: "AWS Certified Cloud Practitioner" },
  { name: "issuer", label: "Issued by", placeholder: "Amazon Web Services" },
  { name: "issue_date", label: "Issued", type: "month" },
  { name: "credential_url", label: "Credential URL", type: "url", span: 2, placeholder: "https://…" },
];

const newCertification = () => ({
  name: "",
  issuer: "",
  issue_date: "",
  credential_url: "",
});

export default function CertificationsSection({ items, onChange }) {
  return (
    <Card title="Certifications" subtitle="Courses and credentials">
      <ListEditor
        items={items}
        onChange={onChange}
        fields={FIELDS}
        newItem={newCertification}
        titleKey="name"
        subtitleKey="issuer"
        addLabel="Add certification"
        emptyLabel="No certifications added yet."
      />
    </Card>
  );
}
