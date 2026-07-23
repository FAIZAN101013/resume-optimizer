import Card from "../common/Card";
import { Input, Toggle } from "../common/Field";
import TagInput from "../common/TagInput";

const ProfessionalInfo = ({ formData, handleChange, setField }) => {
  return (
    <Card
      title="Professional Information"
      subtitle="Update your career details"
    >
      <div className="space-y-5">

        <Input
          label="Professional Headline"
          name="job_title"
          value={formData.job_title}
          onChange={handleChange}
          placeholder="Frontend Developer"
        />

        <TagInput
          label="Skills"
          hint="Matched against job descriptions"
          value={formData.skills}
          onChange={(skills) => setField("skills", skills)}
          placeholder="Type a skill and press Enter"
        />

        <Toggle
          label="Open to Work"
          description="Let recruiters know you're available."
          name="open_to_work"
          checked={formData.open_to_work}
          onChange={handleChange}
        />

      </div>
    </Card>
  );
};

export default ProfessionalInfo;
