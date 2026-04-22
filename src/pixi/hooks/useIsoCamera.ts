import { useEffect } from "react";
import { useCameraStore } from "../../store/camera.store";

export function useIsoCamera() {
  const { x, y, setCameraPosition, setZoom, zoom } = useCameraStore();

  useEffect(() => {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      // Only drag with middle or right click, or if we want left click dragging
      // Let's enable left click drag for now for ease of testing
      if (e.target instanceof HTMLCanvasElement) {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;

      lastX = e.clientX;
      lastY = e.clientY;

      // Update camera position
      // The state in store is the camera position, so to move map left (dx < 0), camera x increases.
      // Wait, let's just directly set container offset
      const currentX = useCameraStore.getState().x;
      const currentY = useCameraStore.getState().y;

      setCameraPosition(currentX + dx, currentY + dy);
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
       const currentZoom = useCameraStore.getState().zoom;
       const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
       const newZoom = Math.max(0.2, Math.min(3, currentZoom + zoomDelta));
       setZoom(newZoom);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [setCameraPosition, setZoom]);
}
