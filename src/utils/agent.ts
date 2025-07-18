import { GoogleGenAI } from "@google/genai";
import { ProjectPaths, ShallowScanResult } from "./StrAnalyzer";
import dotenv from "dotenv";
dotenv.config()



export function codeGen() {

}

export function codeCombiner() {

}

export async function contextGatherer(structure : ProjectPaths, scanResult : ShallowScanResult) {

     const files = Object.entries(scanResult)
    .slice(0, 10) // limit to avoid token overload
    .map(([filePath, { content }]) => ({
      path: filePath,
      content: content.slice(0, 2000), // trim large files
    }));

        const ai = new GoogleGenAI({
            apiKey : process.env.API_KEY!
        });

    const prompt = `You are a proffesional nextjs developer and analyzer, given the project structure and route directories you can determine what the project is about and how it is made.
    You will give out a structured json output which has an array of object. Each object has a route/directory name 
    , approx lines of code if any and probable description. strictly stick to the scanresults and project structure which will be given and properly analyze it.
    DO NOT RETURN NON EXISTING OR IMAGINARY ROUTES WHICH ARE NOT GIVEN IN THE INPUTS.

    structure : 
    ${JSON.stringify(structure, null, 2)}

    Scan results : 
    \n${files
    .map((f) => `// File: ${f.path}\n${f.content}`)
    .join("\n\n")}

    Here is the type of structure I'll give you : 
        {root: string;
        basePath: string;
        routerType: "app" | "pages";
        routerDir: string;
        componentsDir: string;
        apiDir: string;
        prismaDir: string;}

    use these structure inputs in the output you give.
    In output there is a structure variable which is object. It will be given by me.

   This is just example format of output , in the real output return only what given in the actual structure and scan results after analysing it.: 
    {
  "generatedAt": "2025-07-17T10:40:22.123Z",
  "summary": {
    "totalFiles": 87,
    "totalLines": 12341
  },
  "structure": {
    "root": "/Users/mohak/my-app",
    "basePath": "/Users/mohak/my-app/src",
    "routerType": "app",
    "routerDir": "/Users/mohak/my-app/src/app",
    "componentsDir": "/Users/mohak/my-app/src/components",
    "apiDir": "/Users/mohak/my-app/src/app/api"
  },
  "routes": {
    "src/app/api/auth/login/route.ts": {
      "Description" : "This file has the logic code to login users"
      "methods": ["POST"],
      "approxLines": 35
    },
    "src/app/api/user/[id]/route.ts": {
      "Description" : "this files probably contains the logic to get a user info by id and update it looking at the code"
      "methods": ["GET", "PUT"],
      "approxLines": 48
    },
    "src/app/api/post/route.ts": {
      "Description" : "this code gives us the what are the posts"
      "methods": ["GET", "POST"],
      "approxLines": 72
    }
  }
}


Strictly give the json out put and nothing else. And once again very important strictly stick to the scanresults and project structure.
    `

    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      thinkingConfig: {
       thinkingBudget: 1024,
        // Turn off thinking:
        // thinkingBudget: 0
        // Turn on dynamic thinking:
         
      },
    }
  })

  return response.text
}