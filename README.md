# PDF Toolkit — OpenClaw Plugin

The complete PDF toolkit for OpenClaw, powered by [PDFAPIHub](https://pdfapihub.com). **35 tools** covering every PDF operation in a single plugin.

## Why Use This Plugin?

Instead of installing multiple PDF plugins, install one plugin that does everything. Generate, convert, merge, split, compress, lock, unlock, watermark, sign, OCR, parse, scan, and manage PDFs — all from one place.

## 35 Tools

### Generate (3)
- `generate_pdf` — Create PDF from HTML content or URL with custom page sizes, fonts, margins, and dynamic placeholders
- `generate_image` — Create PNG from HTML or URL with retina quality, full-page screenshots, and cookie consent
- `generate_chart` — Create Chart.js charts (bar, line, pie, doughnut, radar, polarArea, bubble, scatter)

### Convert PDF → Other Formats (7)
- `pdf_to_image` — PDF pages to PNG/JPG/WebP with DPI and resize control
- `pdf_to_docx` — PDF to editable Word document with page selection
- `pdf_to_xlsx` — PDF tables to Excel workbook (one sheet per page)
- `pdf_to_csv` — PDF tables to CSV for data pipelines
- `pdf_to_text` — PDF to plain text
- `pdf_to_html` — PDF to styled HTML
- `pdf_to_pptx` — PDF pages to PowerPoint slides

### Convert Other → PDF (2)
- `image_to_pdf` — Combine PNG/JPG/WebP images into PDF with page layout
- `document_to_pdf` — Convert DOCX, DOC, PPT, PPTX, XLS, XLSX, CSV, TXT, ODT, RTF to PDF

### Merge & Split (2)
- `merge_pdfs` — Combine 2-25 PDFs with custom metadata
- `split_pdf` — Split by page ranges, per-page, or fixed chunks

### Security (3)
- `lock_pdf` — AES-256/AES-128/RC4 encryption with granular permissions
- `unlock_pdf` — Multi-engine decryption (PyPDF2, pikepdf, PyMuPDF, pdfplumber)
- `compress_pdf` — Reduce file size with 4 compression levels

### Watermark & Sign (2)
- `watermark_pdf` — Text or image watermarks, tiled or single, position presets
- `sign_pdf` — Signature images or text, position presets or X/Y, date stamps

### Parse & OCR (3)
- `parse_pdf` — Structured JSON with text, layout blocks, tables, and images
- `ocr_pdf` — Tesseract OCR for scanned PDFs, 100+ languages, word bounding boxes
- `ocr_image` — OCR images with preprocessing (grayscale, sharpen, threshold, resize)

### Scan & Compare (2)
- `scan_enhance` — Document photo to clean scan with perspective correction
- `compare_documents` — Visual similarity scoring (feature matching, SSIM, phash)

### Utilities (3)
- `pdf_info` — Page count, file size, encryption status, metadata
- `compress_image` — JPEG compression with quality control and stats
- `url_to_html` — Fetch rendered HTML from JavaScript-heavy pages

### File Management (3)
- `upload_file` — Upload files and get shareable download URLs
- `list_files` — List all uploaded files
- `delete_file` — Delete files with ownership verification

### Templates (5)
- `create_template` — Save reusable HTML/CSS templates with placeholders
- `list_templates` — List saved templates
- `get_template` — Get full template details
- `update_template` — Update template fields
- `delete_template` — Delete a template

## Installation

```bash
openclaw plugins install clawhub:pdf-toolkit
```

## Configuration

```json
{
  "plugins": {
    "entries": {
      "pdf-toolkit": {
        "enabled": true,
        "env": {
          "PDFAPIHUB_API_KEY": "your-api-key-here"
        }
      }
    }
  }
}
```

Get your **free API key** at [https://pdfapihub.com](https://pdfapihub.com).

## Usage Examples

- *"Generate a PDF invoice for Acme Corp"*
- *"Convert this PDF to Word"*
- *"Merge these 3 PDFs into one"*
- *"Split this PDF into individual pages"*
- *"Compress this PDF"*
- *"Lock this PDF with password 'secret'"*
- *"Add a CONFIDENTIAL watermark"*
- *"Sign this contract with 'John Smith'"*
- *"OCR this scanned document in English and Hindi"*
- *"Extract tables from this invoice into Excel"*
- *"Take a screenshot of this website"*
- *"Scan this document photo"*

## API Documentation

Full API docs: [https://pdfapihub.com/docs](https://pdfapihub.com/docs)

## License

MIT
