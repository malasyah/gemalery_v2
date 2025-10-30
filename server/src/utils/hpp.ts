import { CategoryCost } from "../models/CategoryCost";

export function calculateCostOfGoods(
	purchasePrice: number,
	categoryCost?: Pick<CategoryCost, "costItems">
): number {
	const base = purchasePrice || 0;
	const extra = (categoryCost?.costItems || []).reduce((sum, item) => sum + (item.amount || 0), 0);
	return Math.max(0, Math.round(base + extra));
}
