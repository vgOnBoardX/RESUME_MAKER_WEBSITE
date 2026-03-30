/**
 * Client-only: renders a DOM node to a downloadable PDF (A4).
 * Clones the node off-screen so layout is stable for html2canvas (avoids grid/hidden-column issues).
 */
export async function downloadResumeAsPdf(element: HTMLElement, baseName: string): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;
  const safe = baseName.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 120) || "resume";
  const filename = `${safe}.pdf`;

  // html2canvas runs on the main thread; lower scale makes the UI responsive sooner.
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const scale = Math.min(1.5, Math.max(1, dpr));

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.boxSizing = "border-box";
  clone.style.width = "794px";
  clone.style.maxWidth = "794px";
  clone.style.background = "#ffffff";
  clone.style.color = "#0a0a0a";
  clone.style.padding = "24px";

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;overflow:visible;background:#fff;pointer-events:none;";
  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    // Yield so React can paint `pdfLoading=true` before capture starts.
    await new Promise((r) => setTimeout(r, 0));

    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename,
        image: { type: "jpeg", quality: 0.92 },
        html2canvas: {
          scale,
          useCORS: false,
          allowTaint: false,
          logging: false,
          backgroundColor: "#ffffff",
          width: 794,
          windowWidth: 794,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(clone)
      .save();
  } finally {
    document.body.removeChild(host);
  }
}
