import type { CameraState } from './camera.types';

export function smoothFollow(camera: CameraState, target: { x: number; y: number }, dt: number, rate = 5.0): CameraState {
	const alpha = 1 - Math.exp(-rate * dt);
	const nx = camera.x + (target.x - camera.x) * alpha;
	const ny = camera.y + (target.y - camera.y) * alpha;
	return { ...camera, x: nx, y: ny };
}

export function centerCamera(camera: CameraState, target: { x: number; y: number }): CameraState {
	return { ...camera, x: target.x, y: target.y };
}


