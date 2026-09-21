"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaClock,
  FaCheckCircle,
  FaPen,
  FaFire,
  FaBookOpen,
  FaExternalLinkAlt,
  FaTimes,
  FaShareAlt,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

export interface CalendarEventItem {
  id: string;
  title: string;
  date: string; // ISO string
  type: "blog" | "journal" | "social";
  status: "published" | "scheduled" | "draft";
  slug?: string;
  coverImage?: string | null;
  mood?: string | null;
}

export default function CalendarClient({
  initialEvents,
}: {
  initialEvents: CalendarEventItem[];
}) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    dateStr: string;
    events: CalendarEventItem[];
  } | null>(null);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Calculate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDate = new Date(year, month, 0).getDate();

    const days: {
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      dateKey: string; // YYYY-MM-DD
    }[] = [];

    const todayStr = new Date().toISOString().slice(0, 10);

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDate - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: key === todayStr,
        dateKey: key,
      });
    }

    // Current month days
    for (let i = 1; i <= lastDate; i++) {
      const d = new Date(year, month, i);
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: key === todayStr,
        dateKey: key,
      });
    }

    // Next month padding to fill complete weeks (up to multiple of 7)
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: key === todayStr,
        dateKey: key,
      });
    }

    return days;
  }, [year, month]);

  // Group events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();
    for (const ev of initialEvents) {
      const key = ev.date.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [initialEvents]);

  // Upcoming scheduled posts
  const scheduledQueue = useMemo(() => {
    const now = Date.now();
    return initialEvents
      .filter((ev) => ev.status === "scheduled" && new Date(ev.date).getTime() > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [initialEvents]);

  // Weekly Goals Calculation (current week: Sunday to Saturday)
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const thisWeekEvents = initialEvents.filter((ev) => {
      const t = new Date(ev.date).getTime();
      return t >= startOfWeek.getTime() && t <= endOfWeek.getTime() && ev.status === "published";
    });

    const blogsPublished = thisWeekEvents.filter((ev) => ev.type === "blog").length;
    const logsPublished = thisWeekEvents.filter((ev) => ev.type === "journal").length;

    const blogTarget = 2;
    const logTarget = 3;

    return {
      blogsPublished,
      blogTarget,
      blogProgress: Math.min(100, Math.round((blogsPublished / blogTarget) * 100)),
      logsPublished,
      logTarget,
      logProgress: Math.min(100, Math.round((logsPublished / logTarget) * 100)),
    };
  }, [initialEvents]);

  return (
    <div className="max-w-7xl space-y-8 pb-16">
      {/* Header & Goal Progress Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Content Calendar &amp; Publishing Schedule
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
              <FaFire className="text-amber-400 text-xs animate-bounce" />
              Publishing Streak Active
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Maintain consistent publishing consistency across technical blogs, daily dev logs, and social channels.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/social"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 transition active:scale-95 shadow-sm"
          >
            <FaShareAlt className="text-xs" />
            <span>Social Post</span>
          </Link>

          <Link
            href="/admin/journal/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-purple-400 hover:text-purple-300 border border-purple-500/30 transition active:scale-95 shadow-sm"
          >
            <FaBookOpen className="text-xs" />
            <span>New Dev Log</span>
          </Link>

          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            <HiSparkles className="text-sm" />
            <span>Schedule / Write Post</span>
          </Link>
        </div>
      </div>

      {/* Weekly Targets & Scheduled Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Goals Card */}
        <div className="lg:col-span-2 bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <FaFire className="text-amber-400" />
              Weekly Publishing Goals (This Week)
            </h3>
            <span className="text-[11px] text-gray-500 font-medium">Reset every Sunday</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Blog Posts Target */}
            <div className="bg-gray-950/70 border border-gray-800/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">📝 Blog Articles</span>
                <span className="font-bold text-indigo-400">
                  {weeklyStats.blogsPublished} / {weeklyStats.blogTarget} ({weeklyStats.blogProgress}%)
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${weeklyStats.blogProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500">
                {weeklyStats.blogsPublished >= weeklyStats.blogTarget
                  ? "🎯 Goal Achieved! Great job on your engineering authority."
                  : `Need ${weeklyStats.blogTarget - weeklyStats.blogsPublished} more post to hit weekly target.`}
              </p>
            </div>

            {/* Dev Logs Target */}
            <div className="bg-gray-950/70 border border-gray-800/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium">📓 Dev Journal Logs</span>
                <span className="font-bold text-purple-400">
                  {weeklyStats.logsPublished} / {weeklyStats.logTarget} ({weeklyStats.logProgress}%)
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${weeklyStats.logProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500">
                {weeklyStats.logsPublished >= weeklyStats.logTarget
                  ? "🎯 Dev streak unlocked! Active daily progress logged."
                  : `Need ${weeklyStats.logTarget - weeklyStats.logsPublished} more daily log this week.`}
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Scheduled Queue Card */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <FaClock className="text-blue-400" />
              Scheduled Queue ({scheduledQueue.length})
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 font-semibold border border-blue-500/30">
              Auto-Publishing
            </span>
          </div>

          {scheduledQueue.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500 space-y-2">
              <p>No posts in queue right now.</p>
              <Link
                href="/admin/posts/new"
                className="inline-block text-indigo-400 hover:text-indigo-300 font-medium"
              >
                + Schedule a new draft →
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
              {scheduledQueue.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-950/80 border border-blue-500/20 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate" title={item.title}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-blue-400 font-mono mt-0.5">
                      ⏰ {new Date(item.date).toLocaleDateString([], { month: "short", day: "numeric" })} at{" "}
                      {new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <Link
                    href={`/admin/posts/${item.id.replace("post-", "")}/edit`}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition shrink-0"
                    title="Edit or Reschedule"
                  >
                    <FaPen className="text-[10px]" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{monthName}</h2>
            <button
              type="button"
              onClick={goToToday}
              className="px-2.5 py-1 text-xs rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
              title="Previous Month"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition"
              title="Next Month"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-gray-800/80">
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Published Blog</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Scheduled Post</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span>Draft Article</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Dev Journal Log</span>
          </div>
        </div>

        {/* 7-Day Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-gray-500 py-1">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarDays.map((dayObj, idx) => {
            const dayEvents = eventsByDate.get(dayObj.dateKey) || [];
            const hasScheduled = dayEvents.some((e) => e.status === "scheduled");

            return (
              <div
                key={idx}
                onClick={() => {
                  if (dayEvents.length > 0) {
                    setSelectedDayEvents({ dateStr: dayObj.dateKey, events: dayEvents });
                  } else {
                    router.push(`/admin/posts/new?scheduleDate=${dayObj.dateKey}T10:00`);
                  }
                }}
                className={`min-h-[90px] sm:min-h-[110px] p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition relative group ${
                  dayObj.isToday
                    ? "bg-indigo-950/20 border-indigo-500/50 shadow-sm"
                    : dayObj.isCurrentMonth
                    ? "bg-gray-950/60 border-gray-800/80 hover:border-gray-700"
                    : "bg-gray-950/20 border-gray-900 opacity-40 hover:opacity-75"
                } ${hasScheduled ? "ring-1 ring-blue-500/40" : ""}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      dayObj.isToday
                        ? "bg-indigo-600 text-white"
                        : dayObj.isCurrentMonth
                        ? "text-gray-300"
                        : "text-gray-600"
                    }`}
                  >
                    {dayObj.date.getDate()}
                  </span>

                  {/* Add icon on hover */}
                  <span className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-400 text-[10px] transition">
                    <FaPlus />
                  </span>
                </div>

                {/* Event Pills */}
                <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => {
                    let pillStyle = "bg-gray-800 text-gray-300";
                    if (ev.type === "journal") pillStyle = "bg-purple-950/80 text-purple-300 border border-purple-500/30";
                    else if (ev.status === "published") pillStyle = "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30";
                    else if (ev.status === "scheduled") pillStyle = "bg-blue-950/90 text-blue-300 border border-blue-500/40 font-semibold";
                    else if (ev.status === "draft") pillStyle = "bg-yellow-950/80 text-yellow-300 border border-yellow-500/30";

                    return (
                      <div
                        key={ev.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded truncate transition ${pillStyle}`}
                        title={ev.title}
                      >
                        {ev.status === "scheduled" && "⏰ "}
                        {ev.type === "journal" && (ev.mood ? `${ev.mood} ` : "📓 ")}
                        {ev.title}
                      </div>
                    );
                  })}

                  {dayEvents.length > 2 && (
                    <div className="text-[9px] text-gray-400 font-semibold px-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Modal */}
      {selectedDayEvents && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedDayEvents(null)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FaCalendarAlt className="text-indigo-400 text-sm" />
                  {new Date(selectedDayEvents.dateStr + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedDayEvents.events.length} publication(s) on this date
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayEvents(null)}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {selectedDayEvents.events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-gray-950 border border-gray-800 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                        ev.status === "published"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                          : ev.status === "scheduled"
                          ? "bg-blue-950 text-blue-400 border border-blue-500/30"
                          : "bg-yellow-950 text-yellow-400 border border-yellow-500/30"
                      }`}
                    >
                      {ev.status} • {ev.type}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono">
                      {new Date(ev.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white">{ev.title}</h4>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 text-xs">
                    {ev.type === "blog" && ev.slug && ev.status === "published" ? (
                      <Link
                        href={`/blog/${ev.slug}`}
                        target="_blank"
                        className="text-gray-400 hover:text-white inline-flex items-center gap-1"
                      >
                        <span>View Live</span>
                        <FaExternalLinkAlt className="text-[10px]" />
                      </Link>
                    ) : (
                      <span className="text-gray-500 text-[11px]">Internal Entry</span>
                    )}

                    <Link
                      href={
                        ev.type === "journal"
                          ? `/journal/${ev.date.slice(0, 10)}`
                          : `/admin/posts/${ev.id.replace("post-", "")}/edit`
                      }
                      className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                    >
                      <span>Edit Entry</span>
                      <FaPen className="text-[10px]" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
              <Link
                href={`/admin/posts/new?scheduleDate=${selectedDayEvents.dateStr}T10:00`}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-sm"
              >
                <FaPlus className="text-xs" />
                <span>Schedule New Post for this Date</span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedDayEvents(null)}
                className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
