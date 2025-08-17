import { runMiniCursor } from './minicursor.js';



async function askAction() {
    const answers = await inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: ['Clone a website', 'Use Mini Cursor'],
    });
    return answers.action;
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