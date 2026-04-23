import { PathingGrid } from './path.types';

export function buildFlowfield(goal: { x: number; y: number }, grid: PathingGrid) {
	const { width, height, nodes } = grid;
	const dist = new Array(width * height).fill(Infinity);
	const idx = (x: number, y: number) => y * width + x;
	const inBounds = (x: number, y: number) => x >= 0 && x < width && y >= 0 && y < height;

	const q: Array<{ x: number; y: number }> = [];
	if (inBounds(goal.x, goal.y)) {
		dist[idx(goal.x, goal.y)] = 0;
		q.push({ x: goal.x, y: goal.y });
	}

	while (q.length > 0) {
		const p = q.shift()!;
		const d = dist[idx(p.x, p.y)];
		const neighbors = [
			{ x: p.x + 1, y: p.y },
			{ x: p.x - 1, y: p.y },
			{ x: p.x, y: p.y + 1 },
			{ x: p.x, y: p.y - 1 },
		];
		for (const n of neighbors) {
			if (!inBounds(n.x, n.y)) continue;
			if (nodes[idx(n.x, n.y)] === 0) continue; // not walkable
			const ni = idx(n.x, n.y);
			if (dist[ni] > d + 1) {
				dist[ni] = d + 1;
				q.push(n);
			}
		}
	}

	// produce simple vector field: for each cell point to neighbor with lowest dist
	const field: Array<{ x: number; y: number } | null> = new Array(width * height).fill(null);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const i = idx(x, y);
			if (nodes[i] === 0 || !isFinite(dist[i])) continue;
			const neighbors = [
				{ x: x + 1, y },
				{ x: x - 1, y },
				{ x, y: y + 1 },
				{ x, y: y - 1 },
			];
			let best = null as any;
			let bestD = dist[i];
			for (const n of neighbors) {
				if (!inBounds(n.x, n.y)) continue;
				const nd = dist[idx(n.x, n.y)];
				if (nd < bestD) {
					bestD = nd;
					best = n;
				}
			}
			field[i] = best;
		}
	}

	return { dist, field, width, height };
}


