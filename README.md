# FileVibe

> **Transform Anything.**

FileVibe is a modern, privacy-first browser-based file productivity toolkit for reading, editing, converting, compressing, previewing, and managing files from one unified application.

It brings everyday file utilities into a single responsive workspace, including PDF editing, universal file conversion, image tools, Markdown generation, GitHub README creation, color utilities, and PWA support.

---

## ✨ Features

### 📊 Dashboard
- Central workspace for FileVibe tools
- Quick access to frequently used workflows
- Recent-work support using local browser storage where appropriate
- Clean desktop, tablet, and mobile experience

### 🐙 GitHub Reader
Create polished GitHub profile README content from real GitHub profile and repository information.

- GitHub profile information
- Repository statistics
- Top languages
- Featured repositories
- Contribution insights where available
- Professional README sections
- Technology badges
- Social links
- Markdown preview
- Copy and download README
- Responsive README presentation
- Dark/light/system theme support
- Subtle UI animations
- No fabricated profile or repository data

### 📄 File Reader
Read and inspect supported files directly in the browser.

Supported formats can include:

- TXT
- MD / Markdown
- JSON
- CSV
- TSV
- YAML / YML
- XML
- HTML
- CSS / SCSS
- JavaScript / TypeScript
- PDF
- DOCX
- XLS / XLSX
- PPTX
- Images
- Audio
- Video
- Archives

Capabilities depend on the file type and browser/library support.

### 📝 PDF Editor
Work with PDF documents using a dedicated editing workspace.

- PDF viewing
- Page navigation
- Zoom and rotation
- Search
- Page thumbnails
- Text editing where technically supported
- Add text
- Add images
- Drawing
- Shapes
- Highlights
- Underlines
- Annotations
- Signatures
- Form fields where supported
- Reorder pages
- Delete pages
- Merge/split workflows where supported
- Fullscreen mode
- Export and download
- Password-protected PDF authentication
- Export an unprotected copy after successful password authentication

> FileVibe does not bypass, crack, or brute-force PDF passwords.

### 🔄 File Converter
A capability-driven file conversion system that detects supported file types and exposes genuine conversion options.

Supported formats include, where technically supported:

- PDF
- CSV
- TSV
- TAR
- JSON
- DOCX
- XLS
- XLSX
- XLSM
- XLSB
- TXT
- MD
- YML
- YAML
- XML
- HTML

The converter is designed around actual processing capabilities rather than simply renaming file extensions.

### 🖼️ Image Tool
Image processing utilities for common image workflows.

- Resize
- Percentage scaling
- Custom dimensions
- Aspect-ratio locking
- Quality control
- Target file size compression
- Format conversion
- Before/after preview
- Metadata
- PNG/JPEG/WebP/AVIF and other supported formats
- SVG workflows where technically supported

### 🎨 Color Studio
A dedicated color and gradient workspace.

- Color picker
- Manual color input
- Eyedropper where supported
- Color history
- Palette generation
- HEX / HEX8
- RGB / RGBA
- HSL / HSLA
- HSV / HSB
- HWB
- CMYK
- LAB
- LCH
- OKLAB
- OKLCH
- Linear gradients
- Radial gradients
- Conic gradients
- Multiple gradient stops
- CSS output
- Palette generation and color relationships

### 📝 Markdown Generator
Create and preview Markdown content with a professional editing workspace.

- Headings
- Bold
- Italic
- Links
- Code
- Code blocks
- Quotes
- Lists
- Tables
- Images
- Undo/redo
- Clear formatting
- Copy
- Download
- Preview
- Responsive editor/preview layout

### 📱 Progressive Web App
FileVibe is designed as an installable Progressive Web App where supported.

- Web app manifest
- Service worker
- Offline application shell
- Installable experience
- Desktop installation where supported
- Android installation where supported
- iOS Add to Home Screen guidance
- Responsive desktop/mobile/tablet experience
- Application update handling

---

## 🔐 Privacy First

FileVibe follows a local-first approach whenever technically possible.

Your files should be processed in the browser whenever the required operation can be performed locally.

FileVibe is designed to:

- Avoid unnecessary file uploads
- Avoid silently storing user files remotely
- Avoid logging file contents
- Process files locally whenever technically possible
- Clearly indicate when server-side processing is required

> **Important:** Privacy behavior depends on the implementation and the specific feature. Always verify the processing method shown by the application before using sensitive files.

---

## 🛡️ Security

Uploaded files are treated as untrusted input.

FileVibe is designed with protections for:

- Cross-site scripting (XSS)
- Malicious HTML
- Malicious SVG
- Unsafe `javascript:` URLs
- Unsafe Markdown
- Malformed PDF files
- Malicious archives
- Archive path traversal
- Resource exhaustion
- MIME-type spoofing
- Untrusted uploaded source code

Uploaded JavaScript or TypeScript is never intended to be executed by the application.

PDF passwords are not bypassed, cracked, or brute-forced.

Spreadsheet macros are not executed as part of normal file processing.

---

## ⚡ Performance

FileVibe is designed for responsive file processing, including larger files where browser capabilities allow.

Performance techniques may include:

