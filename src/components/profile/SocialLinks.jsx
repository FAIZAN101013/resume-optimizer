import Card from "../common/Card";

const SocialLinks = ({ formData, handleChange }) => {
  return (
    <Card
      title="Social Links"
      subtitle="Add your professional profiles"
    >
      <div className="space-y-6">

        <div>
          <label className="block text-sm font-medium mb-2">
            GitHub
          </label>

          <input
            type="url"
            name="github"
            value={formData.github}
            onChange={handleChange}
            placeholder="https://github.com/username"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            LinkedIn
          </label>

          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/username"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Portfolio
          </label>

          <input
            type="url"
            name="portfolio"
            value={formData.portfolio}
            onChange={handleChange}
            placeholder="https://yourportfolio.com"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
          />
        </div>

      </div>
    </Card>
  );
};

export default SocialLinks;
