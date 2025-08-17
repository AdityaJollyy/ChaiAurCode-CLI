# 🚀 ChaiAurCode CLI

A comprehensive web development toolkit that combines **website cloning** and **AI-powered web generation** capabilities. Clone existing websites with pixel-perfect accuracy or generate new websites from natural language prompts.

## ✨ Features

### 🌐 Website Cloning
- **Complete Website Cloning**: Downloads HTML, CSS, JavaScript, images, and all assets for offline viewing
- **Modern Framework Support**: Handles Next.js image optimization, React applications, and modern web frameworks
- **Smart Asset Processing**: Automatically processes CSS background images, srcset attributes, and external resources
- **Concurrent Downloads**: Uses rate-limited parallel downloading (10 concurrent connections) for optimal performance
- **Asset Path Optimization**: Automatically fixes all asset references for perfect offline functionality
- **External Asset Handling**: Downloads and organizes assets from external domains in dedicated folders

### 🤖 AI Website Generation (Mini Cursor)
- **Natural Language Prompts**: Create websites by describing what you want in plain English
- **Full-Stack Generation**: Generates HTML, CSS, and JavaScript files for complete websites
- **Modern Design**: Creates responsive, interactive websites with clean typography and appealing aesthetics
- **Project Structure**: Automatically organizes generated files in proper directory structures

### 🎨 User Experience
- **Interactive CLI**: Beautiful command-line interface with animations, gradients, and progress indicators
- **Dual Functionality**: Choose between cloning existing websites or generating new ones
- **Real-time Feedback**: Live progress updates and detailed logging during operations
- **Cross-Platform**: Works seamlessly on Windows, macOS, and Linux

## 📋 Prerequisites

- **Node.js** (version 14 or higher)
- **Gemini API Key**: Required for AI-powered website generation functionality

## 🛠️ Installation

1. **Clone this repository**:
   ```bash
   git clone https://github.com/AdityaJollyy/Website-Frontend-Cloner-CLI.git
   cd Website-Frontend-Cloner-CLI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (required for AI generation):
   ```bash
   # Create .env file
   echo GEMINI_API_KEY=your_gemini_api_key_here > .env
   ```

## 🚀 Usage

Launch the interactive CLI:

```bash
node cli.js
```

### Option 1: Clone a Website
1. Select "Clone a website" from the menu
2. Enter the target website URL (e.g., `https://code.visualstudio.com`)
3. The tool will download and process all assets
4. Open the generated `index.html` file in your browser

### Option 2: Generate a Website with AI
1. Select "Use Mini Cursor" from the menu
2. Describe your desired website (e.g., "A modern todo list with dark theme")
3. The AI will generate a complete website with HTML, CSS, and JavaScript
4. Open the generated files to see your custom website

## 📁 Output Structure

### Cloned Websites
```
cloned-example.com/
├── index.html              # Main HTML file with fixed asset paths
├── assets/                 # Site-specific assets
├── css/                    # Stylesheets
├── js/                     # JavaScript files
├── images/                 # Images and media files
├── external/               # Assets from external domains
│   └── cdn.example.com/    # Organized by hostname
└── vendor/                 # Third-party libraries
```

### Generated Websites
```
generated-todo-list/
├── index.html              # Main HTML structure
├── styles.css              # Custom styling
└── script.js               # Interactive functionality
```

## 🎯 Supported Websites & Features

### Website Cloning Capabilities
- ✅ Static websites and landing pages
- ✅ React/Next.js applications with image optimization
- ✅ WordPress and CMS-based sites
- ✅ Portfolio and business websites
- ✅ E-commerce product pages
- ✅ Documentation sites
- ✅ Complex CSS frameworks (Bootstrap, Tailwind, etc.)
- ✅ Progressive Web Apps (PWAs)

### AI Generation Capabilities
- ✅ Business landing pages
- ✅ Portfolio websites
- ✅ Interactive web applications
- ✅ Dashboard interfaces
- ✅ Blog layouts
- ✅ E-commerce product showcases
- ✅ Form-based applications

## 🔧 Advanced Features

