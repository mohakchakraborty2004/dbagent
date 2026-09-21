# dbagent

## 🔧 Setup

1. Clone the repository  
2. Populate the `.env` file as shown in `.env.example`  
3. Run `npm install`  
4. Run `npm run build`  
5. Run `npm link`  
6. You're good to go! Use it in any Next.js repository.

---

##  How to Use

1. Run `npx dbagent init`  
   → Initializes the agent with a shallow context of your project  
2. Run `npx dbagent "YOUR_QUERY_HERE"`  
   → Executes the query to create files, write, and update code accordingly

CLI activity and errors are appended to the operating system's user state directory
(`$XDG_STATE_HOME/dbagent/dbagent.log` on Linux, with standard platform fallbacks).
Queries, generated commands, and generated file paths are not included in the log.

---

## 🧠 About This Project

This agent is **heavily prioritized on correctness and accuracy** when creating database schemas and backend API routes.  
The **second priority** is integrating correctly into the backend.  

Since it performs a **shallow scan** to save resources, it currently overlooks CSS and focuses on the core backend structure of the project.  
A **deep scan feature** will be introduced later to include frontend and build complete end-to-end functionality.

---

##  Engineering Highlight

The core innovation(well atleast to me) here is the **decision to store context locally** in the user's project root, instead of relying on the model's memory — which can run out.  
This allows the agent to re-use project understanding across multiple queries by sending context along each time.

---

## 🤖 Models Used

1. **gemini-2.5-flash**  
   - Used for scanning and context gathering  
   - Thinking budget: **1024**  
   - Chosen for speed

2. **gemini-2.5-pro**  
   - Used for code generation  
   - Thinking budget: **20,000**  
   - Chosen for accuracy and correctness

---

Thank you for your attention to this matter!
