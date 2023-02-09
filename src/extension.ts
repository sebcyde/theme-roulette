/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Activating Roulette.');
	let id_array: NodeJS.Timer[] = [];
	const AllThemes: any[] = [];
	let id: NodeJS.Timer;

	const RandomTheme = () => {
		return AllThemes[Math.floor(Math.random() * AllThemes.length)];
	};

	const RetrieveThemes = () => {
		const extensions = vscode.extensions.all;
		for (const extension of extensions) {
			const packageJSON = extension.packageJSON;

			if (packageJSON.contributes && packageJSON.contributes.themes) {
				const themes = packageJSON.contributes.themes;

				for (const theme of themes) {
					if (theme.uiTheme === 'vs-dark' && theme.label.includes('Doki ')) {
						AllThemes.push(theme);
					}
				}
			}
		}
	};

	const SetTheme = () => {
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

	let disposable = vscode.commands.registerCommand(
		'theme-roulette.timer',
		() => {
			const Execute = () => {
				vscode.window.showInformationMessage('Starting Timed Roulette.');
				RetrieveThemes();
				SetTheme();
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
		id_array = [];
	});

	let Spin = vscode.commands.registerCommand('theme-roulette.spin', () => {
		vscode.window.showInformationMessage('Spinning Roulette.');
		RetrieveThemes();
		SetTheme();
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(Stop);
	context.subscriptions.push(Spin);
}

// This method is called when your extension is deactivated
export function deactivate() {
	vscode.window.showInformationMessage('Deactivating Roulette.');
}
