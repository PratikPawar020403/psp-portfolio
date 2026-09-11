import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import certificateSource from "./sources/3d-paper-certificate.html?raw";

export type ThreeDPaperVariant = "certificate" | string;

export type ThreeDPaperProps = {
  className?: string;
  style?: CSSProperties;
  variant?: ThreeDPaperVariant;
  imageUrl?: string;
};

export function ThreeDPaper({ className = "", style, variant = "certificate", imageUrl }: ThreeDPaperProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [documentVisible, setDocumentVisible] = useState(() => (
    typeof document === "undefined" || !document.hidden
  ));
  const [hostVisible, setHostVisible] = useState(true);
  const [ready, setReady] = useState(false);

  const srcDoc = useMemo(() => {
    let source = certificateSource;
    if (imageUrl) {
      source = source.replace('/*CUSTOM_IMAGE_URL*/ ""', `/*CUSTOM_IMAGE_URL*/ ${JSON.stringify(imageUrl)}`);
    }
    return source;
  }, [imageUrl]);

  useEffect(() => {
    if (ready && iframeRef.current?.contentWindow && imageUrl) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SET_IMAGE',
        url: imageUrl,
      }, '*');
    }
  }, [ready, imageUrl]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      setHostVisible(entry?.isIntersecting ?? true);
    }, { rootMargin: "80px" });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const update = () => setDocumentVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  const mounted = hostVisible && documentVisible;

  useEffect(() => {
    setReady(false);
  }, [mounted, variant, imageUrl]);

  return (
    <div
      ref={hostRef}
      className={`threeui-background three-d-paper${className ? ` ${className}` : ""}`}
      role="group"
      aria-label="Interactive translucent 3D paper certificate"
      data-state={!mounted ? "paused" : ready ? "ready" : "loading"}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "transparent",
        pointerEvents: "auto",
        ...style,
      }}
    >
      {mounted ? (
        <iframe
          ref={iframeRef}
          title="3D Paper — Certificate"
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          loading="eager"
          onLoad={() => setReady(true)}
          style={{
            position: "absolute",
            inset: 0,
            display: "block",
            width: "100%",
            height: "100%",
            border: 0,
            background: "transparent",
            opacity: ready ? 1 : 0,
            pointerEvents: ready ? "auto" : "none",
            transition: "opacity 240ms ease-out",
          }}
        />
      ) : null}
    </div>
  );
}
