import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
export const SignaturePad = forwardRef(function SignaturePad(_, ref) {
  const canvas = useRef(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  useEffect(() => {
    const c = canvas.current;
    const resize = () => {
      const r = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      const ctx = c.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#1e262a";
      hasInk.current = false;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const pos = (e) => {
    const r = canvas.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  useImperativeHandle(ref, () => ({
    clear() {
      const c = canvas.current;
      c.getContext("2d").clearRect(0, 0, c.width, c.height);
      hasInk.current = false;
    },
    toDataURL: () => (hasInk.current ? canvas.current.toDataURL("image/png") : null),
  }));
  return _jsx("canvas", {
    ref: canvas,
    "aria-label": "\u00C1rea de assinatura",
    className: "h-40 w-full touch-none rounded-lg border border-dashed border-input bg-muted/40",
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      drawing.current = true;
      const ctx = canvas.current.getContext("2d");
      const [x, y] = pos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    },
    onPointerMove: (e) => {
      if (!drawing.current) return;
      const ctx = canvas.current.getContext("2d");
      const [x, y] = pos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
      hasInk.current = true;
    },
    onPointerUp: () => (drawing.current = false),
    onPointerLeave: () => (drawing.current = false),
  });
});
