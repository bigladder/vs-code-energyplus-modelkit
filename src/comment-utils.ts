import * as vscode from 'vscode';

// comment or un-comment lines in selected range from document
export function commentUtils ( docRange: vscode.Range, ext: string, editor: vscode.TextEditor, prefix: string ) {

    if ( prefix === "!" ) {
        if ( !/idf/i.test(ext) && !/imf/i.test(ext) && !/pxt/i.test(ext) ) { // case-insensitive check for EnergyPlus file extension
            vscode.window.showErrorMessage('Cannot apply EnergyPlus comments to this file type (must be IDF, IMF, or PXT)');
            return false;
        }
    }

    if ( prefix === "#" ) {
        if ( !/imf/i.test(ext) && !/pxt/i.test(ext) && !/pxv/i.test(ext) ) { // case-insensitive check for Modelkit file extension
            vscode.window.showErrorMessage('Cannot apply Modelkit comments to this file type (must be IMF, PXT, or PXV)');
            return false;
        }
    }

    const document = editor.document;
    const textEdits: vscode.TextEdit[] = []; // create array of TextEdits to store commented and uncommented line changes

    var row:number = docRange.start.line; // variable for starting line number
    var endLine:number = docRange.end.line; // variable for ending line number
    if (docRange.end.character === 0 && endLine > row) { // check if last line in docRange has no characters (avoids toggling comments for line after selected line numbers) 
        endLine -- ;
    }

    // create variable to count number of commented lines in Selection
    var commentedLines:number = 0;

    // loop over lines in docRange to see if all selected lines are already commented
    while ( row <= endLine) {
        var textLine = document.lineAt(row);

        if ( isCommented(textLine, prefix) ) {
            commentedLines ++;
        }
        row ++;
    }

    // create flag if all selected lines are already commented
    var removeCommentsFlag:boolean = false;

    if ( commentedLines === docRange.end.line - docRange.start.line + 1 ) {
        removeCommentsFlag = true;
    }
    
    var row:number = docRange.start.line;
    while ( row <= endLine) { // loop over lines in docRange to toggle comments
        var textLine = document.lineAt(row);
        
        if ( isCommented(textLine, prefix)  ) { // check if text line is already commented
            removeComment( textLine,  prefix, textEdits );
        }
        else {
            if (textLine.text.length > 0) { // check if text line has content (don't need to comment an empty line)
                    addComment( textLine, prefix, textEdits );
            }
        }
        row ++;
    }

    const workEdits = new vscode.WorkspaceEdit();
    workEdits.set(document.uri, textEdits);
    vscode.workspace.applyEdit(workEdits); // apply edits
}

// get extension of document
export function getExtension (fileName: string):string {
    const components = fileName.split('.'); // split working file name into array of strings between "."
    
    return components[components.length - 1]; // return final string in array
}

// check if text line is already commented
export function isCommented (textLine: vscode.TextLine, prefix: string):boolean {
    const prefixLength:number = prefix.length; // get character length of comment prefix
    var commentStartMatch:boolean = false;

    var regex: RegExp = /^\s+/;
    var oldText: string = textLine.text;
    var newText:string = oldText.replace(regex, ""); // strip white space before first character in text line

    commentStartMatch = (newText.substring(0, prefixLength) === prefix); // check if first character in selected text line matches comment prefix
    return commentStartMatch;
}

// remove first comment character in line
export function removeComment (textLine: vscode.TextLine, prefix: string, textEdits: vscode.TextEdit[] ) {
    var regex = new RegExp(prefix);
    var oldText: string = textLine.text;
    var strippedText:string = oldText.replace(regex, ""); // strip first comment character from selected text line

    textEdits.push(vscode.TextEdit.replace(textLine.range, strippedText)); // replace selected text line with stripped text
  }

  // add comment character at start of line
export function addComment (textLine: vscode.TextLine, prefix: string, textEdits: vscode.TextEdit[] ) {
    textEdits.push(vscode.TextEdit.insert(textLine.range.start, prefix)); // insert comment character at start of text line
  }