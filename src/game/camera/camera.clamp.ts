import type { CameraState } from './camera.types';

export function clampCameraToBounds(camera: CameraState, worldWidth: number, worldHeight: number, tileSize: number): CameraState {
	// Clamp zoom first so position bounds are derived from the final zoom level.
	let nz = camera.zoom;
	if (nz < camera.minZoom) nz = camera.minZoom;
	if (nz > camera.maxZoom) nz = camera.maxZoom;

	const halfW = (camera.viewport.width / 2) / nz;
	const halfH = (camera.viewport.height / 2) / nz;

	const minX = halfW;
	const maxX = Math.max(halfW, worldWidth * tileSize - halfW);
	const minY = halfH;
	const maxY = Math.max(halfH, worldHeight * tileSize - halfH);

	const nx = Math.max(minX, Math.min(camera.x, maxX));
	const ny = Math.max(minY, Math.min(camera.y, maxY));

	return { ...camera, x: nx, y: ny, zoom: nz };
}


