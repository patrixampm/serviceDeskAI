import prompts from "prompts";

const {projects} : {projects:string[]} = await prompts({
    type: 'multiselect',
    name: 'projects',
    message: '[dev] Select projects to run',
    choices: [
        { title: "front", value: "front" },
        { title: "back", value: "back" },
    ],
});

if(projects.length === 0) {
    console.log("No projects selected. Exiting.");
    process.exit(0);
}

const filter = projects.map((project) => `--filter=${project}`).join(" ");

export const command = `turbo run dev ${filter}`;
