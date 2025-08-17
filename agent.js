import 'dotenv/config';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';

async function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function cloneWebsiteLandingPage(url = '') {
    try {
        new URL(url); // Validate URL
        const root = new URL(url);
        const rootOrigin = root.origin;
        const hostname = root.hostname;
        const outDir = `./cloned-${hostname}`;
        await ensureDir(outDir);

        const imagesFolder = path.join(outDir, 'images');
        await ensureDir(imagesFolder);
        const cssFolder = path.join(outDir, 'css');
        await ensureDir(cssFolder);
        const jsFolder = path.join(outDir, 'js');
        await ensureDir(jsFolder);
        const externalFolder = path.join(outDir, 'external');
        await ensureDir(externalFolder);

        // Use concurrent downloads with rate limiting
        const limit = pLimit(10);
        const assetSet = new Set();

        // Utility functions
        const toLocalAssetPath = (assetUrl) => {
            const u = new URL(assetUrl);
            let finalPath = u.pathname;

            // Handle query strings safely
            if (u.search) {
                const safeQuery = u.search.replace(/[?&=]/g, "_").slice(0, 100);
                finalPath = `${u.pathname}${safeQuery}`;
            }

            // Handle external assets
            if (u.origin !== rootOrigin) {
                return `external/${u.hostname}${finalPath}`.replace(/^\/+/, "");
            }

            return finalPath.replace(/^\/+/, "");
        };

        const downloadAsset = async (assetUrl, targetFolder) => {
            try {
                const response = await fetch(assetUrl, {
                    signal: AbortSignal.timeout(15000)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const buffer = Buffer.from(await response.arrayBuffer());
                const localPath = toLocalAssetPath(assetUrl);
                const filePath = path.join(outDir, localPath);

                await ensureDir(path.dirname(filePath));
                fs.writeFileSync(filePath, buffer);

                return localPath;
            } catch (error) {
                console.warn(`❌ Failed to download ${assetUrl}:`, error.message);
                return null;
            }
        };

        // Fetch the HTML using fetch instead of Puppeteer for reliability
        console.log('📄 Fetching HTML...');
        const response = await fetch(url, {
            signal: AbortSignal.timeout(30000),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        console.log('🔍 Processing images...');
        // Enhanced image processing with Next.js support
        $("img").each((_, el) => {
            const $el = $(el);

            // Process src and data-src attributes
            ["src", "data-src", "data-lazy-src"].forEach((attr) => {
                const val = $el.attr(attr);
                if (!val || val.startsWith('data:')) return;

                // Handle Next.js image proxy
                if (val.includes("/_next/image") && val.includes("url=")) {
                    try {
                        const urlParams = new URLSearchParams(val.split('?')[1]);
                        const realUrl = urlParams.get('url');
                        if (realUrl) {
                            const abs = new URL(realUrl, url);
                            const localPath = toLocalAssetPath(abs.href);
                            $el.attr(attr, localPath);
                            assetSet.add(abs.href);
                        }
                    } catch (e) {
                        console.warn(`⚠️ Failed to decode next/image: ${val}`);
                    }
                } else {
                    const abs = new URL(val, url);
                    const localPath = toLocalAssetPath(abs.href);
                    $el.attr(attr, localPath);
                    assetSet.add(abs.href);
                }
            });

            // Enhanced srcset processing
            const srcset = $el.attr("srcset");
            if (srcset) {
                const parts = srcset.split(",").map((entry) => {
                    const [u, descriptor] = entry.trim().split(/\s+/);
                    if (!u) return entry;

                    let fixedUrl = u;
                    // Handle Next.js proxy in srcset
                    if (u.includes("/_next/image?url=")) {
                        try {
                            const urlParams = new URLSearchParams(u.split('?')[1]);
                            const realUrl = urlParams.get('url');
                            if (realUrl) {
                                fixedUrl = realUrl;
                            }
                        } catch (e) {
                            console.warn(`⚠️ Failed to decode next/image in srcset: ${u}`);
                        }
                    }

                    const abs = new URL(fixedUrl, url);
                    assetSet.add(abs.href);
                    const localPath = toLocalAssetPath(abs.href);
                    return `${localPath}${descriptor ? " " + descriptor : ""}`;
                });
                $el.attr("srcset", parts.join(", "));
            }

            // Clean up Next.js specific attributes
            $el.removeAttr("data-nimg decoding loading");
        });

        console.log('🎨 Processing CSS files...');
        // Process CSS files
        $("link[href]").each((_, el) => {
            const $el = $(el);
            const href = $el.attr("href");
            if (!href || href.startsWith("data:")) return;

            const abs = new URL(href, url);
            const localPath = toLocalAssetPath(abs.href);
            $el.attr("href", localPath);
            assetSet.add(abs.href);
        });

        console.log('📜 Processing JavaScript files...');
        // Process JS files
        $("script[src]").each((_, el) => {
            const $el = $(el);
            const src = $el.attr("src");
            if (!src || src.startsWith("data:")) return;

            const abs = new URL(src, url);
            const localPath = toLocalAssetPath(abs.href);
            $el.attr("src", localPath);
            assetSet.add(abs.href);
        });

        // Process CSS background images and other URL references
        $("style").each((_, el) => {
            let cssContent = $(el).html();
            if (cssContent) {
                const cssUrlRegex = /url\s*\(\s*(['"]?)([^'")\s]+)\1\s*\)/gi;
                let match;
                while ((match = cssUrlRegex.exec(cssContent)) !== null) {
                    let imgUrl = match[2].trim();
                    if (!imgUrl.startsWith('data:') && !imgUrl.startsWith('#')) {
                        try {
                            const abs = new URL(imgUrl, url);
                            const localPath = toLocalAssetPath(abs.href);
                            assetSet.add(abs.href);
                            cssContent = cssContent.replace(match[0], `url("${localPath}")`);
                        } catch (e) {
                            console.warn(`⚠️ Failed to process CSS URL: ${imgUrl}`);
                        }
                    }
                }
                $(el).html(cssContent);
            }
        });

        console.log(`📥 Downloading ${assetSet.size} assets...`);
        // Download all assets concurrently with rate limiting
        await Promise.all(
            [...assetSet].map(assetUrl =>
                limit(async () => {
                    try {
                        const u = new URL(assetUrl);
                        if (u.protocol !== "http:" && u.protocol !== "https:") return;

                        const response = await fetch(assetUrl, {
                            signal: AbortSignal.timeout(15000)
                        });

                        if (!response.ok) throw new Error(`HTTP ${response.status}`);

                        const buffer = Buffer.from(await response.arrayBuffer());
                        const localPath = toLocalAssetPath(assetUrl);
                        const filePath = path.join(outDir, localPath);

                        await ensureDir(path.dirname(filePath));
                        fs.writeFileSync(filePath, buffer);

                        // Process CSS files for embedded assets
                        if (assetUrl.match(/\.css(\?|$)/i)) {
                            let cssContent = buffer.toString('utf-8');
                            const cssUrlRegex = /url\s*\(\s*(['"]?)([^'")\s]+)\1\s*\)/gi;
                            let cssMatch;
                            let cssModified = false;

                            while ((cssMatch = cssUrlRegex.exec(cssContent)) !== null) {
                                let embeddedUrl = cssMatch[2].trim();
                                if (!embeddedUrl.startsWith('data:') && !embeddedUrl.startsWith('#')) {
                                    try {
                                        const embeddedAbs = new URL(embeddedUrl, assetUrl);
                                        const embeddedLocalPath = toLocalAssetPath(embeddedAbs.href);

                                        // Download the embedded asset if not already downloaded
                                        const embeddedFilePath = path.join(outDir, embeddedLocalPath);
                                        if (!fs.existsSync(embeddedFilePath)) {
                                            const embeddedResponse = await fetch(embeddedAbs.href, {
                                                signal: AbortSignal.timeout(10000)
                                            });
                                            if (embeddedResponse.ok) {
                                                const embeddedBuffer = Buffer.from(await embeddedResponse.arrayBuffer());
                                                await ensureDir(path.dirname(embeddedFilePath));
                                                fs.writeFileSync(embeddedFilePath, embeddedBuffer);
                                            }
                                        }

                                        // Update CSS to point to local file
                                        const relativePath = path.relative(path.dirname(filePath), embeddedFilePath).replace(/\\/g, '/');
                                        cssContent = cssContent.replace(cssMatch[0], `url("${relativePath}")`);
                                        cssModified = true;
                                    } catch (e) {
                                        console.warn(`⚠️ Failed to process embedded CSS asset: ${embeddedUrl}`);
                                    }
                                }
                            }

                            if (cssModified) {
                                fs.writeFileSync(filePath, cssContent, 'utf-8');
                            }
                        }

                        console.log(`✅ Downloaded: ${path.basename(filePath)}`);
                    } catch (error) {
                        console.warn(`❌ Failed to download ${assetUrl}:`, error.message);
                    }
                })
            )
        );

        // Save the processed HTML
        const htmlPath = path.join(outDir, 'index.html');
        fs.writeFileSync(htmlPath, $.html(), 'utf-8');

        console.log('✅ Clone completed successfully!');
        return {
            message: `Successfully cloned the landing page of ${url} to ${outDir}`,
            directory: outDir,
            assetsDownloaded: assetSet.size
        };

    } catch (error) {
        return { error: `Error cloning website: ${error.message}` };
    }
}

async function fixHtmlAssets(directory) {
    const htmlPath = path.join(directory, 'index.html');

    if (!fs.existsSync(htmlPath)) {
        throw new Error('index.html not found in directory: ' + directory);
    }

    const html = fs.readFileSync(htmlPath, 'utf-8');
    const $ = cheerio.load(html);

    // This function is now less needed since we handle paths during download
    // But we can still use it for any final cleanup

    console.log('🔧 Final asset path cleanup...');

    // Ensure all relative paths are correct
    $('img').each(function () {
        const src = $(this).attr('src');
        if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
            // Path is already processed, just ensure it's clean
            const cleanSrc = src.replace(/\/+/g, '/').replace(/^\//, '');
            $(this).attr('src', cleanSrc);
        }
    });

    $('link[rel="stylesheet"]').each(function () {
        const href = $(this).attr('href');
        if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('data:')) {
            const cleanHref = href.replace(/\/+/g, '/').replace(/^\//, '');
            $(this).attr('href', cleanHref);
        }
    });

    $('script[src]').each(function () {
        const src = $(this).attr('src');
        if (src && !src.startsWith('http') && !src.startsWith('//') && !src.startsWith('data:')) {
            const cleanSrc = src.replace(/\/+/g, '/').replace(/^\//, '');
            $(this).attr('src', cleanSrc);
        }
    });

    fs.writeFileSync(htmlPath, $.html(), 'utf-8');
    return `✅ Asset references cleaned up in ${htmlPath}`;
}

const TOOL_MAP = {
    cloneWebsiteLandingPage,
    fixHtmlAssets
};

const client = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

async function retryWithBackoff(func, maxRetries = 5, baseDelay = 1) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const result = await func();
            return result;
        } catch (error) {
            if (
                error.status === 429 ||
                error.message.includes('429') ||
                error.message.toLowerCase().includes('rate limit')
            ) {
                const delay = baseDelay * Math.pow(2, attempt) + Math.random();
                console.log(`Rate limit hit, retrying in ${delay.toFixed(2)} seconds... (Attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay * 1000));
            } else {
                throw error;
            }
        }
    }
    throw new Error(`Failed after ${maxRetries} retries due to rate limits.`);
}

async function main() {
    const SYSTEM_PROMPT = `
You are an AI assistant specialized in cloning website frontends. You work in a structured START, THINK, and OUTPUT format.
For a given user query about cloning a website's landing page, first think and break down the problem into sub-problems.
You should always keep thinking step by step before giving the actual output.
Also, before outputting the final result to the user, you must check once if everything is correct.
You have access to tools for cloning the frontend and fixing asset references with Cheerio.
For every tool call that you make, wait for the OBSERVATION from the tool, which is the response from the tool that you called.

Available Tools:
- cloneWebsiteLandingPage(url: string): Clones the landing page of the given URL locally, downloading HTML, CSS, JS, and resources with modern framework support.
- fixHtmlAssets(directory: string): Cleans up asset links in the HTML for final optimization.

Rules:
- Your response must be a single, valid JSON object.
- Do not wrap your JSON response in markdown code blocks.
- After you call a tool with the "TOOL" step, the next message you receive will be from the user, prefixed with "OBSERVATION:", containing the tool's output. Use this observation to continue your thinking process or provide the final output.
- Always follow the output in sequence: START, THINK, and then either TOOL or OUTPUT.
- Always perform only one step at a time and wait for the next step.
- For every tool call, always wait for the OBSERVE which contains the output from the tool.
- If the query is not about cloning a website, politely explain that you are specialized in website frontend cloning and cannot assist with other tasks.
- Ensure the URL is valid before calling the tool; think about validation.
- After cloning, always fix asset paths before final OUTPUT.

Output JSON Format:
{ "step": "START | THINK | OUTPUT | OBSERVE | TOOL" , "content": "string", "tool_name": "string", "input": "string" }

Example:
User: Please clone the landing page of this website: https://example.com
ASSISTANT: { "step": "START", "content": "The user wants to clone the frontend of the landing page for https://example.com" }
ASSISTANT: { "step": "THINK", "content": "Break down: I need to validate the URL, use the enhanced cloning tool with modern framework support, then fix asset paths." }
ASSISTANT: { "step": "THINK", "content": "The URL looks valid. The enhanced tool will handle Next.js images, concurrent downloads, and better error handling." }
ASSISTANT: { "step": "TOOL", "input": "https://example.com", "tool_name": "cloneWebsiteLandingPage" }
DEVELOPER: { "step": "OBSERVE", "content": "{\\"message\\":\\"Successfully cloned the landing page of https://example.com to ./cloned-example.com\\",\\"directory\\":\\"./cloned-example.com\\",\\"assetsDownloaded\\":45}" }
ASSISTANT: { "step": "THINK", "content": "Cloning succeeded with 45 assets downloaded. Now I will call fixHtmlAssets for final cleanup." }
ASSISTANT: { "step": "TOOL", "input": "./cloned-example.com", "tool_name": "fixHtmlAssets" }
DEVELOPER: { "step": "OBSERVE", "content": "✅ Asset references cleaned up in ./cloned-example.com/index.html" }
ASSISTANT: { "step": "OUTPUT", "content": "✅ Successfully cloned https://example.com to ./cloned-example.com with 45 assets downloaded! The site now works completely offline with all images, CSS, and JavaScript files properly referenced. Open index.html in your browser to view the pixel-perfect clone." }
`;

    const url = process.argv[2];
    if (!url) {
        console.error("Please provide a URL as an argument: node agent.js <url>");
        return;
    }

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Please clone the landing page of this website: ${url}` }
    ];

    let lastClonedDir = null;

    while (true) {
        try {
            const response = await retryWithBackoff(async () => {
                return await client.chat.completions.create({
                    model: 'gemini-1.5-flash',
                    messages: messages,
                    response_format: { type: "json_object" },
                });
            });

            const message = response.choices[0]?.message;
            if (!message || !message.content) {
                console.error("Invalid response or empty content. Skipping.");
                continue;
            }

            const rawContent = message.content;
            const cleanedContent = rawContent.replace(/^``````$/g, '');
            const jsonMatch = cleanedContent.match(/({[\s\S]*?})/);

            if (!jsonMatch) {
                console.error("No JSON object found in response:", cleanedContent);
                continue;
            }

            const jsonString = jsonMatch[0];
            const parsedContent = JSON.parse(jsonString);
            messages.push({ role: 'assistant', content: JSON.stringify(parsedContent) });

            if (parsedContent.step === 'START') {
                console.log('🔥', parsedContent.content);
                continue;
            }

            if (parsedContent.step === 'THINK') {
                console.log('\t🧠', parsedContent.content);
                continue;
            }

            if (parsedContent.step === 'TOOL') {
                const toolToCall = parsedContent.tool_name;
                if (!TOOL_MAP[toolToCall]) {
                    const errorContent = `There is no such tool as ${toolToCall}`;
                    console.error('\t❌', errorContent);
                    messages.push({ role: 'user', content: `OBSERVATION: ${errorContent}` });
                    continue;
                }

                let input = parsedContent.input;
                let responseFromTool = await TOOL_MAP[toolToCall](input);

                if (toolToCall === "cloneWebsiteLandingPage" && responseFromTool.directory) {
                    lastClonedDir = responseFromTool.directory;
                    responseFromTool = JSON.stringify(responseFromTool);
                }

                console.log(`\t🛠️  ${toolToCall}(${input}) => `, responseFromTool);
                messages.push({ role: 'user', content: JSON.stringify({ step: 'OBSERVE', content: responseFromTool }) });
                continue;
            }

            if (parsedContent.step === 'OUTPUT') {
                console.log('🤖', parsedContent.content);
                break;
            }

        } catch (error) {
            console.error("An error occurred:", error);
            break;
        }
    }

    console.log('Done...');
}

main();
