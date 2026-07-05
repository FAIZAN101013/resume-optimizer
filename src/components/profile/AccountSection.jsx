import Card from "../common/Card";
import Button from "../Button";
import { useAuth } from "../../context/AuthContext";

const AccountSection = () => {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Card
      title="Account & Security"
      subtitle="Manage your account settings"
    >
      <div className="space-y-6">

        {/* Email */}

        <div>
          <label className="block text-sm font-medium mb-2">
            Email Address
          </label>

          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-400 cursor-not-allowed"
          />
        </div>

        {/* Change Password */}

        <Button variant="secondary" className="w-full py-3">
          Change Password
        </Button>

        {/* Sign Out */}

        <Button
          onClick={handleSignOut}
          variant="danger"
          className="w-full py-3"
        >
          Sign Out
        </Button>

        {/* Delete */}

        <Button
          disabled
          variant="dangerOutline"
          className="w-full py-3"
        >
          Delete Account (Coming Soon)
        </Button>

      </div>
    </Card>
  );
};

export default AccountSection;
