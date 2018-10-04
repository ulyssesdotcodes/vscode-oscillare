'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

type Maybe<T> = T | void;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-oscillare" is now active!');

    let term : Maybe<vscode.Terminal> = undefined;

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let createTerm = vscode.commands.registerCommand('extension.startOscillare', () => {
        if(term == undefined) {
            term = vscode.window.createTerminal("Oscillare");
            term.sendText("stack ghci", true);

            setTimeout(function() { if (term != undefined) { term.sendText(":l src/OSCServer", true); term.sendText("r <- topRunner", true); }}, 5000);
        } else {
            term.sendText(":r", true);
            setTimeout(function() { if (term != undefined) { term.sendText(":l src/OSCServer", true); term.sendText("r <- topRunner", true);}}, 5000);
        }
    });
    context.subscriptions.push(createTerm);

    let oscillareSend = vscode.commands.registerCommand('extension.oscillareSend', () => {
        if(term == undefined) {
            console.log("No active terminal");
        } else if (vscode.window.activeTextEditor != undefined){
            let start : vscode.Position = vscode.window.activeTextEditor.selection.start;
            // Go backwards until empty line
            while(start.line > 0 && !vscode.window.activeTextEditor.document.lineAt(start.line).isEmptyOrWhitespace) {
                start = new vscode.Position(start.line - 1, start.character);
            }

            let end = new vscode.Position(start.line + 1, start.character);
            while(end.line < vscode.window.activeTextEditor.document.lineCount && !vscode.window.activeTextEditor.document.lineAt(end.line).isEmptyOrWhitespace) {
                end = new vscode.Position(end.line + 1, end.character);
            }


            var actualstart = start.line == 0 ? 0 : start.line + 1;
            var text : string = "";
            for(var i = actualstart; i < end.line; i++) {
                text += vscode.window.activeTextEditor.document.lineAt(i).text + '\n';
            }
            term.sendText(":{", true);
            term.sendText(text.replace("{Command}", "\"" + stringEscape(text) + "\""), true);
            term.sendText(":}", true);
        }
    });
    context.subscriptions.push(oscillareSend);

    let stopTerm = vscode.commands.registerCommand('extension.stopOscillare', () => {
        if(term != undefined) {
            term.dispose();
            term = undefined;
        }
    });
    context.subscriptions.push(stopTerm);
}

function stringEscape(s : string) {
    return s ? s.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/\t/g,'\\t').replace(/\v/g,'\\v').replace(/'/g,"\\'").replace(/"/g,'\\"').replace(/[\x00-\x1F\x80-\x9F]/g,hex) : s;
    function hex(c : string) { var v = '0'+c.charCodeAt(0).toString(16); return '\\x'+v.substr(v.length-2); }
}

// this method is called when your extension is deactivated
export function deactivate() {
}