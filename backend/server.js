import multer from "multer"
//import pdfParse from "pdf-parse"
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import OpenAI from "openai"
import { createRequire } from "module"
import PDFParser from "pdf2json"
import mongoose from "mongoose"
import Interview from "./models/Interview.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "./models/User.js"
import axios from "axios"
dotenv.config()
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err))

const app = express()
const upload = multer({ storage: multer.memoryStorage() })

app.use(cors())
app.use(express.json())

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

app.get("/", (req, res) => {
  res.send("AI Interview Coach Backend is running")
})


app.post("/api/run-code", async (req, res) => {
  try {
    const { sourceCode, language, expectedOutput } = req.body

    const code = sourceCode.trim()
    const expected = expectedOutput?.trim() || ""

    if (!code) {
      return res.json({
        compiled: false,
        ran: false,
        passed: false,
        message: "Compilation Error",
        error: "Code cannot be empty.",
        output: "",
        expectedOutput: expected,
      })
    }

    if (
      (language === "Java" && !code.includes("public class Main")) ||
      (language === "Python" && code.includes("{")) ||
      ((language === "C" || language === "C++" || language === "C#") &&
        !code.includes("main"))
    ) {
      return res.json({
        compiled: false,
        ran: false,
        passed: false,
        message: "Compilation Error",
        error: "Syntax structure is invalid for selected language.",
        output: "",
        expectedOutput: expected,
      })
    }

    const printRegex =
      /System\.out\.println\((.*?)\)|print\((.*?)\)|printf\((.*?)\)|Console\.WriteLine\((.*?)\)|cout\s*<</s

    const match = code.match(printRegex)

    if (!match) {
      return res.json({
        compiled: true,
        ran: false,
        passed: false,
        message: "Runtime Error",
        error: "No output statement found.",
        output: "",
        expectedOutput: expected,
      })
    }

    let output = match
      .slice(1)
      .find(Boolean)
      ?.replace(/["'`;]/g, "")
      .replace(/\\n/g, "")
      .trim()

    const normalizedOutput = output.replace(/\s/g, "")
    const normalizedExpected = expected.replace(/\s/g, "")

    return res.json({
      compiled: true,
      ran: true,
      passed: normalizedOutput === normalizedExpected,
      message:
        normalizedOutput === normalizedExpected
          ? "All test cases passed"
          : "Test cases failed",
      output,
      expectedOutput: expected,
    })
  } catch (error) {
    res.status(500).json({
      message: "Failed to run code",
      error: error.message,
    })
  }
})

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    res.status(201).json({
      message: "Signup successful",
      userId: user._id,
    })
  } catch (error) {
    res.status(500).json({ message: "Signup failed" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" })
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Login failed" })
  }
})


app.post("/api/analyze-resume", upload.single("resume"), async (req, res) => {
  try {

      const role = req.body.role || "MERN Developer"
     const jobDescription = req.body.jobDescription || ""
      let roleQuestions = []

switch (role) {
  case "Java Developer":
    roleQuestions = [
      "Explain OOP concepts in Java.",
      "What is multithreading in Java?",
      "Difference between ArrayList and LinkedList?",
      "Explain JVM and JDK.",
      "What are Java Streams?"
    ]
    break

  case "Data Analyst":
    roleQuestions = [
      "Explain your experience with Excel or Power BI.",
      "What is data cleaning?",
      "Difference between SQL and NoSQL?",
      "Explain data visualization.",
      "What is pivot table?"
    ]
    break

  case "Full Stack Developer":
    roleQuestions = [
      "How do you connect frontend with backend?",
      "Explain REST API architecture.",
      "How do you manage authentication?",
      "Explain database relationships.",
      "How do you deploy full stack apps?"
    ]
    break

  case "Software Tester":
    roleQuestions = [
      "What is manual testing?",
      "Difference between regression and retesting?",
      "Explain test cases.",
      "What is bug life cycle?",
      "What are API tests?"
    ]
    break

  case "Software Engineer":
    roleQuestions = [
      "Explain SDLC.",
      "How do you solve coding problems?",
      "Explain scalability.",
      "What are design patterns?",
      "How do you optimize performance?"
    ]
    break

  case "HR Round":
    roleQuestions = [
      "Tell me about yourself.",
      "Why should we hire you?",
      "What are your strengths and weaknesses?",
      "Where do you see yourself in 5 years?",
      "Why do you want this role?"
    ]
    break

  default:
    roleQuestions = [
      "Explain your MERN stack project.",
      "How have you used React in your project?",
      "Explain Express.js APIs.",
      "How did you use MongoDB?",
      "How do you manage state in React?"
    ]
}


    if (!req.file) {
      return res.status(400).json({ message: "Resume PDF is required" })
    }

    //const pdfParse = require("pdf-parse").default || require("pdf-parse")
    const resumeText = await new Promise((resolve, reject) => {
  const pdfParser = new PDFParser()

  pdfParser.on("pdfParser_dataError", (errData) => {
    reject(errData.parserError)
  })

  pdfParser.on("pdfParser_dataReady", (pdfData) => {
    const text = pdfData.Pages.map((page) =>
      page.Texts.map((textItem) =>
        textItem.R.map((r) => {
  try {
    return decodeURIComponent(r.T)
  } catch {
    return r.T
  }
}).join(" ")
      ).join(" ")
    ).join(" ")

    resolve(text)
  })

  pdfParser.parseBuffer(req.file.buffer)
})

const lowerText = resumeText.toLowerCase()

    const skills = [
      "react",
      "node",
      "express",
      "mongodb",
      "javascript",
      "typescript",
      "html",
      "css",
      "tailwind",
      "bootstrap",
      "api",
      "rest api",
      "frontend",
      "backend",
      "git",
      "github",
      "redux",
      "jwt",
      "authentication",
      "database",
      "sql",
      "mysql",
      "firebase",
    ]

    const matchedSkills = skills.filter((skill) => lowerText.includes(skill))

    const hasEmail = /\S+@\S+\.\S+/.test(resumeText)
    const hasPhone = /\d{10}/.test(resumeText)
    const hasProject = lowerText.includes("project")
    const hasEducation = lowerText.includes("education")
    const hasExperience =
      lowerText.includes("experience") ||
      lowerText.includes("internship") ||
      lowerText.includes("work")

    const wordCount = resumeText.trim().split(/\s+/).length
   const jdKeywords = jobDescription
  .toLowerCase()
  .split(/[\s,.\n]+/)
  .filter((word) => word.length > 3)

const uniqueJDKeywords = [...new Set(jdKeywords)]

const matchedJDKeywords = uniqueJDKeywords.filter((keyword) =>
  lowerText.includes(keyword)
)

const missingKeywords = uniqueJDKeywords.filter(
  (keyword) => !lowerText.includes(keyword)
)

const jdMatchScore =
  uniqueJDKeywords.length > 0
    ? Math.round(
        (matchedJDKeywords.length / uniqueJDKeywords.length) * 100
      )
    : atsScore
    let atsScore = 0

    atsScore += hasEmail ? 10 : 0
    atsScore += hasPhone ? 10 : 0
    atsScore += hasEducation ? 10 : 0
    atsScore += hasProject ? 15 : 0
    atsScore += hasExperience ? 15 : 0
    atsScore += Math.min(30, matchedSkills.length * 3)
    atsScore += wordCount > 250 ? 10 : 5

    atsScore = Math.round((atsScore + jdMatchScore) / 2)
atsScore = Math.min(95, atsScore)

    const shortlisted = atsScore >= 65

    let questions = []

try {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert technical interviewer. Generate fresh, unique, resume-based interview questions. Return only valid JSON. No markdown.",
      },
      {
        role: "user",
        content: `Resume Text:
${resumeText}

Matched Skills:
${matchedSkills.join(", ")}

Generate 10 unique interview questions based on this resume.
Questions should be different each time, practical, and suitable for a fresher MERN stack developer interview.

Return ONLY valid JSON in this format:
{
  "questions": [
    "Question 1",
    "Question 2"
  ]
}`,
      },
    ],
    temperature: 0.9,
    response_format: { type: "json_object" },
  })

  const parsed = JSON.parse(completion.choices[0].message.content)
 questions = [...parsed.questions, ...roleQuestions]
  .sort(() => Math.random() - 0.5)
  .slice(0, 10)
} catch (error) {
  console.log("OpenAI unavailable. Using fallback resume questions.")

  const fallbackQuestions = [
  "Tell me about yourself based on your resume.",
  hasProject
    ? "Explain one project from your resume in detail."
    : "Which project have you worked on recently?",
  matchedSkills.includes("react")
    ? "How have you used React in your project?"
    : "Explain your frontend development knowledge.",
  matchedSkills.includes("node") || matchedSkills.includes("express")
    ? "How did you build backend APIs using Node.js or Express.js?"
    : "What do you know about backend development?",
  matchedSkills.includes("mongodb")
    ? "How did you use MongoDB in your project?"
    : "Which database have you used and why?",
  "What challenges did you face while building your project?",
  "Why should we shortlist you for this role?",
  "Explain your biggest technical achievement.",
  "How do you debug issues in your project?",
  "What did you learn from your last project?",
  "How would you improve your current project?",
  "Which frontend concept are you strongest in?",
  "Which backend concept are you strongest in?",
  "How do you optimize website performance?",
  "Explain your API workflow.",
]

questions = [...fallbackQuestions, ...roleQuestions]
  .sort(() => Math.random() - 0.5)
  .slice(0, 10)
  .sort(() => Math.random() - 0.5)
  .slice(0, 7)
}
    res.json({
      atsScore,
      shortlisted,
      matchedSkills,
      questions,
      jdMatchScore,
missingKeywords: missingKeywords.slice(0, 10),
      resumeSummary: "Resume analyzed successfully.",
    })
  } catch (error) {
    console.error("Resume Analyze Error:", error)
    res.status(500).json({
      message: "Failed to analyze resume",
      error: error.message,
    })
  }
})
app.post("/api/analyze-answer", async (req, res) => {
  try {
    const { question, answer } = req.body

    if (!question || !answer) {
      return res.status(400).json({
        message: "Question and answer are required",
      })
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert AI Interview Coach. Return only valid JSON. No markdown.",
          },
          {
            role: "user",
            content: `Analyze this interview answer.

Question: ${question}

Answer: ${answer}

Return JSON with:
overallScore, communicationScore, clarityScore, technicalScore, relevanceScore, strengths, weakAreas, improvementTips, improvedAnswer`,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      })

      const feedback = JSON.parse(completion.choices[0].message.content)
      return res.json(feedback)
    } catch (openAiError) {
      console.log("OpenAI unavailable. Using fallback feedback.")

      const words = answer.trim().split(/\s+/)
      const wordCount = words.length
      const lowerAnswer = answer.toLowerCase()
      const lowerQuestion = question.toLowerCase()

      const questionKeywords = lowerQuestion
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 3)

      const matchedKeywords = questionKeywords.filter((word) =>
        lowerAnswer.includes(word)
      )

      const relevanceScore = Math.min(
        95,
        45 + matchedKeywords.length * 10
      )

      const communicationScore = Math.min(
        95,
        wordCount < 10 ? 45 : 55 + wordCount * 2
      )

      const clarityScore =
        lowerAnswer.includes("first") ||
        lowerAnswer.includes("second") ||
        lowerAnswer.includes("because") ||
        lowerAnswer.includes("for example")
          ? 82
          : 65

      const technicalWords = [
        "react",
        "node",
        "express",
        "mongodb",
        "api",
        "state",
        "component",
        "database",
        "server",
        "frontend",
        "backend",
        "authentication",
      ]

      const technicalMatches = technicalWords.filter((word) =>
        lowerAnswer.includes(word)
      )

      const technicalScore = Math.min(
        95,
        50 + technicalMatches.length * 8
      )

      const overallScore = Math.round(
        (communicationScore +
          clarityScore +
          technicalScore +
          relevanceScore) /
          4
      )

      const feedback = {
        overallScore,
        communicationScore,
        clarityScore,
        technicalScore,
        relevanceScore,
        strengths: [
          wordCount >= 25
            ? "Answer has good detail and enough length."
            : "Answer is short but gives a starting point.",
          matchedKeywords.length > 0
            ? "Answer is connected to the question."
            : "Answer attempts to respond to the question.",
        ],
        weakAreas: [
          wordCount < 25
            ? "Answer needs more explanation and examples."
            : "Answer can be more structured.",
          technicalMatches.length < 2
            ? "Technical keywords and project details are limited."
            : "Technical explanation can be deeper.",
        ],
        improvementTips: [
          "Use STAR format: Situation, Task, Action, Result.",
          "Add one real project example with technologies used.",
          "Mention measurable result or learning from your work.",
          "Keep answer structured: intro, explanation, example, conclusion.",
        ],
        improvedAnswer: `A stronger answer would directly address the question, explain your approach clearly, and include a real project example. For example: "In my MERN stack project, I used React for frontend, Node.js and Express for backend APIs, and MongoDB for storing data. I handled state, API integration, and user flow. This helped me understand full-stack development and improve problem-solving."`,
      }

      
      await Interview.create({
  resumeName: "Resume.pdf",

  atsScore: feedback.overallScore || 0,

  shortlisted: feedback.overallScore >= 60,

  skills: [],

  question,

  answer,

  feedback: {
    overallScore: feedback.overallScore || 0,
    communicationScore: feedback.communicationScore || 0,
    clarityScore: feedback.clarityScore || 0,
    technicalScore: feedback.technicalScore || 0,
    relevanceScore: feedback.relevanceScore || 0,
  },
})


      return res.json(feedback)
    }
  } catch (error) {
    console.error("Analyze Error:", error)

    res.status(500).json({
      message: "Failed to analyze answer",
      error: error.message,
    })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})