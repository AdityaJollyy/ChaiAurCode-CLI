import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import gradient from 'gradient-string';
import inquirer from 'inquirer';
import { createSpinner } from 'nanospinner';
import { exec } from 'child_process';
import { promisify } from 'util';
import { runMiniCursor } from './minicursor.js';

const execAsync = promisify(exec);
const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

// Custom gradient for theme: orange-400 to orange-500 to yellow-500
const themeGradient = gradient(['#fb923c', '#f97316', '#eab308']);

async function welcome() {
    console.clear();
    return new Promise((resolve) => {
        figlet('ChaiAurCode CLI', { font: 'Big' }, (err, data) => {
            if (err) {
                console.log('Error generating figlet');
                resolve();
                return;
            }
            console.log(themeGradient.multiline(data));
            const rainbowTitle = chalkAnimation.rainbow('Welcome to ChaiAurCode CLI!\n');
            sleep(1000).then(() => {
                rainbowTitle.stop();
                resolve();
            });
        });
    });
}

async function askAction() {
    const answers = await inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: ['Clone a website', 'Use Mini Cursor'],
    });
    return answers.action;
}

async function askURL() {
    const answers = await inquirer.prompt({
        name: 'url',
        type: 'input',
        message: 'Enter the website URL to clone:',
        default: 'https://example.com',
        validate: (input) => {
            try {
                new URL(input);
                return true;
            } catch {
                return 'Please enter a valid URL (e.g., https://example.com)';
            }
        },
    });
    return answers.url;
}

function extractEssentialInfo(output) {
    // Extract only the final result and essential info
    const lines = output.split('\n');
    let assetsCount = 0;
    let directory = '';

    // Look for the tool output line that contains the JSON result
    for (const line of lines) {
        if (line.includes('cloneWebsiteLandingPage') && line.includes('=>')) {
            try {
                // Extract JSON from the line like: "\t🛠️  cloneWebsiteLandingPage(url) => {"message":"...","directory":"...","assetsDownloaded":31}"
                const jsonMatch = line.match(/=>\s*(\{.*\})/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[1]);
                    directory = parsed.directory;
                    assetsCount = parsed.assetsDownloaded;
                    return { assetsCount, directory };
                }
            } catch (e) {
                // Continue looking
            }
        }
    }

    // Fallback: Count downloaded assets
    const downloadedLines = lines.filter(line => line.includes('✅ Downloaded:'));
    assetsCount = downloadedLines.length;

    // Fallback: Find directory name
    const directoryMatch = output.match(/to (\.\/cloned-[^\s]+)/);
    if (directoryMatch) {
        directory = directoryMatch[1];
    }

    return { assetsCount, directory };
}

async function cloneWebsite(url) {
    const spinner = createSpinner(`☕ Haanji! To jb tk cloning chalrhi hai, aap chai pijiye aur thoda relax kijiye.`).start();

    try {
        const { stdout, stderr } = await execAsync(`node agent.js ${url}`);

        const { assetsCount, directory } = extractEssentialInfo(stdout);

        spinner.success({ text: 'Cloning completed successfully!' });

        // // Show only essential information
        // if (assetsCount > 0) {
        //     console.log(chalk.green(`✅ Downloaded ${assetsCount} assets`));
        // }

        // if (directory) {
        //     console.log(chalk.blue(`📁 Saved to: ${directory}`));
        // }

        if (directory) {
            // Extract only the folder name from the directory path (remove ./ prefix)
            const folderName = directory.replace(/^\.\//, '');
            console.log(chalk.bgGreen.black(`\n🚀 Open the cloned index.html from ${folderName} in your browser!`));
        } else {
            console.log(chalk.bgGreen.black('\n🚀 Open the cloned index.html in your browser!'));
        }

        // // Show warnings if any (but filter out verbose logs)
        // if (stderr && !stderr.includes('ExperimentalWarning')) {
        //     console.log(chalk.yellow('\n⚠️  Warnings:'));
        //     console.log(chalk.yellow(stderr));
        // }

    } catch (error) {
        spinner.error({ text: 'Cloning failed!' });

        // Clean error message
        let errorMessage = error.message;

        // Extract meaningful error from verbose output
        if (errorMessage.includes('Command failed')) {
            const lines = errorMessage.split('\n');
            const meaningfulError = lines.find(line =>
                line.includes('Error:') ||
                line.includes('Failed:') ||
                line.includes('❌')
            );
            if (meaningfulError) {
                errorMessage = meaningfulError.replace(/.*Error:\s*/, '').trim();
            }
        }

        console.log(chalk.red(`❌ ${errorMessage}`));
        process.exit(1);
    }
}

async function main() {
    await welcome();
    const action = await askAction();
    if (action === 'Clone a website') {
        const url = await askURL();
        await cloneWebsite(url);
    } else if (action === 'Use Mini Cursor') {
        await runMiniCursor();
    }
}

main();