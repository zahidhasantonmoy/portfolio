"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaDatabase,
  FaCloudUploadAlt,
  FaCloudDownloadAlt,
  FaDownload,
  FaUpload,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaSyncAlt,
  FaFileCode,
  FaSpinner,
  FaLayerGroup,
} from "react-icons/fa";
import toast from "react-hot-toast";

interface CloudBackupItem {
  public_id: string;
  name: string;
  bytes: number;
  created_at: string;
  url: string;
  secure_url: string;
}

interface RestoreSummaryCounts {
  categories: { inserted: number; updated: number; skipped: number };
  tags: { inserted: number; updated: number; skipped: number };
  posts: { inserted: number; updated: number; skipped: number };
  post_tags: { inserted: number; skipped: number };
  development_logs: { inserted: number; updated: number; skipped: number };
  projects: { inserted: number; updated: number; skipped: number };
  skills: { inserted: number; updated: number; skipped: number };
  subscribers: { inserted: number; updated: number; skipped: number };
  contact_messages: { inserted: number; skipped: number };
}

interface RestoreSummary {
  success: boolean;
  strategy: "skip_existing" | "overwrite";
  counts: RestoreSummaryCounts;
  errors: string[];
}

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess?: () => void;
}

export default function BackupModal({ isOpen, onClose, onRestoreSuccess }: BackupModalProps) {
  const [activeTab, setActiveTab] = useState<"export" | "restore" | "cloud">("export");

  // Cloudinary state
  const [cloudBackups, setCloudBackups] = useState<CloudBackupItem[]>([]);
  const [isCloudConfigured, setIsCloudConfigured] = useState<boolean>(true);
  const [isLoadingCloudList, setIsLoadingCloudList] = useState<boolean>(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState<boolean>(false);

  // Restore state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedJson, setParsedJson] = useState<any | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [restoreStrategy, setRestoreStrategy] = useState<"skip_existing" | "overwrite">("skip_existing");
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreResult, setRestoreResult] = useState<RestoreSummary | null>(null);
  const [cloudRestoreTarget, setCloudRestoreTarget] = useState<CloudBackupItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load cloud backups when modal opens or cloud tab is clicked
  const fetchCloudBackups = async () => {
    setIsLoadingCloudList(true);
    try {
      const res = await fetch("/api/admin/backup/cloud");
      const data = await res.json();
      if (res.ok) {
        setIsCloudConfigured(data.configured !== false);
        setCloudBackups(data.backups || []);
      } else {
        toast.error(data.error || "Failed to load cloud backups");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to connect to Cloudinary backup endpoint");
    } finally {
      setIsLoadingCloudList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCloudBackups();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle saving snapshot to Cloudinary
  const handleSaveToCloudinary = async () => {
    setIsSavingToCloud(true);
    const toastId = toast.loading("Creating database snapshot & uploading to Cloudinary...");
    try {
      const res = await fetch("/api/admin/backup/cloud", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("✅ Cloud snapshot saved to Cloudinary!", { id: toastId });
        await fetchCloudBackups();
      } else {
        toast.error(data.error || "Cloud upload failed", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save to Cloudinary", { id: toastId });
    } finally {
      setIsSavingToCloud(false);
    }
  };

  // Handle local JSON file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const processSelectedFile = (file: File) => {
    if (!file.name.endsWith(".json")) {
      toast.error("Please upload a valid .json backup file");
      return;
    }

    setSelectedFile(file);
    setParseError(null);
    setRestoreResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== "object") {
          throw new Error("Invalid JSON structure");
        }
        setParsedJson(parsed);
      } catch (err: any) {
        setParseError(`Failed to parse JSON: ${err.message}`);
        setParsedJson(null);
      }
    };
    reader.onerror = () => {
      setParseError("Failed to read file.");
      setParsedJson(null);
    };
    reader.readAsText(file);
  };

  // Perform restore from local JSON
  const handleExecuteRestore = async () => {
    if (!parsedJson) {
      toast.error("Please select a valid backup JSON file first.");
      return;
    }

    if (
      restoreStrategy === "overwrite" &&
      !window.confirm(
        "⚠️ WARNING: Overwrite mode will update existing records in your database with values from this backup file. Are you sure you want to proceed?"
      )
    ) {
      return;
    }

    setIsRestoring(true);
    const toastId = toast.loading(
      `Restoring database records (${restoreStrategy === "skip_existing" ? "Safe Mode" : "Overwrite Mode"})...`
    );

    try {
      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: parsedJson,
          strategy: restoreStrategy,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("✅ Database restore completed!", { id: toastId });
        setRestoreResult(data.summary);
        if (onRestoreSuccess) onRestoreSuccess();
      } else {
        toast.error(data.error || "Restore failed", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to execute restore", { id: toastId });
    } finally {
      setIsRestoring(false);
    }
  };

  // Perform restore directly from Cloudinary URL
  const handleCloudRestore = async (backupItem: CloudBackupItem) => {
    if (
      !window.confirm(
        `Are you sure you want to restore from cloud snapshot:\n"${backupItem.name}"?\n\nThis will import missing data into your database.`
      )
    ) {
      return;
    }

    setIsRestoring(true);
    const toastId = toast.loading(`Fetching snapshot from Cloudinary & restoring...`);

    try {
      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloudinary_url: backupItem.secure_url,
          strategy: "skip_existing", // Safe mode by default for cloud restore
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("✅ Cloud snapshot restored successfully!", { id: toastId });
        setRestoreResult(data.summary);
        setActiveTab("restore"); // Switch to show summary report
        if (onRestoreSuccess) onRestoreSuccess();
      } else {
        toast.error(data.error || "Cloud restore failed", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to execute cloud restore", { id: toastId });
    } finally {
      setIsRestoring(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Quick stats from parsed JSON
  const parsedData = parsedJson?.data || parsedJson;
  const postsCount = Array.isArray(parsedData?.posts) ? parsedData.posts.length : parsedJson?.stats?.total_posts || 0;
  const devLogsCount = Array.isArray(parsedData?.development_logs)
    ? parsedData.development_logs.length
    : Array.isArray(parsedData?.dev_logs)
    ? parsedData.dev_logs.length
    : parsedJson?.stats?.total_dev_logs || 0;
  const projectsCount = Array.isArray(parsedData?.projects) ? parsedData.projects.length : parsedJson?.stats?.total_projects || 0;
  const skillsCount = Array.isArray(parsedData?.skills) ? parsedData.skills.length : parsedJson?.stats?.total_skills || 0;
  const categoriesCount = Array.isArray(parsedData?.categories) ? parsedData.categories.length : parsedJson?.stats?.total_categories || 0;
  const tagsCount = Array.isArray(parsedData?.tags) ? parsedData.tags.length : parsedJson?.stats?.total_tags || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-lg border border-indigo-500/20">
              <FaDatabase />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Database Backup &amp; Recovery Hub
              </h2>
              <p className="text-xs text-gray-400">
                Export, restore, or store cloud snapshots to Cloudinary
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 px-6 bg-gray-950/40">
          <button
            type="button"
            onClick={() => setActiveTab("export")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-semibold transition ${
              activeTab === "export"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <FaDownload className="text-xs" />
            <span>Export &amp; Cloud Snapshot</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("restore")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-semibold transition ${
              activeTab === "restore"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <FaUpload className="text-xs" />
            <span>Restore from File</span>
            {restoreResult && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cloud")}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-semibold transition ${
              activeTab === "cloud"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <FaCloudUploadAlt className="text-sm" />
            <span>Cloudinary Backups</span>
            {cloudBackups.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                {cloudBackups.length}
              </span>
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: EXPORT & CLOUD SNAPSHOT */}
          {activeTab === "export" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Local JSON Download Card */}
                <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-5 flex flex-col justify-between hover:border-gray-700 transition">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-base mb-3">
                      <FaDownload />
                    </div>
                    <h3 className="font-semibold text-white text-sm">Download Local JSON File</h3>
                    <p className="text-xs text-gray-400">
                      Instantly download an offline, human-readable JSON file containing all posts, categories, dev logs, projects, skills, and subscribers.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-800/80">
                    <a
                      href="/api/admin/backup"
                      download="zahid-portfolio-backup.json"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition active:scale-95"
                    >
                      <FaDownload className="text-xs" />
                      <span>Download JSON Backup</span>
                    </a>
                  </div>
                </div>

                {/* Cloudinary Raw Snapshot Card */}
                <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-5 flex flex-col justify-between hover:border-gray-700 transition">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-base mb-3">
                      <FaCloudUploadAlt className="text-lg" />
                    </div>
                    <h3 className="font-semibold text-white text-sm">Upload Snapshot to Cloudinary</h3>
                    <p className="text-xs text-gray-400">
                      Store a persistent raw snapshot file in your Cloudinary account under <code className="text-indigo-300 font-mono text-[11px]">portfolio_backups/</code> for cloud recovery anytime.
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-800/80">
                    <button
                      type="button"
                      onClick={handleSaveToCloudinary}
                      disabled={isSavingToCloud}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition active:scale-95 disabled:opacity-50"
                    >
                      {isSavingToCloud ? (
                        <>
                          <FaSpinner className="text-xs animate-spin" />
                          <span>Uploading Snapshot...</span>
                        </>
                      ) : (
                        <>
                          <FaCloudUploadAlt className="text-sm" />
                          <span>Save Snapshot to Cloudinary</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* What gets backed up info */}
              <div className="bg-gray-950/40 border border-gray-800/80 rounded-xl p-4 text-xs text-gray-400 space-y-2">
                <div className="flex items-center gap-2 text-gray-300 font-semibold">
                  <FaShieldAlt className="text-emerald-400" />
                  <span>Snapshot Coverage</span>
                </div>
                <p>
                  Every backup snapshot packages your entire Neon PostgreSQL database state:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-400 pt-1">
                  <span className="bg-gray-900 px-2 py-1 rounded border border-gray-800">✓ Blog Posts &amp; Drafts</span>
                  <span className="bg-gray-900 px-2 py-1 rounded border border-gray-800">✓ Dev Journal Logs</span>
                  <span className="bg-gray-900 px-2 py-1 rounded border border-gray-800">✓ Categories &amp; Tags</span>
                  <span className="bg-gray-900 px-2 py-1 rounded border border-gray-800">✓ Portfolio Projects</span>
                  <span className="bg-gray-900 px-2 py-1 rounded border border-gray-800">✓ Skills &amp; Tech Stack</span>
                  <span className="bg-gray-900 px-2 py-1 rounded border border-gray-800">✓ Newsletter Subscribers</span>
                  <span className="bg-gray-900 px-2 py-1 rounded border border-gray-800">✓ Contact Inquiries</span>
                  <span className="bg-gray-900 px-2 py-1 rounded border border-gray-800">✓ Cross-table Relations</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESTORE FROM LOCAL JSON */}
          {activeTab === "restore" && (
            <div className="space-y-5">
              {/* File Upload / Drag & Drop Area */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-700 hover:border-indigo-500/60 bg-gray-950/50 hover:bg-gray-900/60 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-gray-800 group-hover:bg-indigo-600/20 text-gray-400 group-hover:text-indigo-400 flex items-center justify-center text-xl transition">
                  <FaUpload />
                </div>
                <p className="text-sm font-semibold text-white">
                  {selectedFile ? selectedFile.name : "Click or drag & drop a JSON backup file here"}
                </p>
                <p className="text-xs text-gray-500">
                  Accepts files exported from this dashboard (.json)
                </p>
              </div>

              {parseError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <FaExclamationTriangle className="flex-shrink-0 text-sm" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Parsed Inspection Card */}
              {parsedJson && (
                <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaFileCode className="text-indigo-400 text-sm" />
                      <span className="text-xs font-semibold text-white">Backup Contents Detected</span>
                    </div>
                    {parsedJson.exported_at && (
                      <span className="text-[10px] text-gray-400 font-mono">
                        Exported: {new Date(parsedJson.exported_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-gray-900/80 p-2.5 rounded-lg border border-gray-800/80">
                      <p className="text-[10px] text-gray-400 uppercase">Posts</p>
                      <p className="text-sm font-bold text-white">{postsCount}</p>
                    </div>
                    <div className="bg-gray-900/80 p-2.5 rounded-lg border border-gray-800/80">
                      <p className="text-[10px] text-gray-400 uppercase">Dev Logs</p>
                      <p className="text-sm font-bold text-white">{devLogsCount}</p>
                    </div>
                    <div className="bg-gray-900/80 p-2.5 rounded-lg border border-gray-800/80">
                      <p className="text-[10px] text-gray-400 uppercase">Projects</p>
                      <p className="text-sm font-bold text-white">{projectsCount}</p>
                    </div>
                    <div className="bg-gray-900/80 p-2.5 rounded-lg border border-gray-800/80">
                      <p className="text-[10px] text-gray-400 uppercase">Categories &amp; Tags</p>
                      <p className="text-sm font-bold text-white">{categoriesCount + tagsCount}</p>
                    </div>
                  </div>

                  {/* Restore Strategy Selection */}
                  <div className="pt-3 border-t border-gray-800 space-y-2">
                    <p className="text-xs font-semibold text-gray-300">Restore Mode:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label
                        className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                          restoreStrategy === "skip_existing"
                            ? "bg-indigo-950/40 border-indigo-500/50 text-white"
                            : "bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="strategy"
                          value="skip_existing"
                          checked={restoreStrategy === "skip_existing"}
                          onChange={() => setRestoreStrategy("skip_existing")}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="font-semibold text-emerald-400">Safe Mode (Skip existing)</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Recommended. Imports missing items. Leaves existing posts/logs untouched.
                          </p>
                        </div>
                      </label>

                      <label
                        className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                          restoreStrategy === "overwrite"
                            ? "bg-amber-950/40 border-amber-500/50 text-white"
                            : "bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="strategy"
                          value="overwrite"
                          checked={restoreStrategy === "overwrite"}
                          onChange={() => setRestoreStrategy("overwrite")}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="font-semibold text-amber-400">Overwrite Existing</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Updates records with matching slugs/IDs with the data in this backup file.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Execute Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleExecuteRestore}
                      disabled={isRestoring}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
                    >
                      {isRestoring ? (
                        <>
                          <FaSpinner className="text-xs animate-spin" />
                          <span>Restoring Database...</span>
                        </>
                      ) : (
                        <>
                          <FaShieldAlt className="text-xs" />
                          <span>Start Database Restore</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Restore Execution Summary Report */}
              {restoreResult && (
                <div className="bg-gray-950 border border-emerald-500/30 rounded-xl p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                    <FaCheckCircle className="text-sm" />
                    <span>Restore Execution Summary ({restoreResult.strategy})</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase">
                          <th className="py-1.5 px-2">Entity</th>
                          <th className="py-1.5 px-2 text-right text-emerald-400">Inserted</th>
                          <th className="py-1.5 px-2 text-right text-amber-400">Updated</th>
                          <th className="py-1.5 px-2 text-right text-gray-400">Skipped</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/40 text-[11px]">
                        <tr>
                          <td className="py-1.5 px-2 text-white">Categories</td>
                          <td className="py-1.5 px-2 text-right text-emerald-400">{restoreResult.counts.categories.inserted}</td>
                          <td className="py-1.5 px-2 text-right text-amber-400">{restoreResult.counts.categories.updated}</td>
                          <td className="py-1.5 px-2 text-right text-gray-400">{restoreResult.counts.categories.skipped}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 text-white">Tags</td>
                          <td className="py-1.5 px-2 text-right text-emerald-400">{restoreResult.counts.tags.inserted}</td>
                          <td className="py-1.5 px-2 text-right text-amber-400">{restoreResult.counts.tags.updated}</td>
                          <td className="py-1.5 px-2 text-right text-gray-400">{restoreResult.counts.tags.skipped}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 text-white">Posts &amp; Blogs</td>
                          <td className="py-1.5 px-2 text-right text-emerald-400">{restoreResult.counts.posts.inserted}</td>
                          <td className="py-1.5 px-2 text-right text-amber-400">{restoreResult.counts.posts.updated}</td>
                          <td className="py-1.5 px-2 text-right text-gray-400">{restoreResult.counts.posts.skipped}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 text-white">Dev Journal Logs</td>
                          <td className="py-1.5 px-2 text-right text-emerald-400">{restoreResult.counts.development_logs.inserted}</td>
                          <td className="py-1.5 px-2 text-right text-amber-400">{restoreResult.counts.development_logs.updated}</td>
                          <td className="py-1.5 px-2 text-right text-gray-400">{restoreResult.counts.development_logs.skipped}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 text-white">Projects</td>
                          <td className="py-1.5 px-2 text-right text-emerald-400">{restoreResult.counts.projects.inserted}</td>
                          <td className="py-1.5 px-2 text-right text-amber-400">{restoreResult.counts.projects.updated}</td>
                          <td className="py-1.5 px-2 text-right text-gray-400">{restoreResult.counts.projects.skipped}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 text-white">Skills</td>
                          <td className="py-1.5 px-2 text-right text-emerald-400">{restoreResult.counts.skills.inserted}</td>
                          <td className="py-1.5 px-2 text-right text-amber-400">{restoreResult.counts.skills.updated}</td>
                          <td className="py-1.5 px-2 text-right text-gray-400">{restoreResult.counts.skills.skipped}</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 text-white">Subscribers</td>
                          <td className="py-1.5 px-2 text-right text-emerald-400">{restoreResult.counts.subscribers.inserted}</td>
                          <td className="py-1.5 px-2 text-right text-amber-400">{restoreResult.counts.subscribers.updated}</td>
                          <td className="py-1.5 px-2 text-right text-gray-400">{restoreResult.counts.subscribers.skipped}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {restoreResult.errors && restoreResult.errors.length > 0 && (
                    <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] space-y-1">
                      <p className="font-semibold">Noted non-fatal notices during restore:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {restoreResult.errors.slice(0, 5).map((e, idx) => (
                          <li key={idx}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLOUDINARY BACKUPS LIST */}
          {activeTab === "cloud" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-sm">Stored Cloud Snapshots</h3>
                  <p className="text-xs text-gray-400">
                    Snapshots stored in Cloudinary folder <code className="text-indigo-300 font-mono text-[11px]">portfolio_backups/</code>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchCloudBackups}
                    disabled={isLoadingCloudList}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs transition"
                    title="Refresh snapshots"
                  >
                    <FaSyncAlt className={isLoadingCloudList ? "animate-spin" : ""} />
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToCloudinary}
                    disabled={isSavingToCloud}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50"
                  >
                    <FaCloudUploadAlt />
                    <span>{isSavingToCloud ? "Creating..." : "New Snapshot"}</span>
                  </button>
                </div>
              </div>

              {!isCloudConfigured ? (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <FaExclamationTriangle />
                    <span>Cloudinary Credentials Missing</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    To enable automatic cloud backup storage, make sure your environment has:
                  </p>
                  <pre className="p-2 rounded bg-black/50 text-[11px] font-mono text-gray-300">
                    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
                    {"\n"}CLOUDINARY_API_KEY=...
                    {"\n"}CLOUDINARY_API_SECRET=...
                  </pre>
                </div>
              ) : isLoadingCloudList ? (
                <div className="py-12 text-center text-gray-500 text-xs flex flex-col items-center gap-2">
                  <FaSpinner className="text-lg animate-spin text-indigo-400" />
                  <span>Loading cloud snapshots from Cloudinary...</span>
                </div>
              ) : cloudBackups.length === 0 ? (
                <div className="py-10 text-center text-gray-500 text-xs bg-gray-950/40 border border-gray-800 rounded-xl p-6">
                  <FaCloudUploadAlt className="text-3xl mx-auto mb-2 text-gray-600" />
                  <p className="font-semibold text-gray-400">No cloud snapshots found yet.</p>
                  <p className="text-[11px] mt-1 text-gray-500">
                    Click &ldquo;New Snapshot&rdquo; above to create and store your first database backup in Cloudinary!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {cloudBackups.map((b) => (
                    <div
                      key={b.public_id}
                      className="p-3.5 rounded-xl bg-gray-800/40 border border-gray-800 hover:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <FaFileCode className="text-indigo-400 flex-shrink-0" />
                          <span className="font-semibold text-white truncate font-mono text-[11px]">
                            {b.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1 font-mono">
                          <span>{formatBytes(b.bytes)}</span>
                          <span>•</span>
                          <span>{new Date(b.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={b.secure_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-[11px] font-medium transition"
                          title="Download from Cloudinary"
                        >
                          <FaDownload className="text-[10px]" />
                          <span>Download</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCloudRestore(b)}
                          disabled={isRestoring}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-[11px] font-semibold transition active:scale-95 disabled:opacity-50"
                          title="Restore this snapshot into Neon database"
                        >
                          <FaCloudDownloadAlt className="text-xs" />
                          <span>Restore</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-800 bg-gray-950/60 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <FaShieldAlt className="text-emerald-400 text-xs" />
            <span>PostgreSQL &amp; Cloudinary Engine</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
