# 📄 PDF Annotator Pro

A professional, feature-rich PDF annotation tool built entirely on the frontend. No server required - all processing happens in your browser for complete privacy.

![PDF Annotator Pro](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Zustand](https://img.shields.io/badge/Zustand-State%20Management-orange?style=for-the-badge)

## ✨ Features

### 🎨 Annotation Tools
- **📝 Text Annotations**: Add customizable text with different fonts, sizes, and colors
- **🖼️ Image Insertion**: Upload and place images anywhere on your PDF
- **✍️ Digital Signatures**: Create and save digital signatures with signature pad
- **✏️ Freehand Drawing**: Draw directly on PDFs with customizable pen colors and widths
- **🖍️ Highlighting**: Highlight important text with adjustable transparency and colors
- **🧹 Eraser**: Remove unwanted drawings and highlights

### 🎯 Core Functionality
- **🖱️ Drag & Drop**: All annotations are draggable and repositionable
- **💾 Save/Load Projects**: Export and import your annotation work as JSON files
- **📄 Multi-page Support**: Navigate through PDF pages with ease
- **🔍 Zoom Controls**: Scale PDFs from 50% to 200%
- **🎨 Customizable Settings**: Fine-tune colors, sizes, and styles for each tool
- **🗑️ Easy Deletion**: Delete annotations with a single click

## 🚀 Tech Stack

- **[Next.js 15.5](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Zustand](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[pdf-lib](https://pdf-lib.js.org/)** - PDF manipulation
- **[signature_pad](https://github.com/szimek/signature_pad)** - Digital signature capture
- **[react-draggable](https://github.com/react-grid-layout/react-draggable)** - Drag and drop functionality
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Modern utility-first CSS
- **[file-saver](https://github.com/eligrey/FileSaver.js/)** - File download functionality

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Navigate to project directory
cd pdf-annotator-pro

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 Usage

### Getting Started
1. **Upload PDF**: Click "Choose File" or drag & drop a PDF file
2. **Select Tool**: Choose from the toolbar (Select, Text, Image, Signature, Draw, Highlight, Eraser)
3. **Annotate**: Click, draw, or place annotations on your PDF
4. **Adjust**: Drag annotations to reposition, double-click text to edit
5. **Save**: Export your annotated work as a JSON project file

### Tool-Specific Instructions

#### 📝 Text Tool
- Click anywhere to place text
- Double-click to edit existing text
- Adjust font size, color, and family in the settings bar

#### 🖼️ Image Tool
- Click to open file picker
- Select an image file
- Drag to reposition after placement

#### ✍️ Signature Tool
- Click to open signature pad
- Draw your signature
- Click "Save Signature" to place it on PDF

#### ✏️ Draw & 🖍️ Highlight Tools
- Click and drag to draw
- Adjust line width and color in settings
- Highlight uses transparency automatically

#### 🧹 Eraser Tool
- Click on drawings/highlights to remove them

### Keyboard Shortcuts
- `Delete`: Remove selected annotation
- `Escape`: Deselect annotation

## 📁 Project Structure

```
pdf-annotator-pro/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Main application page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── PDFUploader.tsx     # PDF file upload component
│   │   ├── Toolbar.tsx         # Main toolbar with tools
│   │   ├── PDFCanvas.tsx       # PDF rendering & interaction
│   │   ├── DraggableAnnotation.tsx  # Draggable annotation wrapper
│   │   └── SignatureModal.tsx  # Signature pad modal
│   ├── store/
│   │   └── usePDFStore.ts      # Zustand state management
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🎨 Customization

### Modifying Default Settings
Edit `src/store/usePDFStore.ts` to change default values:

```typescript
const initialState: PDFState = {
  textSettings: {
    fontSize: 16,        // Change default font size
    color: '#000000',    // Change default text color
    fontFamily: 'Arial', // Change default font
  },
  drawSettings: {
    color: '#000000',    // Change default pen color
    lineWidth: 2,        // Change default line width
  },
  // ... more settings
};
```

### Adding New Fonts
Update the font family options in `src/components/Toolbar.tsx`:

```typescript
<select value={textSettings.fontFamily} ...>
  <option value="Arial">Arial</option>
  <option value="Your New Font">Your New Font</option>
</select>
```

## 🔒 Privacy & Security

- **100% Frontend**: All processing happens in your browser
- **No Server Uploads**: Your PDF files never leave your device
- **Local Storage**: Annotations are only saved when you export them
- **Open Source**: Review the code to verify privacy claims

## 🛠️ Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📝 Future Enhancements

- [ ] Add more shape tools (rectangle, circle, arrow)
- [ ] Text search and annotation linking
- [ ] Export annotated PDF (requires server-side processing or advanced client-side PDF manipulation)
- [ ] Collaborative annotations with real-time sync
- [ ] Undo/Redo functionality
- [ ] Annotation comments and notes
- [ ] Cloud storage integration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with modern React and Next.js best practices
- Inspired by professional PDF annotation tools
- Special thanks to all open-source library maintainers

---

**Built with ❤️ using Next.js**

For questions or support, please open an issue on GitHub.
