import Card from "../common/Card";
import { Input, Textarea } from "../common/Field";

const PersonalInfo = ({ formData, handleChange }) => {
  return (
    <Card title="Personal Information" subtitle="Manage your personal details">
      <div className="space-y-4">

        <Input
          label="Full name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="Ada Lovelace"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />

          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Bengaluru, India"
          />
        </div>

        <Textarea
          label="Bio"
          hint="Seeds your resume summary"
          name="bio"
          rows={6}
          value={formData.bio}
          onChange={handleChange}
          placeholder="A short paragraph about who you are and what you're looking for."
        />

      </div>
    </Card>
  );
};

export default PersonalInfo;
