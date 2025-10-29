import childprocess from "node:child_process";

export const exec = (command: string) => {
	const child = childprocess.spawn(command, {
		shell: true,
		stdio: "inherit",
	});
	child.on("close", (code: number) => {
		process.exit(code);
	});
};

