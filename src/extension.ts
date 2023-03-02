/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const SpinDuration = vscode.workspace
		.getConfiguration('theme-roulette')
		.get<number>('spinduration');

	const ShuffleSticker = vscode.workspace
		.getConfiguration('theme-roulette')
		.get<boolean>('shufflesticker');

	let id_array: NodeJS.Timer[] = [];
	const AllThemes: any[] = [];
	let id: NodeJS.Timer;

	const statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		Number.MIN_SAFE_INTEGER // furthest right on the right
	);
	statusBarItem.command = 'extension.showThemeStatus';
	statusBarItem.tooltip = 'Current VS Code theme';

	const updateStatusBarItem = (ThemeLabel: string) => {
		statusBarItem.text = `$(paintcan) ${ThemeLabel}`;
	};

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

	const themeWatcher = vscode.workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration('workbench.colorTheme')) {
			let IncludedTheme = false;
			const theme: any = vscode.workspace
				.getConfiguration()
				.get('workbench.colorTheme');
			AllThemes.forEach((dokitheme) => {
				if (dokitheme.id.toLowerCase() == theme.toLowerCase())
					IncludedTheme = true;
			});
			if (!IncludedTheme) statusBarItem.hide();
		}
	});

	const SetTheme = () => {
		let Chosen = RandomTheme();

		console.log('Chosen:', Chosen)

		vscode.workspace
			.getConfiguration('workbench')
			.update('colorTheme', Chosen.id, vscode.ConfigurationTarget.Global)
			.then(() => {
				vscode.window.showInformationMessage(`Current Theme: ${Chosen.label}`);
				updateStatusBarItem(Chosen.label);
				statusBarItem.show();
			});
	};

	let disposable = vscode.commands.registerCommand(
		'theme-roulette.timer',
		() => {
			const Execute = () => {
				RetrieveThemes();
				SetTheme();
			};

			Execute();
			id = setInterval(Execute, SpinDuration ? SpinDuration * 60000 : 150000);
			id_array.push(id);
		}
	);

	let Stop = vscode.commands.registerCommand('theme-roulette.stop', () => {
		deactivate();
		statusBarItem.hide();

		for (var i = 0; i < id_array.length; i++) {
			clearInterval(id_array[i]);
		}
		id_array = [];
	});

	let Spin = vscode.commands.registerCommand('theme-roulette.spin', () => {
		RetrieveThemes();
		SetTheme();
	});

	context.subscriptions.push(statusBarItem);
	context.subscriptions.push(themeWatcher);
	context.subscriptions.push(disposable);
	context.subscriptions.push(Stop);
	context.subscriptions.push(Spin);
}

// This method is called when your extension is deactivated
export function deactivate() {
	vscode.window.showInformationMessage('Deactivating Roulette.');
	console.log('Deactivating Roulette.');
}
