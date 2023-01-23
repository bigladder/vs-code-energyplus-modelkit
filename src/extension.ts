// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { exit } from 'process';
import * as vscode from 'vscode';
import {commentUtils} from "./comment-utils";
import {getExtension} from "./comment-utils";
import {objectUtils} from "./object-utils";

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('energyplus--modelkit.toggleEnergyPlusComments', () => {
		toggleComments("!");
	}));

	context.subscriptions.push(vscode.commands.registerCommand('energyplus--modelkit.toggleModelkitComments', () => {
		toggleComments("#");
	}));

	context.subscriptions.push(vscode.commands.registerCommand('energyplus--modelkit.viewIORef', () => {
        checkEPObjectClass();
    }));

	context.subscriptions.push(vscode.languages.setLanguageConfiguration('energyplus--modelkit', {
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

// This method is called when your extension is deactivated
export function deactivate(): void {}
