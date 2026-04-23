import type { CameraState } from './camera.types';

export function applyPan(camera: CameraState, deltaX: number, deltaY: number, invertY = false): CameraState {
	const dy = invertY ? -deltaY : deltaY;
	return { ...camera, x: camera.x - deltaX / camera.zoom, y: camera.y - dy / camera.zoom };
}

export function applyInertia(position: { x: number; y: number }, velocity: { x: number; y: number }, friction = 0.9) {
	return { x: position.x + velocity.x, y: position.y + velocity.y, velocity: { x: velocity.x * friction, y: velocity.y * friction } } as any;
}


