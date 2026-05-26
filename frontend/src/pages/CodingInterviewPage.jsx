import axios from "axios"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const questions = [
  {
    title: "Two Sum",
    description: "Find two indices whose values add up to target.",
    input: "nums = [2,7,11,15], target = 9",
    output: "[0,1]",
    constraints: "2 <= nums.length <= 10^4",
  },
  {
    title: "Best Time to Buy and Sell Stock",
    description: "Find maximum profit from stock prices.",
    input: "[7,1,5,3,6,4]",
    output: "5",
    constraints: "1 <= prices.length <= 10^5",
  },
  {
    title: "Contains Duplicate",
    description: "Check whether array contains duplicates.",
    input: "[1,2,3,1]",
    output: "true",
    constraints: "1 <= nums.length <= 10^5",
  },
  {
    title: "Maximum Subarray",
    description: "Find contiguous subarray with largest sum.",
    input: "[-2,1,-3,4,-1,2,1,-5,4]",
    output: "6",
    constraints: "1 <= nums.length <= 10^5",
  },
  {
    title: "Reverse String",
    description: "Reverse the given string.",
    input: `"hello"`,
    output: `"olleh"`,
    constraints: "1 <= s.length <= 10^5",
  },
  {
    title: "Palindrome Number",
    description: "Check whether integer is palindrome.",
    input: "121",
    output: "true",
    constraints: "-2^31 <= x <= 2^31 -1",
  },
  {
    title: "Binary Search",
    description: "Find target using binary search.",
    input: "nums=[1,2,3,4,5], target=4",
    output: "3",
    constraints: "1 <= nums.length <= 10^5",
  },
  {
    title: "Merge Sorted Arrays",
    description: "Merge two sorted arrays.",
    input: "[1,2,3] [2,5,6]",
    output: "[1,2,2,3,5,6]",
    constraints: "1 <= nums.length <= 10^5",
  },
  {
    title: "Valid Anagram",
    description: "Check whether two strings are anagrams.",
    input: `"anagram", "nagaram"`,
    output: "true",
    constraints: "1 <= s.length <= 5*10^4",
  },
  {
    title: "Climbing Stairs",
    description: "Find number of ways to climb stairs.",
    input: "5",
    output: "8",
    constraints: "1 <= n <= 45",
  },

  // इथून पुढे same pattern मध्ये continue...
]

while (questions.length < 1000) {
  questions.push({
    ...questions[questions.length % 10],
    title:
      questions[questions.length % 10].title +
      " " +
      (questions.length + 1),
  })
}

const templates = {
  C: `#include <stdio.h>

int main() {
    // Write your C code here
    return 0;
}`,
  "C++": `#include <iostream>
using namespace std;

int main() {
    // Write your C++ code here
    return 0;
}`,
  Java: `public class Main {
    public static void main(String[] args) {
        // Write your Java code here
    }
}`,
  Python: `# Write your Python code here
print("Hello World")`,
  "C#": `using System;

class Program {
    static void Main() {
        // Write your C# code here
    }
}`,
}

function CodingInterviewPage() {
  const [timeLeft, setTimeLeft] = useState(900)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [language, setLanguage] = useState("Java")
  const [code, setCode] = useState(templates.Java)
  const [result, setResult] = useState("")

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec < 10 ? "0" : ""}${sec}`
  }

  const changeLanguage = (e) => {
    const selected = e.target.value
    setLanguage(selected)
    setCode(templates[selected])
    setResult("")
  }

  const nextQuestion = () => {
    setCurrentQuestion((prev) => (prev + 1) % questions.length)
    setResult("")
  }

  const previousQuestion = () => {
    setCurrentQuestion((prev) =>
      prev === 0 ? questions.length - 1 : prev - 1
    )
    setResult("")
  }

  const runTests = async () => {
  try {

    setResult("Running test cases...")

    const response = await axios.post(
      "https://ai-interview-coach-with-ats-analyzer.onrender.com/api/run-code",
      {
        sourceCode: code,
        language,

        expectedOutput:
          q.output.replace(/"/g, "").trim(),
      }
    )

    const data = response.data

    if (!data.compiled) {
      setResult(`❌ Compilation Error\n\n${data.error}`)
      return
    }

    if (!data.ran) {
      setResult(`❌ Runtime Error\n\n${data.error}`)
      return
    }

    if (data.passed) {
      setResult(
        `✅ All Test Cases Passed\n\nOutput: ${data.output}`
      )
    } else {
      setResult(
        `❌ Test Cases Failed

Expected: ${data.expectedOutput}

Your Output: ${data.output}`
      )
    }

  } catch (error) {
  console.error("Run Code Error:", error)

  setResult(
    `❌ Failed to run code

${error.response?.data?.error || error.response?.data?.message || error.message}`
  )
}
}

  const q = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Live Coding Interview</h1>
          <div className="bg-red-600 px-5 py-2 rounded-xl font-bold">
            Timer: {formatTime(timeLeft)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>
                Question {currentQuestion + 1} / {questions.length}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <h2 className="text-xl font-semibold text-indigo-400">
                {q.title}
              </h2>

              <p className="text-slate-300">{q.description}</p>

              <div className="bg-slate-950 p-4 rounded-xl space-y-2">
  <p>
    <span className="text-indigo-400 font-semibold">Input:</span> {q.input}
  </p>

  <p>
    <span className="text-indigo-400 font-semibold">Output:</span> {q.output}
  </p>

  <p>
    <span className="text-indigo-400 font-semibold">Constraints:</span>{" "}
    {q.constraints || "1 <= n <= 10^5"}
  </p>
</div>

              <div className="flex gap-3">
                <Button onClick={previousQuestion} className="bg-slate-700">
                  Previous
                </Button>

                <Button
                  onClick={nextQuestion}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Next Question
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle>Code Editor</CardTitle>
            </CardHeader>

            <CardContent>
              <select
                value={language}
                onChange={changeLanguage}
                className="mb-4 w-full bg-slate-950 border border-slate-700 rounded-xl p-3"
              >
                <option>C</option>
                <option>C++</option>
                <option>Java</option>
                <option>Python</option>
                <option>C#</option>
              </select>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={18}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-sm outline-none focus:border-indigo-500"
              />

              <Button
                onClick={runTests}
                className="mt-4 bg-green-600 hover:bg-green-700"
              >
                Run Test Cases
              </Button>

              {result && (
                <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl whitespace-pre-wrap text-sm overflow-auto max-h-[300px]">
  {result}
</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CodingInterviewPage