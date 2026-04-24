import type { CameraState } from './camera.types';

export function applyZoom(camera: CameraState, delta: number, zoomToCursor?: { x: number; y: number }): CameraState {
	if (camera.zoom <= 0 || camera.minZoom <= 0) return camera;

	let factor = 1 + delta;
	factor = Math.max(0.1, Math.min(factor, 10)); // clamp to sane range

	let nz = camera.zoom * factor;
	if (nz < camera.minZoom) nz = camera.minZoom;
	if (nz > camera.maxZoom) nz = camera.maxZoom;

	if (nz === camera.zoom) return camera;

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


