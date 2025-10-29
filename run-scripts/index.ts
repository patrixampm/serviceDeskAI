import { exec } from "./helpers.js";
const [runCommand] = process.argv.slice(2);

const { command } = await import(`./${runCommand}`);

if (command) {
	exec(command);
}
