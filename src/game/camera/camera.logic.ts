import type { CameraState } from './camera.types';

export function smoothFollow(camera: CameraState, target: { x: number; y: number }, smoothing = 0.15): CameraState {
	const nx = camera.x + (target.x - camera.x) * smoothing;
	const ny = camera.y + (target.y - camera.y) * smoothing;
	return { ...camera, x: nx, y: ny };
}

export function centerCamera(camera: CameraState, target: { x: number; y: number }): CameraState {
	return { ...camera, x: target.x, y: target.y };
}


