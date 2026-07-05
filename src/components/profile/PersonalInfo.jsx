import Card from "../common/Card";

const PersonalInfo = ({ formData, handleChange }) => {
  return (
    <Card
      title="Personal Information"
      subtitle="Manage your personal details"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-medium mb-2">
            Full Name
          </label>

          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Phone Number
          </label>

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Location
          </label>

          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            Bio
          </label>

          <textarea
            rows={5}
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 resize-none"
          />
        </div>

      </div>
    </Card>
  );
};

export default PersonalInfo;
