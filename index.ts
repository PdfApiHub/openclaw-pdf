import type { PluginEntry } from "@anthropic/openclaw-plugin-sdk";

const API_BASE = "https://pdfapihub.com/api";

async function callApi(
  endpoint: string,
  method: string,
  body: Record<string, unknown> | null,
  apiKey: string
): Promise<unknown> {
  const headers: Record<string, string> = { "CLIENT-API-KEY": apiKey };
  const opts: RequestInit = { method, headers };
  if (body) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${endpoint}`, opts);
  if (!res.ok) {
    const text = await res.text();
    let p: any;
    try { p = JSON.parse(text); } catch { throw new Error(`PDFAPIHub error (${res.status}): ${text}`); }
    throw new Error(`PDFAPIHub error (${res.status}): ${p.error || text}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  if (ct.includes("text/plain")) return { success: true, text: await res.text() };
  return { success: true, message: "Binary file returned", content_type: ct };
}

function getApiKey(config: Record<string, unknown>): string {
  const k = (config.apiKey as string) || "";
  if (!k) throw new Error("PDFAPIHub API key not configured. Add your key in plugin config (plugins.entries.pdf-toolkit.env.PDFAPIHUB_API_KEY). Get a free key at https://pdfapihub.com");
  return k;
}

function bb(params: Record<string, unknown>): Record<string, unknown> {
  const b: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) { if (v !== undefined && v !== null) b[k] = v; }
  return b;
}

