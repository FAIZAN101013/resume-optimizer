import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Briefcase } from "lucide-react";

import JobAddModal from "../components/modal/JobAddModal";
import JobEditModal from "../components/modal/JobEditModal";
import JobViewModal from "../components/modal/JobViewModal";
import TrackerHeader from "../components/tracker/TrackerHeader";
import StatsBar from "../components/tracker/StatsBar";
import SearchBar from "../components/tracker/SearchBar";
import FilterTabs from "../components/tracker/FilterTabs";
import JobCard from "../components/tracker/JobCard";

export default function Tracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalMode, setModalMode] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setJobs(data);
    setLoading(false);
  };

  const handleAddJob = async (form) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("jobs")
      .insert([
        {
          company: form.company,
          role: form.role,
          status: form.status,
          date: form.date,
          company_email: form.companyEmail,
          is_referral: form.isReferral,
          referral_email: form.referralEmail,
          notes: form.notes,
          user_id: user.id,
        },
      ])
      .select();
    if (error) console.error(error);
    else setJobs((prev) => [data[0], ...prev]);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) console.error(error);
    else setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const handleEditSave = async (updatedJob) => {
    const { error } = await supabase
      .from("jobs")
      .update({
        company: updatedJob.company,
        role: updatedJob.role,
        status: updatedJob.status,
        date: updatedJob.date,
        company_email: updatedJob.companyEmail,
        is_referral: updatedJob.isReferral,
        referral_email: updatedJob.referralEmail,
        notes: updatedJob.notes,
      })
      .eq("id", updatedJob.id);
    if (error) console.error(error);
    else
      setJobs((prev) =>
        prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)),
      );
  };

  const filteredJobs = jobs
    .filter((j) => activeFilter === "All" || j.status === activeFilter)
    .filter((j) => {
      const q = search.toLowerCase();
      return (
        j.company.toLowerCase().includes(q) || j.role.toLowerCase().includes(q)
      );
    });

  const counts = {
    Applied: jobs.filter((j) => j.status === "Applied").length,
    Interview: jobs.filter((j) => j.status === "Interview").length,
    Offer: jobs.filter((j) => j.status === "Offer").length,
    Rejected: jobs.filter((j) => j.status === "Rejected").length,
  };

  const handleExport = () => {
    // 1. Define columns
    const headers = ["Company", "Role", "Status", "Date", "Notes"];

    // 2. Map jobs to rows
    const rows = jobs.map((j) => [
      j.company,
      j.role,
      j.status,
      j.date || "",
      j.notes || "",
    ]);

    // 3. Combine headers + rows into CSV string
    const csv = [headers, ...rows]
      .map((row) => row.map((val) => `"${val}"`).join(","))
      .join("\n");

    // 4. Create a downloadable link and click it
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "careeros-jobs.csv";
    a.click();
    URL.revokeObjectURL(url);

   
  };

   const isStale = (date) => {
      if (!date) return false;

      const days = (new Date() - new Date(date)) / (1000 * 60 * 60 * 24);
      return days > 5;
    };
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <TrackerHeader
        count={jobs.length}
        onAdd={() => setShowModal(true)}
        onExport={handleExport}
      />

      <StatsBar
        counts={counts}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        onClear={() => setSearch("")}
      />

      <FilterTabs
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        counts={counts}
      />

      {/* Job List */}
      {loading ? (
        <div className="text-center py-16 text-gray-600">
          <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <Briefcase
            className="w-8 h-8 mx-auto mb-3 opacity-30"
            strokeWidth={1.5}
          />
          <p className="text-sm">
            {search
              ? `No results for "${search}"`
              : "No jobs found. Add your first application!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isStale={job.status === "Applied" && isStale(job.date)}
              onClick={() => {
                setSelectedJob(job);
                setModalMode("view");
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <JobAddModal onAdd={handleAddJob} onClose={() => setShowModal(false)} />
      )}
      {selectedJob && modalMode === "view" && (
        <JobViewModal
          job={selectedJob}
          onClose={() => {
            setSelectedJob(null);
            setModalMode(null);
          }}
          onEdit={() => setModalMode("edit")}
        />
      )}
      {selectedJob && modalMode === "edit" && (
        <JobEditModal
          job={selectedJob}
          onSave={handleEditSave}
          onClose={() => {
            setSelectedJob(null);
            setModalMode(null);
          }}
        />
      )}
    </div>
  );
}
