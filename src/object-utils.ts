import { json } from 'stream/consumers';
import * as vscode from 'vscode';
import { resourceLimits } from 'worker_threads';

// comment or un-comment lines in selected range from document
export function objectUtils ( docRange: vscode.Range, editor: vscode.TextEditor ) {

    // check if selection has characters
    var selectedText: string = editor.document.getText(docRange);

    if (selectedText.length === 0) {
      vscode.window.showErrorMessage('No text selected. Please select text for an EnergyPlus object class before using this command.');
      return false;
    }
    else {
      // create map of object classes (keys) and IO Ref URLs (values) from IDF snippets   
      var idfSnippets = require('../snippets/snippets-idf.json');
      var objectsMap = new Map();
      Object.keys(idfSnippets).forEach(function(key) {
        var snippet = idfSnippets[key];
        objectsMap.set(snippet.prefix, snippet.descriptionMoreURL);
      });

      // build list of object classes from map
      var objectClasses: string[] = [];
      for (let entry of objectsMap.entries()) {
        objectClasses.push(entry[0]);
      }

      // check if selected text is an element in object classes list
      if (objectClasses.some((element, index) => {return element === selectedText; })) {
        // get URL from map and open externally from VS Code
        var objectURL: string = objectsMap.get(selectedText);
        vscode.env.openExternal(vscode.Uri.parse(objectURL));
      }
      else {
        vscode.window.showErrorMessage("'" + selectedText + "' is NOT in list of EnergyPlus Object Classes.\nPlease change your selection to link to Input Output Reference correctly.");
      }
    } 
}

