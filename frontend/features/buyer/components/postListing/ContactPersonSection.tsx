"use client";

import { useState } from "react";
import SectionWrapper from "@/features/buyer/components/postListing/SectionWrapper";
import ContactTable from "@/features/buyer/components/postListing/ContactTable";

interface Contact {
	id: string;
	type: "inquiry" | "contract";
	department: string;
	name: string;
	position: string;
	phone: string;
	email: string;
}

interface ContactPersonSectionProps {
	formState: any;
	setFormState: (state: any) => void;
}

export default function ContactPersonSection({ formState, setFormState }: ContactPersonSectionProps) {
	const [newContact, setNewContact] = useState<{
        type: "inquiry" | "contract";
        department: string;
        name: string;
        position: string;
        phone: string;
        email: string;
    }>({ type: "inquiry", department: "", name: "", position: "", phone: "", email: "" });

	const handleAddContact = () => {
		if (!newContact.name || !newContact.phone || !newContact.email) {
			alert("필수 항목을 입력해주세요.");
			return;
		}
		const contact: Contact = { id: Date.now().toString(), ...newContact };
		setFormState({ ...formState, contactPerson: { contacts: [...formState.contactPerson.contacts, contact] } });
		setNewContact({ type: "inquiry", department: "", name: "", position: "", phone: "", email: "" });
	};

	const handleRemoveContact = (id: string) => {
		setFormState({ ...formState, contactPerson: { contacts: formState.contactPerson.contacts.filter((c: Contact) => c.id !== id) } });
	};

	const handleUpdateContact = (id: string, updates: Partial<Contact>) => {
		setFormState({ ...formState, contactPerson: { contacts: formState.contactPerson.contacts.map((c: Contact) => c.id === id ? { ...c, ...updates } : c) } });
	};

	return (
		<SectionWrapper title="담당자 정보" subtitle="문의 및 계약 담당자 정보를 입력하세요">
			<div className="space-y-6">
				<div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
					<h3 className="text-sm font-semibold text-gray-900 mb-4">담당자 추가</h3>
					<div className="grid grid-cols-2 gap-4 mb-4">
						<select value={newContact.type} onChange={(e) => setNewContact({ ...newContact, type: e.target.value as "inquiry" | "contract" })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
							<option value="inquiry">문의 담당자</option>
							<option value="contract">계약 담당자</option>
						</select>
						<input type="text" placeholder="부서" value={newContact.department} onChange={(e) => setNewContact({ ...newContact, department: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
						<input type="text" placeholder="이름" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
						<input type="text" placeholder="직위" value={newContact.position} onChange={(e) => setNewContact({ ...newContact, position: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
						<input type="tel" placeholder="전화번호" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
						<input type="email" placeholder="이메일" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
					</div>
					<button onClick={handleAddContact} className="w-full px-4 py-2 bg-[#1B3A6B] text-white rounded-lg font-medium hover:bg-[#152d54] transition-colors">담당자 추가</button>
				</div>
				<ContactTable contacts={formState.contactPerson.contacts} onRemove={handleRemoveContact} onUpdate={handleUpdateContact} />
			</div>
		</SectionWrapper>
	);
}