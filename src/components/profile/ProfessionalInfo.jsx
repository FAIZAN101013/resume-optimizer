import Card from "../common/Card";

const ProfessionalInfo = ({ formData, handleChange }) => {
  return (
    <Card
      title="Professional Information"
      subtitle="Update your career details"
    >
      <div className="space-y-6">

        <div>
          <label className="block text-sm font-medium mb-2">
            Job Title
          </label>

          <input
            type="text"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            placeholder="Frontend Developer"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-950 p-4">

          <div>
            <h3 className="font-medium">
              Open to Work
            </h3>

            <p className="text-sm text-zinc-400">
              Let recruiters know you're available.
            </p>
          </div>

          <input
            type="checkbox"
            name="open_to_work"
            checked={formData.open_to_work}
            onChange={handleChange}
            className="h-5 w-5"
          />

        </div>

      </div>
    </Card>
  );
};

export default ProfessionalInfo;
