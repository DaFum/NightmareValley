import { useEffect, useRef } from "react";
import { useCameraStore } from "../../store/camera.store";

export function useIsoCamera() {
  const setCameraPosition = useCameraStore((state) => state.setCameraPosition);
  const setZoom = useCameraStore((state) => state.setZoom);
  const spacePressedRef = useRef(false);

  useEffect(() => {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const isTextInputActive = () => {
      const active = document.activeElement;
      if (!active) return false;
      const tag = active.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return true;
      if ((active as HTMLElement).isContentEditable) return true;
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTextInputActive()) {
        spacePressedRef.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") spacePressedRef.current = false;
    };

    const handleBlur = () => {
      spacePressedRef.current = false;
      isDragging = false;
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.target instanceof HTMLCanvasElement && (e.button === 1 || e.button === 2 || spacePressedRef.current)) {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
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
      e.preventDefault();
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!(e.target instanceof HTMLCanvasElement)) return;
      const currentZoom = useCameraStore.getState().zoom;
      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.2, Math.min(3, currentZoom + zoomDelta));
      setZoom(newZoom);
      e.preventDefault();
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (e.target instanceof HTMLCanvasElement) e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [setCameraPosition, setZoom, spacePressedRef]);

  return { spacePressedRef };
}