### Website Cloning
- **Next.js Image Proxy Handling**: Automatically decodes `/_next/image?url=` proxy URLs
- **CSS Asset Extraction**: Processes `url()` references in CSS files and inline styles
- **Responsive Image Support**: Handles `srcset` attributes for different screen sizes
- **Timeout Management**: 15-second timeout per asset with graceful failure handling
- **Smart Path Resolution**: Maintains relative paths for optimal offline functionality
- **Embedded CSS Assets**: Downloads fonts, images, and other resources referenced in CSS

### AI Generation
- **Context-Aware Generation**: Uses advanced prompts for high-quality code generation
- **Modern Web Standards**: Generates semantic HTML5, modern CSS, and vanilla JavaScript
- **Responsive Design**: Creates mobile-first, responsive layouts
- **Interactive Elements**: Includes JavaScript functionality for dynamic user interfaces
- **Design Consistency**: Maintains cohesive color schemes and typography

## 📦 Dependencies

```json
{
  "chalk": "^5.5.0",              // Terminal colors and styling
  "chalk-animation": "^2.0.3",     // Animated terminal text
  "cheerio": "^1.1.2",           // Server-side HTML parsing
  "dotenv": "^17.2.1",           // Environment variable management
  "figlet": "^1.8.2",            // ASCII art text generation
  "gradient-string": "^3.0.0",    // Gradient text effects
  "inquirer": "^12.9.2",         // Interactive command-line prompts
  "nanospinner": "^1.2.2",       // Loading spinners
  "openai": "^5.12.2",           // Gemini AI integration
  "p-limit": "^7.0.0"            // Concurrency control
}
```

## 🚀 Performance & Optimization

- **Concurrent Processing**: Downloads up to 10 assets simultaneously
- **Rate Limiting**: Built-in delays to respect server limits
- **Memory Efficient**: Streams large files to avoid memory overflow
- **Error Recovery**: Continues operation even if some assets fail
- **Smart Caching**: Avoids re-downloading identical assets
- **Timeout Handling**: Prevents hanging on slow or unresponsive assets

## ⚠️ Important Notes & Best Practices

### Legal & Ethical Considerations
- **Copyright Respect**: Only clone websites you have permission to clone
- **Robots.txt Compliance**: Always check and respect `robots.txt` files
- **Rate Limiting**: Tool includes built-in rate limiting to be server-friendly
- **Terms of Service**: Ensure compliance with target website's terms of service

### Technical Limitations
- **JavaScript Heavy Sites**: SPAs may require additional manual setup for full functionality
- **Authentication**: Cannot clone content behind login walls
- **Dynamic Content**: API-driven content may not be captured
- **Large Websites**: Very large sites (>1GB) may take significant time

### Performance Tips
- **Network Speed**: Ensure stable internet connection for best results
- **Disk Space**: Ensure adequate free space for large website assets
- **API Limits**: Monitor Gemini API usage to avoid unexpected costs

## 🐛 Troubleshooting

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **API Key Error** | Verify `GEMINI_API_KEY` in `.env` file |
| **Network Timeouts** | Check internet connection, some assets may be skipped |
| **Permission Denied** | Ensure write permissions in current directory |
| **Large File Failures** | Normal behavior - tool continues with other assets |
| **Empty Output** | Target website may block automated requests |
| **CSS Not Loading** | Check browser console for CORS or path issues |

### Debug Mode
Add verbose logging by modifying the timeout values in `agent.js` for more detailed output.

### Getting Help
1. Check console output for specific error messages
2. Verify all dependencies: `npm install`
3. Test with a simple website first (e.g., a basic HTML page)
4. Ensure API key has sufficient credits (for AI generation)

## 🏗️ Project Structure

```
ChaiAurCode CLI/
├── cli.js              # Main CLI interface and user interaction
├── agent.js            # Website cloning engine and asset processing
├── minicursor.js       # AI-powered website generation
├── package.json        # Dependencies and project configuration
├── .env               # Environment variables (create this)
└── README.md          # This documentation
```

## 🌟 Acknowledgments

- **Gemini AI**: Powers the intelligent website generation
- **Cheerio**: Enables robust HTML parsing and manipulation
- **Open Source Community**: For the excellent Node.js ecosystem

---

**Happy Coding! 🎉**

_Built with ❤️ for developers who need powerful web development tools_

> **Pro Tip**: Start with simple websites to understand the tool's capabilities, then move to more complex sites as you become familiar with the workflow.
