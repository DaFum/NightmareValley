import type { CameraState } from './camera.types';

export function applyZoom(camera: CameraState, delta: number, zoomToCursor?: { x: number; y: number }): CameraState {
	const factor = 1 + delta;
	let nz = camera.zoom * factor;
	if (nz < camera.minZoom) nz = camera.minZoom;
	if (nz > camera.maxZoom) nz = camera.maxZoom;

	// If zoomToCursor provided, adjust camera.x/y to keep cursor world position stable.
	if (zoomToCursor) {
		const worldX = camera.x + (zoomToCursor.x - camera.viewport.width / 2) / camera.zoom;
		const worldY = camera.y + (zoomToCursor.y - camera.viewport.height / 2) / camera.zoom;

		const nx = worldX - (zoomToCursor.x - camera.viewport.width / 2) / nz;
		const ny = worldY - (zoomToCursor.y - camera.viewport.height / 2) / nz;

		return { ...camera, zoom: nz, x: nx, y: ny };
	}

	return { ...camera, zoom: nz };
}


