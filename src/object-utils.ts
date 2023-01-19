import * as vscode from 'vscode';

// comment or un-comment lines in selected range from document
export function objectUtils ( docRange: vscode.Range ) {

    // read IDF snippets file
    console.log("Reading snippets file ...");

    // var fs = require('fs');
    // var idfSnippets;
    // fs.readFile('../snippets/snippets-idf.json', 'utf8', function (err, data) {
    //     if (err) throw err;
    //     idfSnippets = JSON.parse(data);
    //   });    
    // console.log("Test 1 ...");

    // var fs = require('fs');
    // var idfSnippets = JSON.parse(fs.readFileSync('../snippets/snippets-idf.json', 'utf8'));
    // console.log("Test 2 ...");

    var idfSnippets = require('../snippets/snippets-idf.json');
    console.log("Test 3 ...");
   
    // build array of EnergyPlus object classes from snippets file
    var objectClasses:string[]; // create array store EnergyPlus object classes

    console.log("idfSnippets:");
    console.log(idfSnippets);

    idfSnippets.forEach(function(snippet:any, i:any) {
        for (var prefix in snippet) {
        //    console.log(i, prefix, snippet[prefix]);
           objectClasses.push(prefix);
        }
      });

      console.log("objectClasses:");
  
}

