export interface CameraViewport {
	width: number;
	height: number;
}

export interface CameraState {
	x: number;
	y: number;
	zoom: number;
	minZoom: number;
	maxZoom: number;
	viewport: CameraViewport;
}


