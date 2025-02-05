const vscode = require('vscode');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    setTimeout(() => {
        vscode.window.showInformationMessage("Hello, VS Code!");
    }, 1000);

    const gitExtension = vscode.extensions.getExtension('vscode.git');

    if (!gitExtension) { // Just a bit of error checking
        vscode.window.showInformationMessage("Git extension not found.");
        return;
    }

    await gitExtension.activate(); 
    const git = gitExtension.exports.getAPI(1);

    git.onDidOpenRepository(repo => {
        repo.state.onDidChange(() => checkForStagedFiles(repo));
    });

    git.repositories.forEach(repo => {
        repo.state.onDidChange(() => checkForStagedFiles(repo));
    });
}

// Function to check if a file is being staged
function checkForStagedFiles(repo) {
    const stagedFiles = repo.state.indexChanges.map(change => change.uri.fsPath);// All of the files in hte repo

    stagedFiles.forEach(filePath => {
        if (filePath.endsWith('.php')) {
            commentTestData(filePath, () => {
                stageFile(repo, filePath);
            });
        }
    });
}

// Function to comment out lines between "// Start Test" and "// End Test"
function commentTestData(filePath, callback) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            vscode.window.showInformationMessage("Error reading file: ".concat(err));
            return;
        }

        let lines = data.split('\n');
        let inTestBlock = false;
        let modified = false;

        lines = lines.map(line => {
            if (line.includes('// Start Test')) {
                inTestBlock = true;
            }
            
            if (inTestBlock && !line.trim().startsWith('//')) {
                line = '// ' + line;
                modified = true;
            }
            
            if (line.includes('// End Test')) {
                inTestBlock = false;
            }
            return line;
        });

        if (!modified) {
            if (callback) callback();
            return;
        }

        const updatedContent = lines.join('\n');
        fs.writeFile(filePath, updatedContent, 'utf8', err => {
            if (err) {
                console.error("Error writing file:", err);
                return;
            }
            if (callback) callback();
        });
    });
}

// Function to stage the file after Change
function stageFile(repo, filePath) {
    vscode.commands.executeCommand('git.stage', vscode.Uri.file(filePath));
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
