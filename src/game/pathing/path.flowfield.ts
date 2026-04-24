import { PathingGrid } from './path.types';

export function buildFlowfield(goal: { x: number; y: number }, grid: PathingGrid) {
	const { width, height, nodes } = grid;

	if (!Number.isInteger(width) || width <= 0) throw new RangeError("Grid width must be a positive integer");
	if (!Number.isInteger(height) || height <= 0) throw new RangeError("Grid height must be a positive integer");
	if (nodes.length !== width * height) throw new RangeError("Grid nodes array length must equal width * height");

	const gx = Math.floor(goal.x);
	const gy = Math.floor(goal.y);

	const dist = new Array(width * height).fill(Infinity);
	const idx = (x: number, y: number) => Math.floor(y) * width + Math.floor(x);
	const inBounds = (x: number, y: number) => {
		const fx = Math.floor(x);
		const fy = Math.floor(y);
		return fx >= 0 && fx < width && fy >= 0 && fy < height;
	};

	const q: Array<{ x: number; y: number }> = [];
	if (inBounds(gx, gy)) {
		const gi = idx(gx, gy);
		if (nodes[gi] !== 0) {
			dist[gi] = 0;
			q.push({ x: gx, y: gy });
		} else {
			// goal cell is blocked — find nearest walkable fallback (BFS)
			const visited = new Array(width * height).fill(false);
			const fbq: Array<{ x: number; y: number }> = [{ x: gx, y: gy }];
			visited[gi] = true;
			let fhead = 0;
			let found: { x: number; y: number } | null = null;
			while (fhead < fbq.length) {
				const p = fbq[fhead++]!;
				const neighbors = [
					{ x: p.x + 1, y: p.y },
					{ x: p.x - 1, y: p.y },
					{ x: p.x, y: p.y + 1 },
					{ x: p.x, y: p.y - 1 },
				];
				for (const n of neighbors) {
					if (!inBounds(n.x, n.y)) continue;
					const ni = idx(n.x, n.y);
					if (visited[ni]) continue;
					visited[ni] = true;
					if (nodes[ni] !== 0) {
						found = n;
						break;
					}
					fbq.push(n);
				}
				if (found) break;
			}
			if (found) {
				const fi = idx(found.x, found.y);
				dist[fi] = 0;
				q.push(found);
			} else {
				// no walkable tile found — return empty field that respects obstacles
				const field: Array<{ x: number; y: number } | null> = new Array(width * height).fill(null);
				return { dist, field, width, height };
			}
		}
	}

	let head = 0;
	while (head < q.length) {
		const p = q[head++]!;
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


