// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { exit } from 'process';
import * as vscode from 'vscode';
import {commentUtils} from "./comment-utils";
import {getExtension} from "./comment-utils";
import {objectUtils} from "./object-utils";
const fs = require('fs');
const path = require('path');

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('energyplus.toggleEnergyPlusComments', () => {
		toggleComments("!");
	}));

	context.subscriptions.push(vscode.commands.registerCommand('modelkit.toggleEnergyPlusComments', () => {
		toggleComments("!");
	}));

	context.subscriptions.push(vscode.commands.registerCommand('modelkit.toggleModelkitComments', () => {
		toggleComments("#");
	}));

	context.subscriptions.push(vscode.commands.registerCommand('energyplus.viewIORef', () => {
        checkEPObjectClass();
    }));

	context.subscriptions.push(vscode.commands.registerCommand('modelkit.viewIORef', () => {
        checkEPObjectClass();
    }));

	context.subscriptions.push(vscode.languages.setLanguageConfiguration('energyplus', {
		onEnterRules: [
			{
				// If entering new line below final input field, remove indentation
				beforeText: /^\s*\S*;\s*\S*!/, // RegEx test for text before cursor (should be at end of line, after any comments)
				action: {
					indentAction: vscode.IndentAction.Outdent
				},
			},
		],
	}));

	context.subscriptions.push(vscode.languages.setLanguageConfiguration('modelkit', {
		onEnterRules: [
			{
				// If entering new line below final input field, remove indentation
				beforeText: /^\s*\S*;\s*\S*!/, // RegEx test for text before cursor (should be at end of line, after any comments)
				action: {
					indentAction: vscode.IndentAction.Outdent
				},
			},
		],
	}));

	// when extension is activated, load EnergyPlus snippets file for selected version
	loadEnergyPlusSnippets();
}

export function toggleComments ( prefix : string) {

	// get active text editor
	const editor = vscode.window.activeTextEditor;

	if (editor) {
		const document = editor.document;

		let selected = editor.selections;
		let start = selected[0].start; // start position of first selected range
		let end = selected[0].end; // end position of first selected range
		
		const docRange = new vscode.Range( start, end );

		// use function from comment-utils.coffee to get active file extension
		const ext = getExtension(document.fileName);

		// use function from comment-utils.coffee to add or remove comments
		commentUtils( docRange, ext, editor, prefix );
	}
	else {
		vscode.window.showInformationMessage('Editor is undefined!');
		return false;
	}
}

export function checkEPObjectClass ( ) {
    const editor = vscode.window.activeTextEditor;

	if (editor) {
		const document = editor.document;

		let selected = editor.selections;
		let start = selected[0].start; // start position of first selected range
		let end = selected[0].end; // end position of first selected range
		
		const docRange = new vscode.Range( start, end );

		// use function from object-utils.ts to check if selected text is an EnergyPlus object and open browser tab for Input Output Reference web docs
		objectUtils( docRange, editor );
	}
	else {
		vscode.window.showInformationMessage('Editor is undefined!');
		return false;
	}
}

// load snippets file of object autocompletion for selected EnergyPlus version
export function loadEnergyPlusSnippets () {
    const config = vscode.workspace.getConfiguration('energyplus-modelkit');
    const version = config.get('energyPlusVersion', 'v9.0'); // default to v9.0
    const snippetsPath = path.join(__dirname, '..', 'snippets', `snippets-v${version.replace('.','-')}-idf.json`); // match snippets file name

    fs.readFile(snippetsPath, 'utf8', (err: Error, data : string) => {
		if (err) {
			vscode.window.showErrorMessage(`Error loading snippets: ${err.message}`);
			return;
		}

		// Parse the snippets file to create a new list of completionItems
		const snippets = JSON.parse(data);
		const completionItems: vscode.CompletionItem[] = Object.keys(snippets).map(key => {
			const snippet = snippets[key];
			const item = new vscode.CompletionItem(snippet.prefix, vscode.CompletionItemKind.Snippet);
			item.insertText = new vscode.SnippetString(snippet.body);
			item.label = key;
			item.documentation = new vscode.MarkdownString(`[Input Output Reference](${snippet.descriptionMoreURL})

${snippet.description}`);
			// MarkdownString allows for hyperlink like 'More...' URL feature of snippets
			// Using literal new lines to separate hyperlink from description since this is template literal string
			item.detail = snippet.body;
			return item;
		});

		// Register new snippets as completionItemProvider
		completionItemProvider = vscode.languages.registerCompletionItemProvider(
			[{ language: 'energyplus', scheme: 'file' }, { language: 'modelkit', scheme: 'file' }],
			// loading new EnergyPlus snippets should apply to both 'energyplus' and 'modelkit' languages
			{
				provideCompletionItems(document, position) {
					return completionItems;
				}
			}
		);
		vscode.window.showInformationMessage(`Autocompletion ready for EnergyPlus v${version} object classes.`);
    });
}

// This method is called when your extension is deactivated
export function deactivate(): void {}