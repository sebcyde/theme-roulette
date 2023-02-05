/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Activating Roulette.');

	const AllThemes: any[] = [];
	const RandomTheme = () => {
		return AllThemes[Math.floor(Math.random() * AllThemes.length)];
	};

	let id: NodeJS.Timer;
	// decaring an array to store id values
	let id_array: NodeJS.Timer[] = [];

	let disposable = vscode.commands.registerCommand(
		'theme-roulette.spin',
		() => {
			const Execute = () => {
				// Extension Startup
				vscode.window.showInformationMessage('Spinning Roulette.');

				const extensions = vscode.extensions.all;
				for (const extension of extensions) {
					const packageJSON = extension.packageJSON;

					if (packageJSON.contributes && packageJSON.contributes.themes) {
						const themes = packageJSON.contributes.themes;

						for (const theme of themes) {
							if (
								theme.uiTheme === 'vs-dark' &&
								theme.label.includes('Doki ')
							) {
								AllThemes.push(theme);
							}
						}
					}
				}

				let Chosen = RandomTheme();

				vscode.workspace
					.getConfiguration('workbench')
					.update('colorTheme', Chosen.id, vscode.ConfigurationTarget.Global)
					.then(() => {
						console.log(
							`Successfully set ${Chosen.label} as the active color theme`
						);
					});
			};

			Execute();
			id = setInterval(Execute, 1800000);
			id_array.push(id);
		}
	);

	let Stop = vscode.commands.registerCommand('theme-roulette.stop', () => {
		deactivate();
		for (var i = 0; i < id_array.length; i++) {
			clearInterval(id_array[i]);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
	vscode.window.showInformationMessage('Deactivating Roulette.');
}
