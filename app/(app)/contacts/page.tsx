"use client";

import { Search, MoreHorizontal, Phone, Mail, MessageSquare, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/ToastProvider";

const INITIAL_CONTACTS = [
    { id: 1, name: "Michael Scott", role: "Regional Manager", email: "michael@dundermifflin.com", phone: "555-0199", initials: "MS", color: "bg-blue-100 text-blue-700" },
    { id: 2, name: "Dwight Schrute", role: "Assistant to the RM", email: "dwight@dundermifflin.com", phone: "555-0123", initials: "DS", color: "bg-yellow-100 text-yellow-700" },
    { id: 3, name: "Jim Halpert", role: "Sales Representative", email: "jim@dundermifflin.com", phone: "555-0145", initials: "JH", color: "bg-green-100 text-green-700" },
    { id: 4, name: "Pam Beesly", role: "Receptionist", email: "pam@dundermifflin.com", phone: "555-0167", initials: "PB", color: "bg-pink-100 text-pink-700" },
    { id: 5, name: "Ryan Howard", role: "Temp", email: "ryan@dundermifflin.com", phone: "555-0189", initials: "RH", color: "bg-gray-100 text-gray-700" },
];

export default function ContactsPage() {
    const [contacts, setContacts] = useState(INITIAL_CONTACTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    // New Contact State
    const [newName, setNewName] = useState("");
    const [newRole, setNewRole] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPhone, setNewPhone] = useState("");

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddContact = () => {
        if (newName && newEmail) {
            const initials = newName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
            const newContact = {
                id: Date.now(),
                name: newName,
                role: newRole || "N/A",
                email: newEmail,
                phone: newPhone || "555-0000",
                initials,
                color: "bg-purple-100 text-purple-700"
            };
            setContacts([...contacts, newContact]);
            toast(`${newName} has been added to your contacts.`, "success");

            setIsModalOpen(false);
            setNewName("");
            setNewRole("");
            setNewEmail("");
            setNewPhone("");
        }
    };

    return (
        <div className="p-4 md:p-6 xl:p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl xl:text-5xl font-black mb-2">Contacts</h1>
                    <p className="text-gray-500 font-medium">Manage your team and client relationships.</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-black text-white rounded-full px-6 py-3 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                >
                    <UserPlus size={18} />
                    Add
                </Button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-gray-100 flex gap-4 items-center">
                    <div className="flex-1 bg-gray-50 rounded-full px-4 py-3 flex items-center gap-2 focus-within:ring-2 ring-black/10 transition-all">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent outline-none w-full font-medium text-sm text-gray-700 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="divide-y divide-gray-50">
                    {filteredContacts.map((contact) => (
                        <div key={contact.id} className="p-6 flex items-center gap-6 hover:bg-gray-50 transition-colors cursor-pointer group">
                            <div className={`h-12 w-12 rounded-full ${contact.color} flex items-center justify-center font-bold text-sm shrink-0`}>
                                {contact.initials}
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                <div>
                                    <h3 className="font-bold text-sm">{contact.name}</h3>
                                    <p className="text-xs text-gray-500">{contact.role}</p>
                                </div>
                                <div className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <Mail size={14} className="text-gray-400" />
                                    {contact.email}
                                </div>
                                <div className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <Phone size={14} className="text-gray-400" />
                                    {contact.phone}
                                </div>
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors">
                                    <MessageSquare size={14} />
                                </button>
                                <button className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-colors">
                                    <MoreHorizontal size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredContacts.length === 0 && (
                        <div className="p-12 text-center text-gray-400 font-medium">
                            No contacts found.
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Contact"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={handleAddContact} className="rounded-xl font-bold bg-black text-white" disabled={!newName || !newEmail}>Add Contact</Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g. Kelly Kapoor"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 ring-black outline-none transition-all font-medium"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Role / Job Title</label>
                        <input
                            type="text"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            placeholder="e.g. Customer Service"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 ring-black outline-none transition-all font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="kelly@dundermifflin.com"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 ring-black outline-none transition-all font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="text"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="555-0000"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 ring-black outline-none transition-all font-medium"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
