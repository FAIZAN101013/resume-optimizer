import { useState, useEffect, useCallback, useMemo } from "react";
import { Briefcase, SearchX } from "lucide-react";

import {
  listJobs,
  createJob,
  updateJob,
  deleteJob,
} from "../services/jobService";
import { JOB_STATUSES } from "../lib/constants";
import { filterAndSortJobs, isStale } from "../lib/jobFilters";

import JobAddModal from "../components/modal/JobAddModal";
import JobEditModal from "../components/modal/JobEditModal";
import JobViewModal from "../components/modal/JobViewModal";
import TrackerHeader from "../components/tracker/TrackerHeader";
import StatsBar from "../components/tracker/StatsBar";
import TrackerToolbar from "../components/tracker/TrackerToolbar";
import FilterTabs from "../components/tracker/FilterTabs";
import JobCard from "../components/tracker/JobCard";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Button from "../components/Button";
import { PageLoader } from '../components/common/Loader'

export default function Tracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("created_desc");
  const [dateRange, setDateRange] = useState("all");

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
    // Standard fetch-on-mount; the loading flag has to flip before the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const handleDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);
    try {
      await deleteJob(pendingDelete.id);
      setJobs((prev) => prev.filter((j) => j.id !== pendingDelete.id));
      setPendingDelete(null);

      // The row is gone, so close any modal still showing it.
      if (selectedJob?.id === pendingDelete.id) {
        setSelectedJob(null);
        setModalMode(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not delete that application.");
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSave = async (updatedJob) => {
    try {
      const saved = await updateJob(updatedJob.id, updatedJob);
      setJobs((prev) => prev.map((j) => (j.id === saved.id ? saved : j)));

      // Keep the view modal in sync if it reopens behind the edit modal.
      setSelectedJob((prev) => (prev?.id === saved.id ? saved : prev));
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not update that application.");
    }
  };

  const visibleJobs = useMemo(
    () => filterAndSortJobs(jobs, { search, status: activeFilter, dateRange, sort }),
    [jobs, search, activeFilter, dateRange, sort],
  );

  const counts = useMemo(
    () =>
      Object.fromEntries(
        JOB_STATUSES.map((s) => [s, jobs.filter((j) => j.status === s).length]),
      ),
    [jobs],
  );

  const handleExport = () => {
    const headers = [
      "Company", "Title", "Status", "Applied on", "Location", "Work type",
      "Salary", "Priority", "Source", "Recruiter", "Recruiter email", "URL", "Notes",
    ];

    // Export what's on screen when a filter is active — otherwise the button
    // silently contradicts the list the user is looking at.
    const rows = visibleJobs.map((j) => [
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

  const closeModals = () => {
    setSelectedJob(null);
    setModalMode(null);
  };

  const hasFilters = search || dateRange !== "all" || activeFilter !== "All";

  return (
    <div className="mx-auto w-full max-w-5xl">
      <TrackerHeader
        count={jobs.length}
        onAdd={() => setShowAddModal(true)}
        onExport={handleExport}
      />

      <StatsBar
        counts={counts}
        total={jobs.length}
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
      />

      <TrackerToolbar
        search={search}
        onSearch={setSearch}
        sort={sort}
        onSort={setSort}
        dateRange={dateRange}
        onDateRange={setDateRange}
        resultCount={visibleJobs.length}
        totalCount={jobs.length}
      />

      <FilterTabs
        activeFilter={activeFilter}
        onFilter={setActiveFilter}
        counts={counts}
        total={jobs.length}
      />

      {error && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            aria-label="Dismiss"
            className="leading-none text-rose-500 hover:text-rose-400"
          >
            ×
          </button>
        </div>
      )}

      {/* Job list */}
      {loading ? (
        <PageLoader label="Loading applications" />
      ) : visibleJobs.length === 0 ? (
        <div className="py-16 text-center">
          {hasFilters ? (
            <>
              <SearchX
                className="mx-auto mb-3 h-8 w-8 opacity-30"
                strokeWidth={1.5}
              />
              <p className="text-sm text-gray-500 dark:text-gray-600">
                No applications match these filters.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setDateRange("all");
                  setActiveFilter("All");
                }}
                className="mt-3 text-xs text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-400"
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <Briefcase
                className="mx-auto mb-3 h-8 w-8 opacity-30"
                strokeWidth={1.5}
              />
              <p className="text-sm text-gray-500 dark:text-gray-600">
                No applications yet.
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-700">
                Add your first one to start tracking your search.
              </p>
              <div className="mt-4">
                <Button onClick={() => setShowAddModal(true)}>+ Add Job</Button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isStale={isStale(job)}
              onClick={() => {
                setSelectedJob(job);
                setModalMode("view");
              }}
              onDelete={() => setPendingDelete(job)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <JobAddModal
          onAdd={handleAddJob}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {selectedJob && modalMode === "view" && (
        <JobViewModal
          job={selectedJob}
          onClose={closeModals}
          onEdit={() => setModalMode("edit")}
        />
      )}

      {selectedJob && modalMode === "edit" && (
        <JobEditModal
          job={selectedJob}
          onSave={handleEditSave}
          onClose={closeModals}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this application?"
          message={`${pendingDelete.title} at ${pendingDelete.company} will be removed, along with its timeline. This can't be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
          busy={deleting}
        />
      )}
    </div>
  );
}
