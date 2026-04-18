---
name: pdf-toolkit
description: "The complete PDF toolkit — generate PDFs from HTML/URLs, convert between 15+ formats (Word, Excel, PowerPoint, CSV, HTML, PNG, JPG), merge, split, compress, lock, unlock, watermark, sign, OCR, parse, scan documents, generate charts, and manage files. 35 tools in one plugin. Powered by PDFAPIHub."
---

# PDF Toolkit

The all-in-one PDF plugin for OpenClaw. 35 tools covering every PDF operation.

## Tools

### Generate
| Tool | Description |
|------|-------------|
| `generate_pdf` | Create PDF from HTML or URL |
| `generate_image` | Create PNG from HTML or URL |
| `generate_chart` | Create Chart.js charts (bar, line, pie, etc.) |

### Convert PDF → Other
| `pdf_to_image` | PDF pages → PNG/JPG/WebP |
| `pdf_to_docx` | PDF → Word document |
| `pdf_to_xlsx` | PDF → Excel workbook |
| `pdf_to_csv` | PDF → CSV |
| `pdf_to_text` | PDF → plain text |
| `pdf_to_html` | PDF → styled HTML |
| `pdf_to_pptx` | PDF → PowerPoint slides |

### Convert Other → PDF
| `image_to_pdf` | Images → PDF |
| `document_to_pdf` | DOCX/PPT/XLS/CSV/TXT → PDF |

### Merge & Split
| `merge_pdfs` | Combine 2-25 PDFs |
| `split_pdf` | Split by pages, ranges, or chunks |

### Security
| `lock_pdf` | Add password/encryption |
| `unlock_pdf` | Remove password protection |
| `compress_pdf` | Reduce file size |

### Watermark & Sign
| `watermark_pdf` | Text or image watermarks |
| `sign_pdf` | Signature images or text stamps |

### Parse & OCR
| `parse_pdf` | Structured JSON (text, tables, blocks) |
| `ocr_pdf` | OCR scanned PDFs (100+ languages) |
| `ocr_image` | OCR images with preprocessing |

### Scan & Compare
| `scan_enhance` | Document photo → clean scan |
| `compare_documents` | Visual similarity check |

### Utilities
| `pdf_info` | Page count, metadata, encryption check |
| `compress_image` | JPEG compression with stats |
| `url_to_html` | Fetch rendered HTML from URL |

### File Management
| `upload_file` | Upload and get download URL |
| `list_files` | List uploaded files |
| `delete_file` | Delete uploaded files |

### Templates
| `create_template` | Save reusable HTML/CSS templates |
| `list_templates` | List saved templates |
| `get_template` | Get template details |
| `update_template` | Update template fields |
| `delete_template` | Delete a template |

## Setup

Get your **free API key** at [https://pdfapihub.com](https://pdfapihub.com).

**Important:** This plugin sends files to PDFAPIHub's servers for processing. Your API key grants access to the PDFAPIHub service. Files are stored for 30 days then auto-deleted.

Configure your API key in `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "entries": {
      "pdfapihub": {
        "enabled": true,
        "apiKey": "your-api-key-here"
      }
    }
  }
}
```

Or use the `env` approach (OpenClaw injects it into `config.apiKey` automatically):

```json
{
  "plugins": {
    "entries": {
      "pdfapihub": {
        "enabled": true,
        "env": {
          "PDFAPIHUB_API_KEY": "your-api-key-here"
        }
      }
    }
  }
}
```

## Documentation

Full API docs: [https://pdfapihub.com/docs](https://pdfapihub.com/docs)
