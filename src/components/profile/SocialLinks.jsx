import Card from "../common/Card";
import { Input } from "../common/Field";

const SocialLinks = ({ formData, handleChange }) => {
  return (
    <Card title="Social Links" subtitle="Add your professional profiles">
      <div className="space-y-5">

        <Input
          label="GitHub"
          name="github"
          type="url"
          value={formData.github}
          onChange={handleChange}
          placeholder="https://github.com/username"
        />

        <Input
          label="LinkedIn"
          name="linkedin"
          type="url"
          value={formData.linkedin}
          onChange={handleChange}
          placeholder="https://linkedin.com/in/username"
        />

        <Input
          label="Portfolio"
          name="portfolio"
          type="url"
          value={formData.portfolio}
          onChange={handleChange}
          placeholder="https://yourportfolio.com"
        />

      </div>
    </Card>
  );
};

export default SocialLinks;
