# 🚀 ChaiCode Frontend Cloner

A powerful AI-powered tool that creates pixel-perfect clones of website landing pages, complete with all assets (images, CSS, JavaScript) for offline viewing.

## ✨ Features

- **Complete Website Cloning**: Downloads HTML, CSS, JavaScript, images, and other assets
- **Modern Framework Support**: Handles Next.js image optimization and other modern web frameworks
- **Concurrent Downloads**: Uses rate-limited parallel downloading for efficiency
- **Asset Path Optimization**: Automatically fixes all asset references for offline viewing
- **Interactive CLI**: Beautiful command-line interface with animations and progress indicators
- **AI-Powered**: Uses Gemini AI for intelligent cloning decisions
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 📋 Prerequisites

- **Node.js** (version 14 or higher)
- **API Key**: Gemini API key for AI functionality

## 🛠️ Installation

1. **Clone or download this repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   - Create a `.env` file in the project root
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_gemini_api_key_here
     ```

## 🚀 Usage

To clone a website, simply run:

```bash
node cli.js
```

The interactive CLI will:

1. Display a welcome screen with the ChaiCode branding
2. Prompt you to enter the website URL you want to clone
3. Clone the website with all its assets
4. Save everything to a local directory named `cloned-[hostname]`

### Example

```bash
node cli.js
```

Then enter a URL like `https://example.com` when prompted.

## 📁 Output Structure

The cloned website will be saved in a directory structure like this:

```
cloned-example.com/
├── index.html          # Main HTML file
├── css/               # CSS files
├── js/                # JavaScript files
├── images/            # Images and media files
└── external/          # External assets from other domains
```

## 🎯 Supported Websites

- Static websites
- React/Next.js applications
- WordPress sites
- Landing pages
- Portfolio websites
- Most modern web frameworks

## 🔧 Advanced Features

- **Next.js Image Optimization**: Handles `/_next/image` proxy URLs
- **CSS Background Images**: Extracts and downloads CSS background images
- **Srcset Processing**: Handles responsive image sets
- **External Assets**: Downloads assets from external domains
- **Error Handling**: Robust error handling with retry mechanisms
- **Rate Limiting**: Prevents overwhelming target servers

## 📦 Dependencies

- **OpenAI**: For Gemini AI integration
- **Cheerio**: HTML parsing and manipulation
- **Chalk**: Terminal styling and colors
- **Inquirer**: Interactive command-line prompts
- **Figlet**: ASCII art text generation
- **Nanospinner**: Loading spinners
- **p-limit**: Concurrency control

## 🔒 Environment Variables

Create a `.env` file with the following:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## ⚠️ Important Notes

- **Respect robots.txt**: Always check the website's robots.txt file
- **Rate Limiting**: The tool includes built-in rate limiting to be respectful
- **Large Websites**: Very large websites may take longer to clone
- **API Costs**: Using Gemini AI may incur API costs based on usage

## 🐛 Troubleshooting

### Common Issues:

1. **API Key Error**: Make sure your Gemini API key is correctly set in the `.env` file
2. **Network Issues**: Check your internet connection and try again
3. **Large Files**: Some very large assets might timeout - the tool will skip them and continue
4. **Permission Errors**: Make sure you have write permissions in the current directory

### Getting Help:

If you encounter issues:

1. Check the console output for specific error messages
2. Ensure all dependencies are installed with `npm install`
3. Verify your API key is valid and has sufficient credits

## 🌟 Acknowledgments

- Built with modern web technologies
- Powered by Gemini AI

---

**Happy Cloning! 🎉**

_Built with ❤️ for the developer community_
