"use client";

import { Button } from "@/components/ui/Button";

export function CalendarWidget() {
    return (
        <div className="space-y-8">
            {/* Calendar Widget mock */}
            <div className="bg-white p-5 md:p-6 xl:p-8 rounded-[3rem] shadow-float relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />

                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-black text-2xl">April 2026</h3>
                    <div className="flex gap-1">
                        <button className="h-8 w-8 hover:bg-gray-100 rounded-full flex items-center justify-center font-bold">←</button>
                        <button className="h-8 w-8 hover:bg-gray-100 rounded-full flex items-center justify-center font-bold">→</button>
                    </div>
                </div>

                {/* Days Row */}
                <div className="flex justify-between text-xs text-gray-400 mb-6 font-bold uppercase tracking-wider">
                    <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
                </div>
                {/* Dates Row Mock */}
                <div className="flex justify-between text-lg font-bold text-gray-800 items-center">
                    <span className="opacity-20">14</span>
                    <span className="opacity-20">15</span>
                    <span>16</span>
                    <span>17</span>
                    <span className="bg-black h-10 w-10 flex items-center justify-center rounded-2xl shadow-lg text-white transform scale-110">18</span>
                    <span>19</span>
                    <span>20</span>
                </div>

                <div className="mt-8 space-y-4">
                    {/* Event 1 */}
                    <div className="flex gap-4 items-start group cursor-pointer hover:bg-gray-50 p-2 rounded-2xl transition-colors -mx-2">
                        <div className="h-full pt-1">
                            <div className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_10px_theme(colors.purple.400)]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 group-hover:text-purple-500 transition-colors">Team Meeting</h4>
                            <p className="text-xs text-gray-500 font-medium">10:30 - 12:00 • Conference Room</p>
                        </div>
                    </div>

                    {/* Event 2 */}
                    <div className="flex gap-4 items-start group cursor-pointer hover:bg-gray-50 p-2 rounded-2xl transition-colors -mx-2">
                        <div className="h-full pt-1">
                            <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_10px_theme(colors.green.400)]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 group-hover:text-green-500 transition-colors">Supervisor Call</h4>
                            <p className="text-xs text-gray-500 font-medium">12:30 - 01:30 • Zoom</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Board Meeting Card */}
            <div className="bg-[#D4F268] p-8 rounded-[3rem] shadow-float text-black relative overflow-hidden group">
                {/* Decorative Blob */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />

                <h3 className="font-black text-2xl mb-1">Board Meeting</h3>
                <div className="flex items-center gap-2 text-xs font-bold opacity-60 mb-8">
                    <span>March 24 at 4:00 PM</span>
                </div>

                <div className="flex flex-col gap-3">
                    <Button size="sm" className="w-full rounded-xl bg-black text-white font-bold h-12 hover:scale-[1.02] shadow-none border-none">
                        Accept Invitation
                    </Button>
                    <Button size="sm" variant="ghost" className="w-full rounded-xl text-black/60 font-bold hover:bg-black/5 h-12">
                        Reschedule
                    </Button>
                </div>
            </div>
        </div>
    );
}
