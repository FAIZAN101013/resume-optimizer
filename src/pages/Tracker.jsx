import { useState, useEffect, useCallback } from "react";
import { Briefcase } from "lucide-react";
import {
  listJobs,
  createJob,
  updateJob,
  deleteJob,
} from "../services/jobService";
import { JOB_STATUSES } from "../lib/constants";

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
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalMode, setModalMode] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setJobs(await listJobs());
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not load your applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleAddJob = async (form) => {
    try {
      const created = await createJob(form);
      setJobs((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not save that application.");
    }
  };

  const handleDelete = async (id) => {
    // Optimistic: put the row back if the delete is rejected.
    const previous = jobs;
    setJobs((prev) => prev.filter((j) => j.id !== id));
    try {
      await deleteJob(id);
    } catch (err) {
      console.error(err);
      setJobs(previous);
      setError(err.message || "Could not delete that application.");
    }
  };

  const handleEditSave = async (updatedJob) => {
    try {
      const saved = await updateJob(updatedJob.id, updatedJob);
      setJobs((prev) => prev.map((j) => (j.id === saved.id ? saved : j)));
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not update that application.");
    }
  };

  const filteredJobs = jobs
    .filter((j) => activeFilter === "All" || j.status === activeFilter)
    .filter((j) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        (j.company || "").toLowerCase().includes(q) ||
        (j.title || "").toLowerCase().includes(q)
      );
    });

  const counts = Object.fromEntries(
    JOB_STATUSES.map((s) => [s, jobs.filter((j) => j.status === s).length]),
  );

  const handleExport = () => {
    const headers = [
      "Company", "Title", "Status", "Applied on", "Location", "Work type",
      "Salary", "Priority", "Source", "Recruiter", "Recruiter email", "URL", "Notes",
    ];

    const rows = jobs.map((j) => [
      j.company, j.title, j.status, j.application_date, j.location,
      j.work_type, j.salary, j.priority, j.source, j.recruiter_name,
      j.recruiter_email, j.url, j.notes,
    ]);

    // Escape embedded quotes, or a value containing one breaks the column split.
    const escape = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\n");

    // BOM so Excel reads UTF-8 correctly.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobz-applications.csv";
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

      {error && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-rose-500 hover:text-rose-400 leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Job List */}
      {loading ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-600">
          <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-600">
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
              isStale={job.status === "Applied" && isStale(job.application_date)}
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