- Web Workers
- Streaming
- Chunked processing
- Virtualized lists/tables
- Lazy loading
- ImageBitmap
- OffscreenCanvas
- WebAssembly
- Memory cleanup
- Object URL cleanup

Long-running operations should provide progress feedback instead of freezing the interface.

---

## 🎨 Design

FileVibe uses a consistent design system across its tools.

### Dark Theme

- Background: `#1A1A1A`
- Surface: `#242424`
- Elevated: `#2B2B2B`
- Text: `#F5F5F5`
- Secondary: `#B8B8B8`
- Muted: `#8A8A8A`
- Border: `#333333`
- Silver: `#C0C0C0`
- Brand: `#800020 → #D2143A`

### Light Theme

- Background: `#FAFAFA`
- Surface: `#FFFFFF`
- Text: `#111111`
- Secondary: `#555555`
- Muted: `#777777`
- Border: `#E5E5E5`
- Silver: `#9E9E9E`
- Brand: `#600018 → #A61C38`

The interface is designed to behave like a productivity application rather than a desktop website squeezed onto mobile.

---

## 🖥️ Responsive Experience

FileVibe is designed for:

- Desktop
- Laptop
- Tablet
- Mobile
- Touch devices
- Installed PWA environments

The UI adapts its interaction model rather than simply shrinking the desktop layout.

### Desktop

- Persistent sidebar
- Multi-panel workspaces
- Full toolbars
- Keyboard-friendly controls

### Tablet

- Adaptive navigation
- Touch-friendly controls
- Responsive panels

### Mobile

- Navigation drawer
- Bottom sheets
- Touch-friendly actions
- Fullscreen document/image viewers
- Responsive grids
- No unnecessary horizontal page overflow

---

## 🧰 Technology

The exact technology stack may evolve with the project, but FileVibe is designed around modern web technologies such as:

- React
- TypeScript
- Vite
- Tailwind CSS
- Modern browser APIs
- Web Workers
- IndexedDB
- PWA APIs
- Client-side document processing libraries

Specific dependencies should be checked in `package.json`.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have a supported Node.js version installed.

### Installation

```bash
git clone <repository-url>
cd FileVibe
npm install
```

### Development

```bash
npm run dev
```

Open the local development URL shown by Vite.

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

Use the project's `package.json` scripts as the source of truth if these commands differ from the current configuration.

---

## 📁 Project Structure

A typical FileVibe structure may contain:

```text
FileVibe/
├── public/
├── src/
│   ├── components/
│   ├── features/
│   ├── pages/
│   ├── stores/
│   ├── services/
│   ├── utils/
│   ├── hooks/
│   ├── types/
│   └── ...
├── package.json
├── tsconfig.json
├── vite.config.*
└── README.md
```

The actual repository structure may differ as the application evolves.

---

## 🧭 Main Tools

| Tool | Purpose |
|---|---|
| Dashboard | FileVibe workspace and quick actions |
| GitHub Reader | Generate polished GitHub profile README content |
| File Reader | View and inspect supported files |
| PDF Editor | View, edit and export PDFs where supported |
| Image Tool | Resize, compress and convert images |
| Color Studio | Colors, palettes and gradients |
| File Converter | Convert supported file formats |
| Markdown Generator | Create and preview Markdown |
| Settings | Application preferences and appearance |
| Privacy | Privacy and security information |
| Help | Product guidance and support |
| Install App | Install FileVibe as a PWA where supported |

---

## 📋 File Processing Philosophy

FileVibe does not assume that every format can be converted into every other format.

Instead, the application determines capabilities based on the actual file type and available processing engine.

A file may support:

- Viewing
- Editing
- Conversion
- Compression
- Resizing
- Previewing
- Extraction
- Export
- Analysis

Only operations that are genuinely supported should be presented to the user.

---

## ⚠️ Technical Limitations

File processing capabilities depend on:

- Browser APIs
- File format specifications
- Client-side libraries
- Document structure
- File size
- Encryption
- Scanned/image-only documents
- Platform limitations

For example, arbitrary PDF text editing is significantly more complex than editing a normal word-processing document. FileVibe should clearly communicate limitations rather than claiming unsupported Word-style editing.

Likewise, spreadsheet macro execution and password bypass are intentionally not supported.

---

## 🤝 Contributing

Contributions are welcome.

Before submitting a pull request:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run type checking and linting.
5. Run the production build.
6. Test affected file formats and responsive layouts.
7. Verify that no sensitive information is committed.
8. Open a pull request with a clear description.

For file-processing changes, include tests using representative sample files where possible.

---

## 🧪 Quality Standards

Changes should be verified across:

- Desktop
- Tablet
- Mobile
- Dark theme
- Light theme
- Keyboard navigation
- Production build
- Browser console
- Supported file formats

File-processing features should verify the actual generated output rather than only checking that a download was created.

---

## 📄 License

Add the project's actual license information here.

If the repository has a `LICENSE` file, that file is the authoritative source.

---

## 👨‍💻 Project

**FileVibe**

> Transform Anything.

Built as a modern, privacy-conscious browser workspace for everyday file productivity.
