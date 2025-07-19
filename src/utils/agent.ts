import { GoogleGenAI, Type } from "@google/genai";
import { ProjectPaths, ShallowScanResult } from "./StrAnalyzer";
import dotenv from "dotenv";
import { mergeType } from "../agentPipeline";
dotenv.config()

const API_KEY = process.env.API_KEY!

function main() {
  console.log(typeof(API_KEY));
}

main();

interface CodeGenItem {
  type: string;
  directory: string;
  fileName: string;
  content: string;
  command: string;
  description: string;
}

export async function codeGen(query : string, projectContext : any) : Promise<CodeGenItem[] | undefined>  {

       const ai = new GoogleGenAI({
            apiKey : API_KEY
        });

 const prompt = `You are a professional typescript prisma and nextjs developer, experienced in writing advanced db schema models and apis using prisma, and then integrating and creating components with the same.
 you will be give a simple query and context of the whole project that what the project is about. You are to carefully analyze that query think and write code for the same.
 Give more focus on creating schemas in prisma file and then writing the api end point in nextjs. After that also write the frontend component for the same implementing the route in the frontend. Use proper server side and client side rendering and there
 should be no hydration error strictly
 Also you will be giving what commands to run. 
 You will also be given the existing context of the project which will have the routes and descriptions. If the code can be and is to be written in the same route given in context, then give the same route and file name, ELSE GIVE A NEW ROUTE DIRECTORY AND FILENAME.

 Here is the given query by user : ${query}

 Here is the project context : ${projectContext}

 keep the type in json schema either "file" or "command" to describe whether the content is file code or an command to execute.
 strictly stick to the  json schema. 
 `

 const response = await ai.models.generateContent({
  model: "gemini-2.5-pro",
  contents: prompt,

  config: {
  thinkingConfig: {
       thinkingBudget: 20000  
      },
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING, 
        },
        directory: {
          type: Type.STRING,
        },
        fileName: {
          type: Type.STRING,
        },
        content: {
          type: Type.STRING,
        },
        command: {
          type: Type.STRING,
        },
        description: {
          type: Type.STRING, 
        },
      },
      propertyOrdering: [
        "type",
        "directory",
        "fileName",
        "content",
        "command",
        "description"
      ],
    },
  },
}
});
 
    const parsedResult: CodeGenItem[] = JSON.parse(response.text!);
    console.log("code generated successfully.")   
    return parsedResult;
}


export async function codeCombiner(existingCode: string, newCode: string) : Promise<mergeType | undefined> {
    const ai = new GoogleGenAI({
            apiKey : API_KEY
        });
    const prompt = `You are a proffesional typescript, nextjs and prisma developer. you will be given two pieces of code. You need to combine the two code blocks
    such that the updated code is in working condition. Return only the code according to the schema given to you. make no mistakes and strictly stick to the schema.
    
    Here is the existing code : ${existingCode}
    Here is the new code : ${newCode} 

    strictly follow what I said , don't break anything. 
    `

    const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      thinkingConfig: {
       thinkingBudget: 20000  
      },
      responseMimeType : "application/json",
      responseSchema :  {
  type: Type.OBJECT,
  properties: {
    code: {
      type: Type.STRING,
    },
  },
  required: ["code"],
  propertyOrdering: ["code"],
}
    }
  });


  return JSON.parse(response.text!)
}

export async function contextGatherer(structure : ProjectPaths, scanResult : ShallowScanResult) {

     const files = Object.entries(scanResult)
    .slice(0, 10) 
    .map(([filePath, { content }]) => ({
      path: filePath,
      content: content.slice(0, 2000), 
    }));

        const ai = new GoogleGenAI({
            apiKey : API_KEY
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