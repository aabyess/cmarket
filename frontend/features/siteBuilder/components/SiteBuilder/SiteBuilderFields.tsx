"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Plus, X } from "lucide-react";
import { uploadImage } from "@/features/siteBuilder/upload";
import { cn } from "@/utils/cn";

const INPUT_CLASS =
	"w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]";

const LABEL_CLASS = "mb-1.5 block text-xs font-medium text-[#374151]";

type SiteBuilderTextFieldProps = {
	label: string;
	value: string;
	placeholder?: string;
	onChange: (value: string) => void;
};

export function SiteBuilderTextField({
	label,
	value,
	placeholder,
	onChange,
}: SiteBuilderTextFieldProps): React.JSX.Element {
	return (
		<div>
			<label className={LABEL_CLASS}>{label}</label>
			<input
				type="text"
				value={value}
				placeholder={placeholder}
				onChange={(e) => onChange(e.target.value)}
				className={INPUT_CLASS}
			/>
		</div>
	);
}

type SiteBuilderTextAreaFieldProps = {
	label: string;
	value: string;
	placeholder?: string;
	rows?: number;
	onChange: (value: string) => void;
};

export function SiteBuilderTextAreaField({
	label,
	value,
	placeholder,
	rows = 5,
	onChange,
}: SiteBuilderTextAreaFieldProps): React.JSX.Element {
	return (
		<div>
			<label className={LABEL_CLASS}>{label}</label>
			<textarea
				value={value}
				placeholder={placeholder}
				rows={rows}
				onChange={(e) => onChange(e.target.value)}
				className={cn(INPUT_CLASS, "resize-none leading-relaxed")}
			/>
		</div>
	);
}

type SiteBuilderTagFieldProps = {
	label: string;
	values: string[];
	placeholder?: string;
	onChange: (values: string[]) => void;
};

export function SiteBuilderTagField({
	label,
	values,
	placeholder,
	onChange,
}: SiteBuilderTagFieldProps): React.JSX.Element {
	const [draft, setDraft] = useState("");

	function handleAdd(): void {
		const next = draft.trim();
		setDraft("");
		if (!next || values.includes(next)) return;
		onChange([...values, next]);
	}

	return (
		<div>
			<label className={LABEL_CLASS}>{label}</label>
			<div className="mb-2.5 flex gap-2">
				<input
					type="text"
					value={draft}
					placeholder={placeholder}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.nativeEvent.isComposing) {
							e.preventDefault();
							handleAdd();
						}
					}}
					className={cn(INPUT_CLASS, "flex-1")}
				/>
				<button
					type="button"
					onClick={handleAdd}
					className="shrink-0 rounded-lg bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563EB]">
					추가
				</button>
			</div>
			<div className="flex flex-wrap gap-2">
				{values.map((value) => (
					<span
						key={value}
						className="flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#3B82F6]">
						{value}
						<button type="button" onClick={() => onChange(values.filter((v) => v !== value))}>
							<X size={12} />
						</button>
					</span>
				))}
			</div>
		</div>
	);
}

type SiteBuilderImageFieldProps = {
	label: string;
	value: string;
	hint?: string;
	onChange: (value: string) => void;
};

export function SiteBuilderImageField({
	label,
	value,
	hint,
	onChange,
}: SiteBuilderImageFieldProps): React.JSX.Element {
	const [isUploading, setIsUploading] = useState(false);

	async function handleUpload(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		try {
			onChange(await uploadImage(file, "product-images", "site"));
		} catch {
			alert("이미지 업로드 중 오류가 발생했습니다.");
		} finally {
			setIsUploading(false);
		}
	}

	return (
		<div>
			<label className={LABEL_CLASS}>{label}</label>
			<div className="flex items-center gap-3">
				<label className="flex size-16 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] transition-colors hover:border-[#3B82F6]">
					{isUploading ? (
						<Loader2 size={18} className="animate-spin text-[#9CA3AF]" />
					) : value ? (
						<Image src={value} alt="" width={64} height={64} className="size-full object-cover" />
					) : (
						<ImageIcon size={18} className="text-[#9CA3AF]" />
					)}
					<input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
				</label>
				<div className="min-w-0">
					{hint && <p className="text-xs text-[#9CA3AF]">{hint}</p>}
					{value && (
						<button
							type="button"
							onClick={() => onChange("")}
							className="mt-1 text-xs text-[#DC2626] hover:underline">
							이미지 제거
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

type SiteBuilderImageListFieldProps = {
	label: string;
	values: string[];
	onChange: (values: string[]) => void;
};

export function SiteBuilderImageListField({
	label,
	values,
	onChange,
}: SiteBuilderImageListFieldProps): React.JSX.Element {
	const [isUploading, setIsUploading] = useState(false);

	async function handleUpload(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		try {
			onChange([...values, await uploadImage(file, "product-images", "site")]);
		} catch {
			alert("이미지 업로드 중 오류가 발생했습니다.");
		} finally {
			setIsUploading(false);
		}
	}

	return (
		<div>
			<label className={LABEL_CLASS}>{label}</label>
			<div className="flex flex-wrap gap-2">
				{values.map((url) => (
					<div key={url} className="group relative size-16 overflow-hidden rounded-lg">
						<Image src={url} alt="" width={64} height={64} className="size-full object-cover" />
						<button
							type="button"
							onClick={() => onChange(values.filter((v) => v !== url))}
							className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
							<X size={14} className="text-white" />
						</button>
					</div>
				))}
				<label className="flex size-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[#E5E7EB] bg-white transition-colors hover:border-[#3B82F6]">
					{isUploading ? (
						<Loader2 size={16} className="animate-spin text-[#9CA3AF]" />
					) : (
						<Plus size={16} className="text-[#9CA3AF]" />
					)}
					<input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
				</label>
			</div>
		</div>
	);
}

type SiteBuilderSelectFieldProps<T extends string> = {
	label: string;
	value: T;
	options: { value: T; label: string }[];
	onChange: (value: T) => void;
};

export function SiteBuilderSelectField<T extends string>({
	label,
	value,
	options,
	onChange,
}: SiteBuilderSelectFieldProps<T>): React.JSX.Element {
	return (
		<div>
			<label className={LABEL_CLASS}>{label}</label>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value as T)}
				className={INPUT_CLASS}>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}
