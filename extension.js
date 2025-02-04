const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    setTimeout(() => {
        vscode.window.showInformationMessage("Hello, VS Code!");
    }, 1000);

    const gitExtension = vscode.extensions.getExtension('vscode.git');

    if (!gitExtension) {
        console.error("Git extension not found.");
        return;
    }

    await gitExtension.activate(); 
    const git = gitExtension.exports.getAPI(1);

    git.onDidOpenRepository(repo => {// this listenes to check if a change was made
        repo.state.onDidChange(() => checkForStagedFiles(repo));
    });

    git.repositories.forEach(repo => {
        repo.state.onDidChange(() => checkForStagedFiles(repo));
    });
}

// Function to check if a file was staged
function checkForStagedFiles(repo) {
    const stagedFiles = repo.state.indexChanges.map(change => change.uri.fsPath);

    if (stagedFiles.length > 0) {
        vscode.window.showInformationMessage("A file was staged!");
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
