import { error } from "console";
import { contextGatherer } from "./agent";
import { getProjectStructure, saveContextFile, shallowScan } from "./StrAnalyzer";

export default async function ContextGen(){
    //get file structure info.
    const structure = getProjectStructure();
    // console.log(structure);
    console.log("Now scanning.........")
    const scanResult = shallowScan(structure.root);

    console.log("Generating the context file.....")
    const context = await contextGatherer(structure, scanResult);
    saveContextFile(context, structure.root);

    console.log(".dbagent/context.json generated successfully, do not push the context.json to github");
}
