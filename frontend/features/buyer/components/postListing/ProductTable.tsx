"use client";

interface Product {
	id: string;
	name: string;
	quantity: number;
	unit: string;
	unitPrice: number;
}

interface ProductTableProps {
	products: Product[];
	onRemove: (id: string) => void;
	onUpdate: (id: string, updates: Partial<Product>) => void;
}

export default function ProductTable({ products, onRemove, onUpdate }: ProductTableProps) {
	if (products.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
				<p>아직 추가된 제품이 없습니다.</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full border-collapse">
				<thead>
					<tr className="border-b border-gray-300 bg-gray-50">
						<th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">제품명</th>
						<th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">수량</th>
						<th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">단위</th>
						<th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">단가</th>
						<th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">합계</th>
						<th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">작업</th>
					</tr>
				</thead>
				<tbody>
					{products.map((product) => {
						const total = product.quantity * product.unitPrice;
						return (
							<tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
								<td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
								<td className="px-4 py-3 text-right text-sm text-gray-900">
									<input
										type="number"
										value={product.quantity}
										onChange={(e) => onUpdate(product.id, { quantity: parseInt(e.target.value) || 0 })}
										className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
									/>
								</td>
								<td className="px-4 py-3 text-right text-sm text-gray-900">
									<select
										value={product.unit}
										onChange={(e) => onUpdate(product.id, { unit: e.target.value })}
										className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
										{["EA", "BOX", "KG", "L"].map((u) => <option key={u}>{u}</option>)}
									</select>
								</td>
								<td className="px-4 py-3 text-right text-sm text-gray-900">
									<input
										type="number"
										value={product.unitPrice}
										onChange={(e) => onUpdate(product.id, { unitPrice: parseFloat(e.target.value) || 0 })}
										className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
									/>
								</td>
								<td className="px-4 py-3 text-right text-sm font-semibold text-[#1B3A6B]">
									₩{total.toLocaleString()}
								</td>
								<td className="px-4 py-3 text-center">
									<button
										onClick={() => onRemove(product.id)}
										className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors">
										삭제
									</button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}