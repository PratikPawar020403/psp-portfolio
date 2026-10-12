import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

let cachedCertificateSource: string | null = null;
let certificateSourcePromise: Promise<string> | null = null;

function loadCertificateSource(): Promise<string> {
  if (cachedCertificateSource !== null) {
    return Promise.resolve(cachedCertificateSource);
  }
  if (!certificateSourcePromise) {
    certificateSourcePromise = import("./sources/3d-paper-certificate.html?raw").then((mod) => {
      cachedCertificateSource = mod.default;
      return mod.default;
    });
  }
  return certificateSourcePromise;
}

export type ThreeDPaperVariant = "certificate" | string;

export type ThreeDPaperProps = {
  className?: string;
  style?: CSSProperties;
  variant?: ThreeDPaperVariant;
  imageUrl?: string;
};

export function ThreeDPaper({ className = "", style, imageUrl }: ThreeDPaperProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hostVisible, setHostVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [rawSource, setRawSource] = useState<string | null>(cachedCertificateSource);

  useEffect(() => {
    if (!hostVisible || rawSource !== null) return;
    let cancelled = false;
    loadCertificateSource().then((src) => {
      if (!cancelled) setRawSource(src);
    });
    return () => {
      cancelled = true;
    };
  }, [hostVisible, rawSource]);

  const srcDoc = useMemo(() => {
    if (!rawSource) return null;
    let source = rawSource;
    if (imageUrl) {
      source = source.replace('/*CUSTOM_IMAGE_URL*/ ""', `/*CUSTOM_IMAGE_URL*/ ${JSON.stringify(imageUrl)}`);
    }
    return source;
  }, [rawSource, imageUrl]);

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
    if (!host || typeof window === "undefined") {
      setHostVisible(true);
      return undefined;
    }

    const slide = host.closest(".carousel-slide") as HTMLElement | null;
    if (!slide) {
      setHostVisible(true);
      return undefined;
    }

    const syncActive = () => {
      const visible = slide.dataset.active === "1";
      setHostVisible((prev) => {
        if (prev !== visible && !visible) {
          setReady(false);
        }
        return visible;
      });
    };

    syncActive();
    slide.addEventListener("slideactivechange", syncActive);
    return () => {
      slide.removeEventListener("slideactivechange", syncActive);
    };
  }, []);

  const mounted = hostVisible;

  const handleLoad = () => {
    setReady(true);
    if (iframeRef.current?.contentWindow && imageUrl) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "SET_IMAGE",
          url: imageUrl,
        },
        "*"
      );
    }
  };

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
        userSelect: "none",
        ...style,
      }}
    >
      {mounted && srcDoc ? (
        <iframe
          ref={iframeRef}
          title="3D Paper — Certificate"
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          loading="eager"
          onLoad={handleLoad}
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
