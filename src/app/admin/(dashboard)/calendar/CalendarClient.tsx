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
  type: "blog" | "journal";
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

    // No weekly targets: the counts below are plain this-week totals.
    // (Hardcoded targets of 2 blogs / 3 logs were removed — they were not
    // set anywhere in the system and must not read as measured goals.)
    return {
      blogsPublished,
      logsPublished,
    };
  }, [initialEvents]);

  return (
    <div className="max-w-7xl space-y-8 pb-16">
      {/* Header & Goal Progress Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              Content Calendar &amp; Publishing Schedule
            </h1>
          </div>
          <p className="text-ink-mute text-sm mt-1">
            Maintain consistent publishing consistency across technical blogs, daily dev logs, and social channels.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/social"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-card hover:bg-card2 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 transition active:scale-95 shadow-sm"
          >
            <FaShareAlt className="text-xs" />
            <span>Social Post</span>
          </Link>

          <Link
            href="/admin/journal/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-card hover:bg-card2 text-cyan hover:text-cyan border border-cyan/30 transition active:scale-95 shadow-sm"
          >
            <FaBookOpen className="text-xs" />
            <span>New Dev Log</span>
          </Link>

          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-deep hover:bg-cyan-deep text-ink shadow-sm transition active:scale-95"
          >
            <HiSparkles className="text-sm" />
            <span>Schedule / Write Post</span>
          </Link>
        </div>
      </div>

      {/* Weekly Targets & Scheduled Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Goals Card */}
        <div className="lg:col-span-2 bg-card/90 border border-line-soft rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-ink-soft uppercase tracking-wider flex items-center gap-2">
              <FaFire className="text-amber-400" />
              This Week's Publishing
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Blog Posts This Week */}
            <div className="bg-bg/70 border border-line-soft/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-soft font-medium">📝 Blog Articles</span>
                <span className="font-bold text-cyan">{weeklyStats.blogsPublished} published</span>
              </div>
              <p className="text-[11px] text-ink-mute">
                Blog articles published so far this week (Sunday–Saturday).
              </p>
            </div>

            {/* Dev Logs This Week */}
            <div className="bg-bg/70 border border-line-soft/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-soft font-medium">📓 Dev Journal Logs</span>
                <span className="font-bold text-amber-400">{weeklyStats.logsPublished} published</span>
              </div>
              <p className="text-[11px] text-ink-mute">
                Dev journal logs published so far this week (Sunday–Saturday).
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Scheduled Queue Card */}
        <div className="bg-card/90 border border-line-soft rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-ink-soft uppercase tracking-wider flex items-center gap-2">
              <FaClock className="text-blue-400" />
              Scheduled Queue ({scheduledQueue.length})
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 font-semibold border border-blue-500/30">
              Auto-Publishing
            </span>
          </div>

          {scheduledQueue.length === 0 ? (
            <div className="py-6 text-center text-xs text-ink-mute space-y-2">
              <p>No posts in queue right now.</p>
              <Link
                href="/admin/posts/new"
                className="inline-block text-cyan hover:text-cyan font-medium"
              >
                + Schedule a new draft →
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
              {scheduledQueue.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="bg-bg/80 border border-blue-500/20 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-ink truncate" title={item.title}>
                      {item.title}
                    </p>
                    <p className="text-[10px] text-blue-400 font-mono mt-0.5">
                      ⏰ {new Date(item.date).toLocaleDateString([], { month: "short", day: "numeric" })} at{" "}
                      {new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <Link
                    href={`/admin/posts/${item.id.replace("post-", "")}/edit`}
                    className="p-1.5 rounded-lg bg-card2 hover:bg-card2 text-ink-soft hover:text-ink transition shrink-0"
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
      <div className="bg-card border border-line-soft rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-ink tracking-tight">{monthName}</h2>
            <button
              type="button"
              onClick={goToToday}
              className="px-2.5 py-1 text-xs rounded-lg bg-card2 hover:bg-card2 text-ink-soft hover:text-ink border border-line transition"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 rounded-xl bg-card2 hover:bg-card2 text-ink-soft hover:text-ink transition"
              title="Previous Month"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-xl bg-card2 hover:bg-card2 text-ink-soft hover:text-ink transition"
              title="Next Month"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-line-soft/80">
          <div className="flex items-center gap-1.5 text-ink-mute">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Published Blog</span>
          </div>
          <div className="flex items-center gap-1.5 text-ink-mute">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Scheduled Post</span>
          </div>
          <div className="flex items-center gap-1.5 text-ink-mute">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span>Draft Article</span>
          </div>
          <div className="flex items-center gap-1.5 text-ink-mute">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Dev Journal Log</span>
          </div>
        </div>

        {/* 7-Day Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-ink-mute py-1">
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
                    ? "bg-cyan/10 border-cyan/50 shadow-sm"
                    : dayObj.isCurrentMonth
                    ? "bg-bg/60 border-line-soft/80 hover:border-line"
                    : "bg-bg/20 border-line-soft opacity-40 hover:opacity-75"
                } ${hasScheduled ? "ring-1 ring-blue-500/40" : ""}`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      dayObj.isToday
                        ? "bg-cyan-deep text-ink"
                        : dayObj.isCurrentMonth
                        ? "text-ink-soft"
                        : "text-ink-mute"
                    }`}
                  >
                    {dayObj.date.getDate()}
                  </span>

                  {/* Add icon on hover */}
                  <span className="opacity-0 group-hover:opacity-100 text-ink-mute hover:text-cyan text-[10px] transition">
                    <FaPlus />
                  </span>
                </div>

                {/* Event Pills */}
                <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => {
                    let pillStyle = "bg-card2 text-ink-soft";
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
                    <div className="text-[9px] text-ink-mute font-semibold px-1">
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
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedDayEvents(null)}
        >
          <div
            className="bg-card border border-line-soft rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-sm animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div>
                <h3 className="text-base font-bold text-ink flex items-center gap-2">
                  <FaCalendarAlt className="text-cyan text-sm" />
                  {new Date(selectedDayEvents.dateStr + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-xs text-ink-mute mt-0.5">
                  {selectedDayEvents.events.length} publication(s) on this date
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayEvents(null)}
                className="w-8 h-8 rounded-lg bg-card2 hover:bg-card2 text-ink-mute hover:text-ink flex items-center justify-center transition"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {selectedDayEvents.events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-bg border border-line-soft rounded-xl p-3.5 space-y-2"
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
                    <span className="text-[11px] text-ink-mute font-mono">
                      {new Date(ev.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-ink">{ev.title}</h4>

                  <div className="flex items-center justify-between pt-2 border-t border-line-soft/80 text-xs">
                    {ev.type === "blog" && ev.slug && ev.status === "published" ? (
                      <Link
                        href={`/blog/${ev.slug}`}
                        target="_blank"
                        className="text-ink-mute hover:text-ink inline-flex items-center gap-1"
                      >
                        <span>View Live</span>
                        <FaExternalLinkAlt className="text-[10px]" />
                      </Link>
                    ) : (
                      <span className="text-ink-mute text-[11px]">Internal Entry</span>
                    )}

                    <Link
                      href={
                        ev.type === "journal"
                          ? `/journal/${ev.date.slice(0, 10)}`
                          : `/admin/posts/${ev.id.replace("post-", "")}/edit`
                      }
                      className="text-cyan hover:text-cyan font-medium inline-flex items-center gap-1"
                    >
                      <span>{ev.type === "journal" ? "View Entry" : "Edit Entry"}</span>
                      <FaPen className="text-[10px]" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-line-soft flex items-center justify-between">
              <Link
                href={`/admin/posts/new?scheduleDate=${selectedDayEvents.dateStr}T10:00`}
                className="px-4 py-2 bg-cyan-deep hover:bg-cyan-deep text-ink rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-sm"
              >
                <FaPlus className="text-xs" />
                <span>Schedule New Post for this Date</span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedDayEvents(null)}
                className="px-3.5 py-2 bg-card2 hover:bg-card2 text-ink-soft rounded-xl text-xs transition"
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