const plugin: PluginEntry = {
  id: "pdf-toolkit",
  name: "PDF Toolkit",
  register(api) {

    // ═══════════════════════════════════════════
    // GENERATE
    // ═══════════════════════════════════════════

    api.registerTool({
      name: "generate_pdf",
      description: "Generate a PDF from HTML content or a public URL. Supports A4/Letter/Legal page sizes, Google Fonts, custom margins, landscape mode, dynamic {{placeholder}} substitution, template_id references, and multiple output formats.",
      parameters: { type: "object", properties: {
        url: { type: "string", description: "URL to convert to PDF." },
        html_content: { type: "string", description: "HTML to convert. Provide url or html_content." },
        css_content: { type: "string", description: "Optional CSS." },
        template_id: { type: "string", description: "Saved template UUID." },
        output_format: { type: "string", enum: ["url", "base64", "file"], description: "Default: 'url'." },
        paper_size: { type: "string", enum: ["A4", "A3", "A5", "Letter", "Legal", "Tabloid"] },
        landscape: { type: "boolean" },
        margin: { type: "object", properties: { top: { type: "string" }, right: { type: "string" }, bottom: { type: "string" }, left: { type: "string" } } },
        font: { type: "string", description: "Google Fonts, pipe-separated." },
        dynamic_params: { type: "object", additionalProperties: { type: "string" } },
        printBackground: { type: "boolean" },
        viewPortWidth: { type: "number" }, viewPortHeight: { type: "number" },
        wait_till: { type: "number", description: "Seconds to wait." },
        output_filename: { type: "string" },
      }},
      async execute(p, ctx) { return callApi("/v1/generatePdf", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "generate_image",
      description: "Generate a PNG image from HTML or URL. Custom dimensions, retina quality (2x/3x), full-page screenshots, cookie consent, Google Fonts, dynamic placeholders.",
      parameters: { type: "object", properties: {
        url: { type: "string" }, html_content: { type: "string" }, css_content: { type: "string" },
        output_format: { type: "string", enum: ["url", "base64", "both", "image"] },
        width: { type: "number" }, height: { type: "number" },
        deviceScaleFactor: { type: "number", description: "1-3. Use 2 for retina." },
        quality: { type: "number" }, full_page: { type: "boolean" },
        wait_until: { type: "string", enum: ["load", "domcontentloaded", "networkidle", "commit"] },
        wait_for_timeout: { type: "number" }, cookie_accept_text: { type: "string" },
        font: { type: "string" }, dynamic_params: { type: "object", additionalProperties: { type: "string" } },
      }},
      async execute(p, ctx) { return callApi("/v1/generateImage", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "generate_chart",
      description: "Generate a chart image using Chart.js. Types: bar, line, pie, doughnut, radar, polarArea, bubble, scatter.",
      parameters: { type: "object", properties: {
        chart_type: { type: "string", enum: ["line", "bar", "pie", "doughnut", "radar", "polarArea", "bubble", "scatter"] },
        data: { type: "object", description: "Chart.js data (labels + datasets)." },
        options: { type: "object" },
        width: { type: "number" }, height: { type: "number" },
        output_format: { type: "string", enum: ["url", "base64", "both", "image"] },
      }, required: ["chart_type", "data"] },
      async execute(p, ctx) { return callApi("/v1/generateChart", "POST", bb(p), getApiKey(ctx.config)); },
    });

    // ═══════════════════════════════════════════
    // CONVERT PDF → Other
    // ═══════════════════════════════════════════

    api.registerTool({
      name: "pdf_to_image",
      description: "Convert PDF pages to PNG/JPG/WebP images. Configurable DPI (72-300), page selection, resize, background color.",
      parameters: { type: "object", properties: {
        url: { type: "string" }, file: { type: "string" },
        page: { type: "number" }, pages: { type: "string" },
        image_format: { type: "string", enum: ["png", "jpg", "webp"] },
        dpi: { type: "number" }, quality: { type: "number" },
        width: { type: "number" }, height: { type: "number" },
        background_color: { type: "string" },
        output: { type: "string", enum: ["url", "base64", "both", "file"] },
      }},
      async execute(p, ctx) { return callApi("/v1/convert/pdf/image", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "pdf_to_docx",
      description: "Convert PDF to editable Word document (DOCX). Supports page selection.",
      parameters: { type: "object", properties: {
        url: { type: "string" }, file: { type: "string" }, pages: { type: "string" },
        output: { type: "string", enum: ["url", "base64", "file"] }, output_filename: { type: "string" },
      }},
      async execute(p, ctx) { return callApi("/v1/convert/pdf/docx", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "pdf_to_xlsx",
      description: "Extract tables from PDF into Excel (XLSX). One sheet per page.",
      parameters: { type: "object", properties: {
        url: { type: "string" }, file: { type: "string" }, pages: { type: "string" },
        output: { type: "string", enum: ["url", "base64", "file"] }, output_filename: { type: "string" },
      }},
      async execute(p, ctx) { return callApi("/v1/convert/pdf/xlsx", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "pdf_to_csv",
      description: "Extract tables from PDF into CSV format.",
      parameters: { type: "object", properties: {
        url: { type: "string" }, file: { type: "string" }, pages: { type: "string" },
        output: { type: "string", enum: ["url", "base64", "file"] }, output_filename: { type: "string" },
      }},
      async execute(p, ctx) { return callApi("/v1/convert/pdf/csv", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "pdf_to_text",
      description: "Extract plain text from PDF pages.",
      parameters: { type: "object", properties: {
        url: { type: "string" }, file: { type: "string" }, pages: { type: "string" },
        output: { type: "string", enum: ["url", "base64", "file"] },
      }},
      async execute(p, ctx) { return callApi("/v1/convert/pdf/txt", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "pdf_to_html",
      description: "Convert PDF pages to styled HTML.",
      parameters: { type: "object", properties: {
        url: { type: "string" }, file: { type: "string" }, pages: { type: "string" },
        output: { type: "string", enum: ["url", "base64", "file"] },
      }},
      async execute(p, ctx) { return callApi("/v1/convert/pdf/html", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "pdf_to_pptx",
      description: "Convert PDF pages into PowerPoint slides (PPTX).",
      parameters: { type: "object", properties: {
        url: { type: "string" }, file: { type: "string" }, pages: { type: "string" },
        output: { type: "string", enum: ["url", "base64", "file"] }, output_filename: { type: "string" },
      }},
      async execute(p, ctx) { return callApi("/v1/convert/pdf/pptx", "POST", bb(p), getApiKey(ctx.config)); },
    });

    // ═══════════════════════════════════════════
    // CONVERT Other → PDF
    // ═══════════════════════════════════════════

    api.registerTool({
      name: "image_to_pdf",
      description: "Combine images (PNG/JPG/WebP) into a PDF. Page size, orientation, fit mode, margin control. Max 100 images.",
      parameters: { type: "object", properties: {
        image_url: { type: "string" },
        image_urls: { type: "array", items: { type: "string" } },
        page_size: { type: "string", enum: ["A4", "Letter", "Legal", "A3", "A5", "original"] },
        orientation: { type: "string", enum: ["portrait", "landscape"] },
        fit_mode: { type: "string", enum: ["fit", "fill", "stretch", "original"] },
        margin: { type: "number" },
        output: { type: "string", enum: ["url", "base64", "both", "file"] }, output_filename: { type: "string" },
      }},
      async execute(p, ctx) { return callApi("/v1/convert/image/pdf", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "document_to_pdf",
      description: "Convert office documents (DOCX, DOC, PPT, PPTX, XLS, XLSX, CSV, TXT, ODT, RTF) to PDF.",
      parameters: { type: "object", properties: {
        url: { type: "string" }, file: { type: "string" },
        input_format: { type: "string", enum: ["doc", "docx", "odt", "rtf", "txt", "ppt", "pptx", "odp", "xls", "xlsx", "ods", "csv"] },
        output: { type: "string", enum: ["url", "base64", "file"] }, output_filename: { type: "string" },
      }},
      async execute(p, ctx) { return callApi("/v1/convert/docx/pdf", "POST", bb(p), getApiKey(ctx.config)); },
    });

    // ═══════════════════════════════════════════
    // MERGE & SPLIT
    // ═══════════════════════════════════════════

    api.registerTool({
      name: "merge_pdfs",
      description: "Combine 2-25 PDFs into one document. Supports URLs, base64, custom metadata (title, author).",
      parameters: { type: "object", properties: {
        urls: { type: "array", items: { type: "string" }, description: "PDF URLs to merge (2-25)." },
        files: { type: "array", items: { type: "string" } },
        output: { type: "string", enum: ["url", "file", "base64"] }, output_filename: { type: "string" },
        metadata: { type: "object", properties: { title: { type: "string" }, author: { type: "string" }, subject: { type: "string" } } },
      }},
      async execute(p, ctx) { return callApi("/v1/pdf/merge", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "split_pdf",
      description: "Split PDF by page ranges ('1-3,5,8-10'), per-page (mode='each'), or fixed chunks. Output is a zip.",
      parameters: { type: "object", properties: {
        url: { type: "string" }, file: { type: "string" },
        pages: { type: "string" }, mode: { type: "string", enum: ["each"] }, chunks: { type: "number" },
        output: { type: "string", enum: ["url", "file", "base64"] },
      }},
      async execute(p, ctx) { return callApi("/v1/pdf/split", "POST", bb(p), getApiKey(ctx.config)); },
    });

    // ═══════════════════════════════════════════
    // LOCK, UNLOCK, COMPRESS
    // ═══════════════════════════════════════════

    api.registerTool({
      name: "lock_pdf",
      description: "Add password protection. AES-256/AES-128/RC4 encryption. Separate user/owner passwords. Granular permissions (print, copy, modify, annotate, fill forms).",
      parameters: { type: "object", properties: {
        url: { type: "string" }, base64_pdf: { type: "string" },
        password: { type: "string", description: "User password (required to open)." },
        owner_password: { type: "string" },
        encryption: { type: "string", enum: ["aes256", "aes128", "rc4"] },
        permissions: { type: "object", properties: {
          print: { type: "boolean" }, copy: { type: "boolean" }, modify: { type: "boolean" },
          annotate: { type: "boolean" }, fill_forms: { type: "boolean" },
        }},
        input_password: { type: "string" },
        output: { type: "string", enum: ["file", "url", "base64"] },
      }, required: ["password"] },
      async execute(p, ctx) { return callApi("/v1/lockPdf", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "unlock_pdf",
      description: "Remove password protection. Multiple decryption engines (PyPDF2, pikepdf, PyMuPDF, pdfplumber).",
      parameters: { type: "object", properties: {
        url: { type: "string" }, base64_pdf: { type: "string" },
        password: { type: "string", description: "Password to unlock." },
        output: { type: "string", enum: ["file", "url", "base64"] }, output_name: { type: "string" },
      }, required: ["password"] },
      async execute(p, ctx) { return callApi("/v1/unlockPdf", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "compress_pdf",
      description: "Reduce PDF file size. Levels: low, medium, high (default), max. Returns compression stats.",
      parameters: { type: "object", properties: {
        url: { type: "string" }, base64_pdf: { type: "string" },
        compression: { type: "string", enum: ["low", "medium", "high", "max"] },
        output: { type: "string", enum: ["file", "url", "base64"] }, output_name: { type: "string" },
      }},
      async execute(p, ctx) { return callApi("/v1/compressPdf", "POST", bb(p), getApiKey(ctx.config)); },
    });

    // ═══════════════════════════════════════════
    // WATERMARK & SIGN
    // ═══════════════════════════════════════════

    api.registerTool({
      name: "watermark_pdf",
      description: "Add text or image watermark. Tiled or single placement. Position presets. Custom color/opacity/angle/font.",
      parameters: { type: "object", properties: {
        file_url: { type: "string" }, base64_file: { type: "string" },
        text: { type: "string" }, color: { type: "string" },
        opacity: { type: "number" }, angle: { type: "number" }, font_size: { type: "number" },
        position: { type: "string", enum: ["center", "top-left", "top-right", "bottom-left", "bottom-right", "top-center", "bottom-center"] },
        mode: { type: "string", enum: ["single", "tiled"] },
        watermark_image_url: { type: "string" },
        output_format: { type: "string", enum: ["file", "url", "base64", "both"] },
      }},
      async execute(p, ctx) { return callApi("/v1/watermark", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "sign_pdf",
      description: "Stamp signature image or text onto PDF. Position presets or exact X/Y. All-pages mode. Date stamps. Opacity control.",
      parameters: { type: "object", properties: {
        pdf_url: { type: "string" }, base64_pdf: { type: "string" },
        signature_url: { type: "string" }, base64_signature: { type: "string" },
        sign_text: { type: "string" }, sign_color: { type: "string" }, font_size: { type: "number" },
        date_stamp: { type: "boolean" },
        page: { type: "number" }, all_pages: { type: "boolean" },
        position: { type: "string", enum: ["bottom-right", "bottom-left", "top-right", "top-left", "center", "bottom-center", "top-center"] },
        x: { type: "number" }, y: { type: "number" }, width: { type: "number" }, height: { type: "number" },
        opacity: { type: "number" },
        output_format: { type: "string", enum: ["file", "url", "base64", "both"] },
      }},
      async execute(p, ctx) { return callApi("/v1/sign-pdf", "POST", bb(p), getApiKey(ctx.config)); },
    });

    // ═══════════════════════════════════════════
    // PARSE & OCR
    // ═══════════════════════════════════════════

    api.registerTool({
      name: "parse_pdf",
      description: "Parse PDF into structured JSON. Modes: text, layout (blocks+bbox), tables, full (text+blocks+tables+images).",
      parameters: { type: "object", properties: {
        url: { type: "string" },
        mode: { type: "string", enum: ["text", "layout", "tables", "full"] },
        pages: { type: "string" },
      }},
      async execute(p, ctx) { return callApi("/v1/pdf/parse", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "ocr_pdf",
      description: "OCR scanned PDF using Tesseract. 100+ languages, configurable DPI, word-level bounding boxes, character whitelisting.",
      parameters: { type: "object", properties: {
        url: { type: "string" }, base64_pdf: { type: "string" }, pages: { type: "string" },
        lang: { type: "string", description: "Language(s), '+' separated. Default: 'eng'." },
        dpi: { type: "number" }, detail: { type: "string", enum: ["text", "words"] },
        char_whitelist: { type: "string" },
        output_format: { type: "string", enum: ["json", "text"] },
      }},
      async execute(p, ctx) { return callApi("/v1/pdf/ocr/parse", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "ocr_image",
      description: "OCR an image using Tesseract. Preprocessing: grayscale, sharpen, threshold, resize.",
      parameters: { type: "object", properties: {
        image_url: { type: "string" }, base64_image: { type: "string" },
        lang: { type: "string" }, detail: { type: "string", enum: ["text", "words"] },
        char_whitelist: { type: "string" },
        grayscale: { type: "boolean" }, sharpen: { type: "boolean" },
        threshold: { type: "number" }, resize: { type: "number" },
        output_format: { type: "string", enum: ["json", "text"] },
      }},
      async execute(p, ctx) { return callApi("/v1/image/ocr/parse", "POST", bb(p), getApiKey(ctx.config)); },
    });

    // ═══════════════════════════════════════════
    // SCAN & COMPARE
    // ═══════════════════════════════════════════

    api.registerTool({
      name: "scan_enhance",
      description: "Turn document photo into clean scan. Edge detection, perspective correction, B&W/grayscale/color. Output as PNG, JPG, or PDF.",
      parameters: { type: "object", properties: {
        image_url: { type: "string" }, base64_image: { type: "string" },
        color_mode: { type: "string", enum: ["bw", "grayscale", "color"] },
        auto_detect: { type: "boolean" }, sharpen: { type: "boolean" },
        brightness: { type: "number" }, contrast: { type: "number" }, dpi: { type: "number" },
        image_format: { type: "string", enum: ["png", "jpg"] },
        output_format: { type: "string", enum: ["file", "url", "base64", "both", "pdf"] },
      }},
      async execute(p, ctx) { return callApi("/v1/scan-enhance", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "compare_documents",
      description: "Compare two images/PDFs for visual similarity. Methods: auto, feature_match, ssim, phash.",
      parameters: { type: "object", properties: {
        url1: { type: "string" }, url2: { type: "string" },
        image1_base64: { type: "string" }, image2_base64: { type: "string" },
        method: { type: "string", enum: ["auto", "feature_match", "ssim", "phash"] },
      }},
      async execute(p, ctx) { return callApi("/v1/document/similarity", "POST", bb(p), getApiKey(ctx.config)); },
    });

    // ═══════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════

    api.registerTool({
      name: "pdf_info",
      description: "Get PDF metadata: page count, file size, encryption status, title, author.",
      parameters: { type: "object", properties: {
        url: { type: "string" }, base64_pdf: { type: "string" },
      }},
      async execute(p, ctx) { return callApi("/v1/pdf/info", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "compress_image",
      description: "Compress image to JPEG with quality control. Returns compression stats.",
      parameters: { type: "object", properties: {
        image_url: { type: "string" }, base64_image: { type: "string" },
        quality: { type: "number" }, output_format: { type: "string", enum: ["url", "base64"] },
      }},
      async execute(p, ctx) { return callApi("/v1/compress", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "url_to_html",
      description: "Fetch fully-rendered HTML from any URL using headless Chromium. For SPAs and JS-rendered pages.",
      parameters: { type: "object", properties: {
        url: { type: "string" },
        wait_till: { type: "string", enum: ["load", "domcontentloaded", "networkidle", "commit"] },
        timeout: { type: "number" }, wait_for_selector: { type: "string" }, wait_for_timeout: { type: "number" },
        viewport_width: { type: "number" }, viewport_height: { type: "number" }, user_agent: { type: "string" },
      }, required: ["url"] },
      async execute(p, ctx) { return callApi("/v1/url-to-html", "POST", bb(p), getApiKey(ctx.config)); },
    });

    // ═══════════════════════════════════════════
    // FILE MANAGEMENT
    // ═══════════════════════════════════════════

    api.registerTool({
      name: "upload_file",
      description: "Upload a file to cloud storage and get a download URL. 30-day auto-deletion.",
      parameters: { type: "object", properties: {
        file_url: { type: "string" }, filename: { type: "string" },
      }},
      async execute(p, ctx) { return callApi("/v1/file/upload", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "list_files",
      description: "List all uploaded files. Returns URLs and timestamps, newest first.",
      parameters: { type: "object", properties: {
        limit: { type: "number", description: "Max results (1-500). Default: 100." },
      }},
      async execute(p, ctx) {
        const limit = (p.limit as number) || 100;
        return callApi(`/v1/file/list?limit=${limit}`, "GET", null, getApiKey(ctx.config));
      },
    });

    api.registerTool({
      name: "delete_file",
      description: "Delete uploaded file by URL. Ownership verified.",
      parameters: { type: "object", properties: {
        url: { type: "string", description: "File URL to delete." },
      }, required: ["url"] },
      async execute(p, ctx) { return callApi("/v1/file/delete", "POST", bb(p), getApiKey(ctx.config)); },
    });

    // ═══════════════════════════════════════════
    // TEMPLATES
    // ═══════════════════════════════════════════

    api.registerTool({
      name: "create_template",
      description: "Save reusable HTML/CSS template with placeholders for PDF/image generation.",
      parameters: { type: "object", properties: {
        name: { type: "string" }, html_content: { type: "string" }, css_content: { type: "string" },
        default_params: { type: "object", additionalProperties: { type: "string" } },
        metadata: { type: "object", additionalProperties: true },
      }, required: ["html_content"] },
      async execute(p, ctx) { return callApi("/v1/templates", "POST", bb(p), getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "list_templates",
      description: "List all saved templates.",
      parameters: { type: "object", properties: {} },
      async execute(_p, ctx) { return callApi("/v1/templates", "GET", null, getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "get_template",
      description: "Get full template details by ID.",
      parameters: { type: "object", properties: { template_id: { type: "string" } }, required: ["template_id"] },
      async execute(p, ctx) { return callApi(`/v1/templates/${p.template_id}`, "GET", null, getApiKey(ctx.config)); },
    });

    api.registerTool({
      name: "update_template",
      description: "Update template fields. Only provided fields are changed.",
      parameters: { type: "object", properties: {
        template_id: { type: "string" }, name: { type: "string" }, html_content: { type: "string" },
        css_content: { type: "string" }, default_params: { type: "object" }, metadata: { type: "object" },
      }, required: ["template_id"] },
      async execute(p, ctx) {
        const { template_id, ...body } = p;
        return callApi(`/v1/templates/${template_id}`, "PUT", bb(body as Record<string, unknown>), getApiKey(ctx.config));
      },
    });

    api.registerTool({
      name: "delete_template",
      description: "Permanently delete a template.",
      parameters: { type: "object", properties: { template_id: { type: "string" } }, required: ["template_id"] },
      async execute(p, ctx) { return callApi(`/v1/templates/${p.template_id}`, "DELETE", null, getApiKey(ctx.config)); },
    });
  },
};

export default plugin;
