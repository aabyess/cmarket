"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { SignupCountry, TermDocument } from "@/features/auth/terms";
import { TERMS_UI_TEXT } from "@/features/auth/terms";

type SignupTermsDetailModalProps = {
	country: SignupCountry;
	term: TermDocument | null;
	onClose: () => void;
};

export function SignupTermsDetailModal({
	country,
	term,
	onClose,
}: SignupTermsDetailModalProps): React.JSX.Element {
	const text = TERMS_UI_TEXT[country];

	return (
		<AnimatePresence>
			{term && (
				<Dialog static open onClose={onClose} className="relative z-50">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="fixed inset-0 bg-black/40"
						aria-hidden="true"
					/>

					<div className="fixed inset-0 flex items-center justify-center p-4">
						<motion.div
							initial={{ opacity: 0, scale: 0.97, y: 8 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.97, y: 8 }}
							transition={{ duration: 0.18 }}
							className="w-full max-w-2xl">
							<DialogPanel className="flex max-h-[80vh] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
								<div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-6 py-4">
									<div className="min-w-0">
										<DialogTitle className="text-base font-semibold text-[#1F2937]">
											{term.label}
										</DialogTitle>
										<p className="mt-0.5 text-xs text-[#9CA3AF]">
											{text.version} {term.version} · {text.effective} {term.effectiveDate}
										</p>
									</div>
									<button
										onClick={onClose}
										aria-label={text.close}
										className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6]">
										<X size={16} />
									</button>
								</div>

								<div className="overflow-y-auto px-6 py-5">
									<p className="mb-5 rounded-xl bg-[#F9FAFB] px-4 py-3 text-sm leading-relaxed text-[#374151]">
										{term.summary}
									</p>

									{term.sections.map((section) => (
										<section key={section.heading} className="mb-5">
											<h3 className="mb-2 text-sm font-semibold text-[#1F2937]">
												{section.heading}
											</h3>
											{section.body.map((line, i) => (
												<p
													key={i}
													className="whitespace-pre-wrap text-sm leading-relaxed text-[#4B5563]">
													{line}
												</p>
											))}
										</section>
									))}

									{term.tables?.map((table) => (
										<section key={table.heading} className="mb-5">
											<h3 className="mb-2 text-sm font-semibold text-[#1F2937]">{table.heading}</h3>
											<div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
												<table className="w-full border-collapse text-left text-xs">
													<thead className="bg-[#F9FAFB]">
														<tr>
															{table.columns.map((column) => (
																<th
																	key={column}
																	className="whitespace-nowrap px-3 py-2.5 font-semibold text-[#374151]">
																	{column}
																</th>
															))}
														</tr>
													</thead>
													<tbody>
														{table.rows.map((row, i) => (
															<tr key={i} className="border-t border-[#F3F4F6]">
																{row.map((cell, j) => (
																	<td
																		key={j}
																		className="px-3 py-2.5 align-top leading-relaxed text-[#4B5563]">
																		{cell}
																	</td>
																))}
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</section>
									))}

									<p className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm leading-relaxed text-[#B45309]">
										{term.refusalNotice}
									</p>
								</div>
							</DialogPanel>
						</motion.div>
					</div>
				</Dialog>
			)}
		</AnimatePresence>
	);
}
