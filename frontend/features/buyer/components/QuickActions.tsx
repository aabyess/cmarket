"use client";

import { Plus, Eye } from "lucide-react";

export function QuickActions() {
	return (
		<div className="flex flex-col sm:flex-row gap-3">
			<button className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg">
				<Plus size={20} />
				<span>새 공고 등록</span>
			</button>
			<button className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors shadow-md hover:shadow-lg">
				<Eye size={20} />
				<span>모든 공고 보기</span>
			</button>
		</div>
	);
}