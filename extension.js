const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    // Show a message when VS Code starts
    setTimeout(() => {
        vscode.window.showInformationMessage("Hello, VS Code!");
    }, 1000);

    // Get the Git extension API
    const gitExtension = vscode.extensions.getExtension('vscode.git');

    if (!gitExtension) {
        console.error("Git extension not found.");
        return;
    }

    await gitExtension.activate(); // Ensure Git API is available
    const git = gitExtension.exports.getAPI(1);

    // Listen for changes in repositories (this includes staging files)
    git.onDidOpenRepository(repo => {
        repo.state.onDidChange(() => checkForStagedFiles(repo));
    });

    // Also attach the listener to already open repositories
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
