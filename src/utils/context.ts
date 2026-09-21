import { error } from "console";
import { contextGatherer } from "./agent";
import { getProjectStructure, saveContextFile, shallowScan } from "./StrAnalyzer";
import { logToFile } from "./logger";

export default async function ContextGen(){
    logToFile("INFO", "Context generation started");
    //get file structure info.
    const structure = getProjectStructure();
    // console.log(structure);
    console.log("Now scanning.........")
    const scanResult = shallowScan(structure.root);
    logToFile("INFO", "Project scan completed");

    console.log("Generating the context file.....")
    const context = await contextGatherer(structure, scanResult);
    saveContextFile(context, structure.root);
    logToFile("INFO", "Context file saved");

    console.log(".dbagent/context.json generated successfully, do not push the context.json to github");
}
