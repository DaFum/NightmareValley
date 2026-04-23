import { create } from 'zustand';

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  setCameraPosition: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  x: 0,
  y: 0,
  zoom: 1,
  setCameraPosition: (x, y) => set({ x, y }),
  setZoom: (zoom) => set({ zoom }),
}));
