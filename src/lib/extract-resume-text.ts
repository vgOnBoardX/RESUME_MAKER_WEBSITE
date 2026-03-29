const MAX_BYTES = 20 * 1024 * 1024;

function extension(file: File): string {
  const parts = file.name.toLowerCase().split(".");
  return parts.length > 1 ? (parts.pop() ?? "") : "";
}

function readAsTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Could not read this file."));
    reader.readAsText(file);
  });
}

async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .filter(Boolean)
      .join(" ");
    parts.push(line);
  }
  return parts.join("\n").trim();
}

async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

/**
 * Reads plain text, PDF, or Word (.docx). Legacy .doc is not supported in-browser.
 */
export async function extractResumeText(file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("File is too large (max 20 MB).");
  }

  const ext = extension(file);
  const type = file.type.toLowerCase();

  if (
    ext === "txt" ||
    ext === "md" ||
    ext === "csv" ||
    ext === "json" ||
    type.startsWith("text/")
  ) {
    return (await readAsTextFile(file)).trim();
  }

  if (ext === "pdf" || type === "application/pdf") {
    const buf = await file.arrayBuffer();
    return extractPdfText(buf);
  }

  if (
    ext === "docx" ||
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const buf = await file.arrayBuffer();
    return extractDocxText(buf);
  }

  if (ext === "doc" || type === "application/msword") {
    throw new Error(
      "Older Word .doc files cannot be read in the browser. Save the file as .docx or .pdf, or paste the text below."
    );
  }

  throw new Error("Unsupported file type. Use .pdf, .docx, or plain text.");
}
