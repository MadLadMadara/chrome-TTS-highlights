import packageJson from "./package.json" assert { type: 'json' };
let getAbsolutPkgPaths = async () => {
    console.group("Absolute paths to packages");
    for (const [key, value] of await Object.entries(packageJson.dependencies)) {
        const fullPath = await import.meta.resolve(key);
        const path = fullPath?.match(/(\/node_modules.*)/)[0];
        console.group(`${key}`);
        console.log(`version : ${value}`);
        console.log(`full path: ${fullPath}`);
        console.log(`absolute path: ${path}`);
        console.groupEnd();
    }
    console.groupEnd();
};
getAbsolutPkgPaths();

