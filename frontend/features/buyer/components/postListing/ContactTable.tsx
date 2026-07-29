"use client";

interface Contact {
	id: string;
	type: "inquiry" | "contract";
	department: string;
	name: string;
	position: string;
	phone: string;
	email: string;
}

interface ContactTableProps {
	contacts: Contact[];
	onRemove: (id: string) => void;
	onUpdate: (id: string, updates: Partial<Contact>) => void;
}

export default function ContactTable({ contacts, onRemove }: ContactTableProps) {
	if (contacts.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
				<p>아직 추가된 담당자가 없습니다.</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full border-collapse">
				<thead>
					<tr className="border-b border-gray-300 bg-gray-50">
						{["유형", "부서", "이름", "직위", "전화", "이메일", "작업"].map((th) => (
							<th key={th} className="px-4 py-3 text-left text-sm font-semibold text-gray-900">{th}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{contacts.map((contact) => (
						<tr key={contact.id} className="border-b border-gray-200 hover:bg-gray-50">
							<td className="px-4 py-3 text-sm">
								<span className={`px-2 py-1 rounded-full text-xs font-medium ${contact.type === "inquiry" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
									{contact.type === "inquiry" ? "문의" : "계약"}
								</span>
							</td>
							<td className="px-4 py-3 text-sm text-gray-900">{contact.department}</td>
							<td className="px-4 py-3 text-sm text-gray-900">{contact.name}</td>
							<td className="px-4 py-3 text-sm text-gray-900">{contact.position}</td>
							<td className="px-4 py-3 text-sm text-gray-900">{contact.phone}</td>
							<td className="px-4 py-3 text-sm text-gray-900">
								<a href={`mailto:${contact.email}`} className="text-indigo-600 hover:underline">{contact.email}</a>
							</td>
							<td className="px-4 py-3 text-center">
								<button onClick={() => onRemove(contact.id)} className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors">
									삭제
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}