"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Calendar as CalendarIcon, MoreHorizontal, X, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/Modal";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Mock Data
// TODO: Fetch events from backend
const INITIAL_EVENTS: any[] = [];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState(INITIAL_EVENTS);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventTime, setNewEventTime] = useState("09:00 AM");
    const [newEventType, setNewEventType] = useState<"work" | "meeting" | "personal">("personal");

    // Menu State
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

    const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);

    const closeAllPickers = () => {
        setIsMonthPickerOpen(false);
        setIsYearPickerOpen(false);
        setActiveMenuId(null);
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const daysArray = [];
        for (let i = 0; i < firstDayOfMonth; i++) daysArray.push(null);
        for (let i = 1; i <= daysInMonth; i++) daysArray.push(new Date(year, month, i));
        return daysArray;
    };

    const calendarDays = getDaysInMonth(currentDate);

    const handleAddEvent = () => {
        if (newEventTitle.trim()) {
            const newEvent = {
                id: Date.now(),
                title: newEventTitle,
                time: newEventTime,
                type: newEventType,
                date: selectedDate.getDate(),
                month: selectedDate.getMonth()
            };
            setEvents([...events, newEvent]);

            // Reset and close
            setIsModalOpen(false);
            setNewEventTitle("");
            setNewEventTime("09:00 AM");
            setNewEventType("personal");
        }
    };

    const selectedEvents = events.filter(e =>
        e.date === selectedDate.getDate() &&
        e.month === selectedDate.getMonth()
    );

    return (
        <div className="p-4 md:p-6 xl:p-8 flex-1 flex gap-4 md:gap-6 xl:gap-8 flex-col lg:flex-row min-h-[calc(100dvh-4rem)]">
            {/* Main Calendar View */}
            <div className="flex-1 bg-white rounded-[2.5rem] p-4 md:p-8 shadow-sm border border-gray-100 flex flex-col h-full relative z-0">
                {/* Decorative blob needs its own container to clip it without clipping dropdowns if possible, or we rely on the parent rounded corners. 
                    Actually, if we remove overflow-hidden, the blob might bleed out. 
                    Let's use a wrapper for the blob or just let Z-index handle the menu. 
                    If we remove overflow-hidden, the dropdowns will show. 
                */}
                <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 relative z-20 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-wrap items-baseline gap-2 md:gap-6 relative">
                            {/* Month Picker */}
                            <div className="relative">
                                <button
                                    onClick={() => { setIsMonthPickerOpen(!isMonthPickerOpen); setIsYearPickerOpen(false); }}
                                    className="text-3xl md:text-4xl font-black tracking-tight hover:text-primary transition-colors flex items-center gap-2"
                                >
                                    {months[currentDate.getMonth()]}
                                </button>
                                <AnimatePresence>
                                    {isMonthPickerOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsMonthPickerOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar p-2"
                                            >
                                                {months.map((m, i) => (
                                                    <button
                                                        key={m}
                                                        onClick={() => {
                                                            setCurrentDate(new Date(currentDate.getFullYear(), i, 1));
                                                            setIsMonthPickerOpen(false);
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all",
                                                            currentDate.getMonth() === i ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700"
                                                        )}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Year Picker */}
                            <div className="relative">
                                <button
                                    onClick={() => { setIsYearPickerOpen(!isYearPickerOpen); setIsMonthPickerOpen(false); }}
                                    className="text-3xl md:text-4xl font-black tracking-tight text-gray-300 hover:text-primary transition-colors flex items-center gap-2"
                                >
                                    {currentDate.getFullYear()}
                                </button>
                                <AnimatePresence>
                                    {isYearPickerOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsYearPickerOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute top-full left-0 mt-2 w-32 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar p-2"
                                            >
                                                {years.map(y => (
                                                    <button
                                                        key={y}
                                                        onClick={() => {
                                                            setCurrentDate(new Date(y, currentDate.getMonth(), 1));
                                                            setIsYearPickerOpen(false);
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all",
                                                            currentDate.getFullYear() === y ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700"
                                                        )}
                                                    >
                                                        {y}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 self-end md:self-auto">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentDate(new Date())}
                            className="rounded-full font-bold px-4 h-10 md:h-12 border-gray-100 hover:bg-gray-50 text-xs md:text-sm"
                        >
                            Today
                        </Button>
                        <div className="flex gap-1 md:gap-2">
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-7 mb-4 text-center border-b border-gray-50 pb-4">
                    {days.map(day => (
                        <div key={day} className="font-bold text-gray-400 uppercase text-xs tracking-widest">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 grid-rows-5 gap-3 flex-1 relative z-10 py-2">
                    {calendarDays.map((date, idx) => {
                        const dayEvents = date ? events.filter(e => e.date === date.getDate() && e.month === date.getMonth()) : [];
                        const isSelected = date && date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth();
                        const isToday = date && date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth();

                        return (
                            <div
                                key={idx}
                                onClick={() => date && setSelectedDate(date)}
                                className={cn(
                                    "p-3 rounded-xl relative group transition-all duration-300 cursor-pointer flex flex-col items-start justify-between min-h-[80px]",
                                    !date ? "bg-transparent cursor-default border-none" : "hover:bg-gray-50 border border-transparent",
                                    isSelected ? "bg-black text-white shadow-xl scale-105 z-10 hover:bg-black" : "bg-white border-gray-100",
                                )}
                            >
                                {date && (
                                    <>
                                        <div className="flex justify-between w-full items-start">
                                            <span className={cn(
                                                "font-bold text-lg h-8 w-8 flex items-center justify-center rounded-full transition-colors",
                                                isToday && !isSelected ? "bg-primary text-black" : "",
                                            )}>
                                                {date.getDate()}
                                            </span>
                                        </div>

                                        {/* Event Dots */}
                                        <div className="flex gap-1 mt-auto">
                                            {dayEvents.slice(0, 3).map((ev, i) => (
                                                <div key={i} className={cn(
                                                    "h-1.5 w-1.5 rounded-full shadow-sm",
                                                    ev.type === "work" ? "bg-blue-400" : ev.type === "meeting" ? "bg-purple-400" : "bg-primary",
                                                    isSelected ? "ring-1 ring-white/20" : ""
                                                )} />
                                            ))}
                                            {dayEvents.length > 3 && <div className="text-[8px] font-bold opacity-50">+{dayEvents.length - 3}</div>}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar Details */}
            <div className="w-full lg:w-96 flex flex-col gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex-1 border border-gray-100 flex flex-col">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none" />

                    <div className="relative z-10 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-6xl font-black mb-1 leading-none tracking-tighter text-foreground">{selectedDate.getDate()}</h2>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs ml-1">{months[selectedDate.getMonth()]}</p>
                            </div>
                            <button className="h-10 w-10 text-gray-400 hover:text-black transition-colors flex items-center justify-center rounded-full hover:bg-gray-50">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <h3 className="font-bold text-[10px] text-gray-400 uppercase tracking-widest mb-4">Schedule for the day</h3>

                            <AnimatePresence mode="popLayout">
                                {selectedEvents.length > 0 ? (
                                    selectedEvents.map((ev) => (
                                        <motion.div
                                            key={ev.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="group flex gap-4 items-start p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 cursor-pointer relative"
                                        >
                                            <span className="text-[10px] font-mono font-black text-gray-400 mt-1 min-w-[65px] group-hover:text-black transition-colors">{ev.time}</span>
                                            <div className="border-l-2 border-gray-100 pl-4 group-hover:border-primary transition-colors flex-1">
                                                <h4 className="font-bold text-sm text-foreground mb-0.5">{ev.title}</h4>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "h-1.5 w-1.5 rounded-full",
                                                        ev.type === "work" ? "bg-blue-400" : ev.type === "meeting" ? "bg-purple-400" : "bg-primary"
                                                    )} />
                                                    <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">{ev.type}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenuId(activeMenuId === ev.id ? null : ev.id);
                                                }}
                                                className="h-8 w-8 rounded-full flex items-center justify-center text-gray-300 hover:text-black hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>

                                            {/* Action Menu */}
                                            <AnimatePresence>
                                                {activeMenuId === ev.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                            className="absolute right-4 top-12 w-48 bg-white rounded-[1.5rem] shadow-2xl border border-gray-100 z-50 overflow-hidden p-1"
                                                        >
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}
                                                                className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-3 rounded-xl"
                                                            >
                                                                <div className="h-6 w-6 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                                                    <Clock size={14} />
                                                                </div>
                                                                Edit Event
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }}
                                                                className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-3 rounded-xl"
                                                            >
                                                                <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary-foreground">
                                                                    <Star size={14} />
                                                                </div>
                                                                Mark Priority
                                                            </button>
                                                            <div className="h-px bg-gray-50 my-1 mx-2" />
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEvents(events.filter(item => item.id !== ev.id));
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-red-50 text-red-500 transition-colors flex items-center gap-3 rounded-xl"
                                                            >
                                                                <div className="h-6 w-6 rounded-lg bg-red-50 flex items-center justify-center text-red-400">
                                                                    <X size={14} />
                                                                </div>
                                                                Delete
                                                            </button>
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm font-medium gap-3">
                                        <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center">
                                            <CalendarIcon size={24} className="opacity-20" />
                                        </div>
                                        <p>No events today.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full mt-8 bg-black text-white font-bold h-14 rounded-2xl hover:bg-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center"
                        >
                            <Plus size={18} className="mr-2" />
                            Add New Event
                        </Button>
                    </div>
                </div>
            </div>

            {/* Create Event Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Schedule New Event"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={handleAddEvent} className="rounded-xl font-bold bg-black text-white px-6" disabled={!newEventTitle.trim()}>Save Event</Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Event Title</label>
                        <input
                            type="text"
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            placeholder="e.g. Brainstorming session"
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 ring-primary outline-none transition-all font-bold placeholder:text-gray-300"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Time</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                <input
                                    type="text"
                                    value={newEventTime}
                                    onChange={(e) => setNewEventTime(e.target.value)}
                                    placeholder="09:00 AM"
                                    className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 ring-primary outline-none transition-all font-bold"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Type</label>
                            <select
                                value={newEventType}
                                onChange={(e: any) => setNewEventType(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 ring-primary outline-none transition-all font-bold appearance-none cursor-pointer"
                            >
                                <option value="personal">Personal</option>
                                <option value="work">Work</option>
                                <option value="meeting">Meeting</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Selected Date</p>
                        <p className="font-black text-lg">{selectedDate.getDate()} {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
