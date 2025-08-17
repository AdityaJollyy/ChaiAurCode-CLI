import 'dotenv/config';
import { OpenAI } from 'openai';
import fs from 'fs/promises';
import inquirer from 'inquirer';

async function createProjectFolder(folderName = '') {
    try {
        await fs.mkdir(folderName, { recursive: true });
        return `Folder '${folderName}' created successfully.`;
    } catch (error) {
        return `Error creating folder '${folderName}': ${error.message}`;
    }
}

async function createFile(filepath = '', content = '') {
    try {
        await fs.writeFile(filepath, content, 'utf8');
        return `File '${filepath}' created successfully.`;
    } catch (error) {
        return `Error creating file '${filepath}': ${error.message}`;
    }
}

const TOOL_MAP = {
    createProjectFolder: createProjectFolder,
    createFile: createFile,
};

// Ensure you have your GEMINI_API_KEY in a .env file
const client = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

async function runMiniCursor() {
    const { prompt } = await inquirer.prompt([
        {
            type: 'input',
            name: 'prompt',
            message: 'Describe the basic website you want to create (e.g., "A simple todo list"):',
        },
    ]);

    if (!prompt) {
        console.error("Please provide a prompt.");
        return;
    }
    const SYSTEM_PROMPT = `
    You are an AI assistant specialized in creating full working web apps using separate HTML, CSS, and JavaScript files. 
    The websites you make are fully functional, interactive, and beautiful, incorporating modern design elements like responsive layouts, clean typography, subtle animations, and appealing color schemes.
    
    You work in START, THINK, TOOL (when needed), and OUTPUT format.
    For a given user query about creating a web app, first think and breakdown the problem into sub-problems such as structure (HTML), styling (CSS), and functionality (JavaScript).
    You should always keep thinking step by step before giving the actual output.
    
    Before outputting the final result to the user, you must check if everything is correct, ensuring the code is valid, functional, beautiful, and meets the user's requirements.
    Generate separate HTML, CSS, and JavaScript files that work together.
    
    You have available tools to create folders and files on the user's machine.
    Available Tools:
    - createProjectFolder(folderName: string): Creates a new folder with the given name.
    - createFile(filepath: string, content: string): Creates a file at the given filepath with the provided content.
    
    Rules:
    - Your response must be a single, valid JSON object.
    - Do not wrap your JSON response in markdown code blocks.
    - After you call a tool with the "TOOL" step, the next message you receive will be from the user, prefixed with "OBSERVATION:", containing the tool's output. You must use this observation to continue your thinking process or provide the final output.
    - Always follow the output in sequence: START, multiple THINK steps, then TOOL calls to create folder and files, and finally OUTPUT.
    - Always perform only one step at a time and wait for the next step.
    - Always make sure to do multiple steps of thinking before giving out the output or calling a tool.
    - For every tool call, always wait for the OBSERVE which contains the output from the tool.
    - In the OUTPUT step, provide a final message to the user, confirming the app has been created with separate files.
    - When generating code content, avoid using backslashes or complex escape sequences that might cause JSON parsing issues.
    - Use simple quotes and avoid unnecessary escaping in the file content.
    
    Output JSON Format:
    { "step": "START | THINK | OUTPUT | TOOL" , "content": "string", "tool_name": "string", "input": "string" }  // For createProjectFolder
    { "step": "START | THINK | OUTPUT | TOOL" , "content": "string", "tool_name": "string", "filepath": "string", "file_content": "string" }  // For createFile
    
    Example:
    User: Please create a basic website based on this prompt: A simple todo list
    ASSISTANT: { "step": "START", "content": "The user wants a simple todo list app using HTML, CSS, and JS in separate files." }
    ASSISTANT: { "step": "THINK", "content": "Break down the requirements: Need an input field for new todos, an add button, a list to display todos, and options to mark as done or delete." }
    ASSISTANT: { "step": "THINK", "content": "For functionality: Use JavaScript to handle adding items, toggling completion, and removing items. Store todos in an array or localStorage for persistence." }
    ASSISTANT: { "step": "THINK", "content": "For beauty: Use a clean sans-serif font, a soft color palette (e.g., blues and whites), responsive design with flexbox, and subtle hover effects." }
    ASSISTANT: { "step": "THINK", "content": "Project structure: I need to create a project folder and then create separate HTML, CSS, and JS files for the todo app." }
    ASSISTANT: { "step": "THINK", "content": "HTML structure: Create index.html with proper DOCTYPE, meta tags, title, and semantic HTML elements. Link external CSS and JS files." }
    ASSISTANT: { "step": "THINK", "content": "CSS styling: Create style.css with modern styling including flexbox layouts, hover effects, responsive design, and clean typography." }
    ASSISTANT: { "step": "THINK", "content": "JavaScript functionality: Create script.js with functions for adding, completing, and deleting todos. Ensure event handling works properly." }
    ASSISTANT: { "step": "THINK", "content": "Ensure it's fully functional: Test logic mentally - adding, completing, deleting should work without errors. All files should link properly." }
    ASSISTANT: { "step": "THINK", "content": "Final check: Code should be valid HTML5, CSS without conflicts, JS error-free, and the app should look modern and appealing on desktop and mobile." }
    ASSISTANT: { "step": "TOOL", "tool_name": "createProjectFolder", "input": "todo-app" }
    DEVELOPER: { "step": "OBSERVE", "content": "Folder 'todo-app' created successfully." }
    ASSISTANT: { "step": "THINK", "content": "Great! Project folder created. Now I'll create the HTML file with proper structure and links to external CSS and JS files." }
    ASSISTANT: { "step": "TOOL", "tool_name": "createFile", "filepath": "todo-app/index.html", "file_content": "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Todo List App</title><link rel='stylesheet' href='style.css'></head><body><div class='container'><h1>Todo List</h1><input type='text' id='todoInput' placeholder='Add a new todo'><button id='addBtn'>Add</button><ul id='todoList'></ul></div><script src='script.js'></script></body></html>" }
    DEVELOPER: { "step": "OBSERVE", "content": "File 'todo-app/index.html' created successfully." }
    ASSISTANT: { "step": "THINK", "content": "HTML file created successfully. Now I'll create the CSS file with modern styling and responsive design." }
    ASSISTANT: { "step": "TOOL", "tool_name": "createFile", "filepath": "todo-app/style.css", "file_content": "body { font-family: 'Arial', sans-serif; background-color: #f0f4f8; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; } .container { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); width: 300px; max-width: 90%; } h1 { text-align: center; color: #333; margin-bottom: 20px; } #todoInput { width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; box-sizing: border-box; } #addBtn { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background-color 0.3s; } #addBtn:hover { background: #0056b3; } #todoList { list-style: none; padding: 0; margin-top: 20px; } .todo-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; transition: background-color 0.2s; } .todo-item:hover { background-color: #f8f9fa; } .todo-item.completed { text-decoration: line-through; color: #aaa; background-color: #f0f0f0; } .delete-btn { background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px; } .delete-btn:hover { background: #c82333; }" }
    DEVELOPER: { "step": "OBSERVE", "content": "File 'todo-app/style.css' created successfully." }
    ASSISTANT: { "step": "THINK", "content": "CSS file created successfully with modern styling. Now I'll create the JavaScript file with all the functionality for adding, completing, and deleting todos." }
    ASSISTANT: { "step": "TOOL", "tool_name": "createFile", "filepath": "todo-app/script.js", "file_content": "document.addEventListener('DOMContentLoaded', function() { const todoInput = document.getElementById('todoInput'); const addBtn = document.getElementById('addBtn'); const todoList = document.getElementById('todoList'); let todos = []; function addTodo() { const text = todoInput.value.trim(); if (text) { const todo = { id: Date.now(), text: text, completed: false }; todos.push(todo); renderTodos(); todoInput.value = ''; } } function deleteTodo(id) { todos = todos.filter(todo => todo.id !== id); renderTodos(); } function toggleTodo(id) { todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo); renderTodos(); } function renderTodos() { todoList.innerHTML = ''; todos.forEach(todo => { const li = document.createElement('li'); li.className = 'todo-item' + (todo.completed ? ' completed' : ''); const span = document.createElement('span'); span.textContent = todo.text; span.onclick = () => toggleTodo(todo.id); const deleteBtn = document.createElement('button'); deleteBtn.className = 'delete-btn'; deleteBtn.textContent = 'Delete'; deleteBtn.onclick = (e) => { e.stopPropagation(); deleteTodo(todo.id); }; li.appendChild(span); li.appendChild(deleteBtn); todoList.appendChild(li); }); } addBtn.addEventListener('click', addTodo); todoInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') { addTodo(); } }); });" }
    DEVELOPER: { "step": "OBSERVE", "content": "File 'todo-app/script.js' created successfully." }
    ASSISTANT: { "step": "THINK", "content": "Perfect! All files have been created successfully. The todo app is now complete with separate HTML, CSS, and JavaScript files that work together." }
    ASSISTANT: { "step": "OUTPUT", "content": "Your beautiful todo list app has been created successfully! The project includes separate files: index.html (structure), style.css (modern styling), and script.js (functionality). The app features adding todos, marking them as complete by clicking, and deleting them. Open the 'todo-app' folder and launch index.html in your browser to start using it!" }
    `;

    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Please create a basic website based on this prompt: ${prompt}` }
    ];

    while (true) {
        try {
            const response = await client.chat.completions.create({
                model: 'gemini-2.0-flash',
                messages: messages,
                response_format: { type: "json_object" },
            });

            const message = response.choices[0]?.message;
            if (!message || !message.content) {
                console.error("Invalid response structure or empty content from API. Skipping.");
                continue;
            }

            const rawContent = message.content;
            const cleanedContent = rawContent.replace(/^``````$/g, '').trim();

            let parsedContent;
            try {
                parsedContent = JSON.parse(cleanedContent);
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                console.error("Raw content:", cleanedContent);
                continue;
            }

            messages.push({
                role: 'assistant',
                content: JSON.stringify(parsedContent),
            });

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
                    messages.push({
                        role: 'user',
                        content: JSON.stringify({ step: 'OBSERVE', content: errorContent }),
                    });
                    continue;
                }

                let responseFromTool;
                if (toolToCall === 'createProjectFolder') {
                    responseFromTool = await TOOL_MAP[toolToCall](parsedContent.input);
                    console.log(`\t🛠️  ${toolToCall}(${parsedContent.input}) => `, responseFromTool);
                } else if (toolToCall === 'createFile') {
                    responseFromTool = await TOOL_MAP[toolToCall](parsedContent.filepath, parsedContent.file_content);
                    console.log(`\t🛠️  ${toolToCall}(${parsedContent.filepath}) => `, responseFromTool);
                }

                messages.push({
                    role: 'user',
                    content: JSON.stringify({ step: 'OBSERVE', content: responseFromTool }),
                });
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

export { runMiniCursor };