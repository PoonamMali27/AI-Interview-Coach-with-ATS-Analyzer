import jsPDF from "jspdf"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  Brain,
  Mic,
  BarChart3,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

function DashboardPage() {
  const navigate = useNavigate()


  const handleLogout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")

  navigate("/login")
}
  
const startMockInterview = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })

    setCameraStream(stream)
    setIsCameraOn(true)

    const recorder = new MediaRecorder(stream)
    let chunks = []

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = "mock-interview-recording.webm"
      a.click()
      alert("Mock Interview saved successfully!")
    }

    recorder.start()
    setMediaRecorder(recorder)
  } catch (error) {
    alert("Please allow camera and microphone permission.")
  }
}
const stopMockInterview = () => {

  if (mediaRecorder) {
    mediaRecorder.stop()
  }

  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop())
  }

  setCameraStream(null)
  setIsCameraOn(false)
}


useEffect(() => {
  const token = localStorage.getItem("token")

  if (!token) {
    navigate("/login")
  }
}, [navigate])
  const [resumeName, setResumeName] = useState("")

  const [resumeFile, setResumeFile] = useState(null)
  const [questions, setQuestions] = useState([])
  const [selectedQuestion, setSelectedQuestion] = useState("")
const [answer, setAnswer] = useState("")
const [savedAnswers, setSavedAnswers] = useState([])
const [isRecording, setIsRecording] = useState(false)
const recognitionRef = useRef(null)
const [feedback, setFeedback] = useState(null)
const [isAnalyzing, setIsAnalyzing] = useState(false)
const [isUploadingResume, setIsUploadingResume] = useState(false)
const [atsScore, setAtsScore] = useState(null)
const [shortlisted, setShortlisted] = useState(null)
const [matchedSkills, setMatchedSkills] = useState([])
const [selectedRole, setSelectedRole] = useState("MERN Developer")
const [jobDescription, setJobDescription] = useState("")
const [isCameraOn, setIsCameraOn] = useState(false)
const [cameraStream, setCameraStream] = useState(null)
const [mediaRecorder, setMediaRecorder] = useState(null)
const [audioChunks, setAudioChunks] = useState([])

useEffect(() => {
  if (videoRef.current && cameraStream) {
    videoRef.current.srcObject = cameraStream
    videoRef.current.play()
  }
}, [cameraStream])


const videoRef = useRef(null)
const handleResumeUpload = async (event) => {
  const file = event.target.files[0]

  if (!file) return

  if (file.type !== "application/pdf") {
    alert("Please upload only PDF resume.")
    return
  }

  setResumeName(file.name)
  setResumeFile(file)

  try {
    const formData = new FormData()
    formData.append("resume", file)
    formData.append("role", selectedRole)
   formData.append("jobDescription", jobDescription)

    const response = await fetch("http://192.168.137.1:5000/api/analyze-resume", {
      method: "POST",
      body: formData,
    })
   setIsUploadingResume(true)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to analyze resume")
    }

    setAtsScore(data.atsScore)
    setShortlisted(data.shortlisted)
    setMatchedSkills(data.matchedSkills || [])
    setQuestions(data.questions || [])
   setIsUploadingResume(false)
    // जुना feedback reset
    setSelectedQuestion("")
    setAnswer("")
    setFeedback(null)
  } catch (error) {
    setIsUploadingResume(false)
    console.error("Resume Analyze Error:", error)
    alert(error.message || "Failed to analyze resume")
  }
}

const regenerateQuestions = async () => {
  if (!resumeFile) {
    alert("Please upload your resume first.")
    return
  }

  try {
    const formData = new FormData()
    formData.append("resume", resumeFile)
    formData.append("role", selectedRole)
    formData.append("jobDescription", jobDescription)

    const response = await fetch("http://192.168.137.1:5000/api/analyze-resume", {
      method: "POST",
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to generate questions")
    }

    setQuestions(data.questions || [])
    setSelectedQuestion("")
    setAnswer("")
    setFeedback(null)
  } catch (error) {
    console.error("Generate Questions Error:", error)
    alert(error.message || "Failed to generate questions")
  }
}


  const generateQuestions = () => {
    if (!resumeName) {
      alert("Please upload your resume first.")
      return
    }

    setQuestions([
      "Tell me about yourself and your technical background.",
      "Explain one MERN stack project you have built.",
      "How does React manage state?",
      "What is the difference between Node.js and Express.js?",
      "How will you improve your communication during interviews?",
    ])
  }
  const saveAnswer = () => {
  if (!selectedQuestion) {
    alert("Please select a question first.")
    return
  }

  if (!answer.trim()) {
    alert("Please write your answer first.")
    return
  }

  setSavedAnswers([
    ...savedAnswers,
    {
      question: selectedQuestion,
      answer: answer,
    },
  ])

  alert("Answer saved successfully!")
  setAnswer("")
}
const analyzeAnswer = async () => {
  if (!answer.trim()) {
    alert("Please write or record your answer first.")
    return
  }

  try {
    setIsAnalyzing(true)
    const response = await fetch("http://192.168.137.1:5000/api/analyze-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: selectedQuestion,
        answer: answer,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to analyze answer")
    }

    const data = await response.json()

    setFeedback({
      communication: data.communicationScore,
      clarity: data.clarityScore,
      technical: data.technicalScore,
      overall: data.overallScore,
      relevance: data.relevanceScore,
      strengths: data.strengths,
      weakAreas: data.weakAreas,
      tips: data.improvementTips,
      improvedAnswer: data.improvedAnswer,
    })
    setIsAnalyzing(false)
  } catch (error) {
    setIsAnalyzing(false)
    console.error("Analyze Error:", error)
    alert("Failed to analyze answer")
  }
}

const downloadReport = () => {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text("AI Interview Coach Report", 20, 20)

  doc.setFontSize(12)
  doc.text(`Resume: ${resumeName || "Not uploaded"}`, 20, 35)
  doc.text(`ATS Score: ${atsScore || 0}%`, 20, 45)
  doc.text(`Status: ${shortlisted ? "Shortlisted" : "Not Shortlisted"}`, 20, 55)

  if (selectedQuestion) {
    doc.text("Selected Question:", 20, 70)
    doc.text(doc.splitTextToSize(selectedQuestion, 170), 20, 80)
  }

  if (answer) {
    doc.text("Answer:", 20, 105)
    doc.text(doc.splitTextToSize(answer, 170), 20, 115)
  }

  if (feedback) {
    doc.text(`Overall Score: ${feedback.overall || 0}%`, 20, 145)
    doc.text(`Communication: ${feedback.communication || 0}%`, 20, 155)
    doc.text(`Clarity: ${feedback.clarity || 0}%`, 20, 165)
    doc.text(`Technical: ${feedback.technical || 0}%`, 20, 175)
  }

  doc.save("interview-report.pdf")
}


const startRecording = async () => {
  try {
    // Browser कडून mic permission explicitly मागतो
    await navigator.mediaDevices.getUserMedia({ audio: true })

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let transcript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }

      setAnswer((prev) => `${prev} ${transcript}`.trim())
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      alert(`Speech recognition error: ${event.error}`)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  } catch (error) {
    console.error("Microphone permission error:", error)
    alert("Microphone permission denied. Please allow microphone access and try again.")
  }
}

const stopRecording = () => {
  if (recognitionRef.current) {
    recognitionRef.current.stop()
  }

  setIsRecording(false)
}
  return (


    
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5 mb-8">
          <div>
            <Badge className="bg-indigo-600 mb-3">AI Interview Coach</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold">Candidate Dashboard</h1>
            <p className="text-slate-400 mt-2">
              Upload resume, generate questions, record answers and view feedback.
            </p>
          </div>

          <div className="flex gap-3">
  <Button
  onClick={startMockInterview}
  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
>
  Start Mock Interview
</Button>

<Button
  onClick={() => navigate("/coding-interview")}
  className="bg-green-600 hover:bg-green-700"
>
  Live Coding
</Button>


  <Button
    onClick={handleLogout}
    className="bg-red-600 hover:bg-red-700"
  >
    Logout
  </Button>
</div>
        </div>

     
       {isCameraOn && (
  <div className="mb-8 bg-slate-900 border border-slate-800 rounded-2xl p-4">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Mock Interview Camera Preview</h2>

      <Button
        onClick={stopMockInterview}
        className="bg-red-600 hover:bg-red-700"
      >
        End Interview
      </Button>
    </div>

    <video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  className="w-full rounded-2xl bg-black max-h-[420px] object-cover"
/>
  </div>
)}


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            ["Resume Score", "82%", CheckCircle],
            ["Communication", "76%", Mic],
            ["Technical Skill", "68%", Brain],
            ["Weak Areas", "3", AlertCircle],
          ].map(([title, value, Icon]) => (
            <Card key={title} className="bg-slate-900 border-slate-800 text-white">
              <CardContent className="p-6">
                <Icon className="text-indigo-400 mb-4" />
                <p className="text-slate-400">{title}</p>
                <h2 className="text-3xl font-bold mt-2">{value}</h2>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="text-indigo-400" /> Resume Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-dashed border-slate-700 rounded-2xl p-8 text-center space-y-4">
                <Upload className="mx-auto mb-4 text-slate-400" size={40} />
                <p className="text-slate-300 mb-4">
                  Upload your resume PDF to generate personalized questions.
                </p>

                <div className="mt-5 text-left">
  <label className="block mb-2 text-sm text-slate-400">
    Paste Job Description
  </label>

  <textarea
    value={jobDescription}
    onChange={(e) => setJobDescription(e.target.value)}
    rows={5}
    placeholder="Paste company job description here..."
    className="w-full rounded-xl bg-slate-950 border border-slate-700 p-4 text-white outline-none focus:border-indigo-500"
  />
</div>

                <input
                  id="resume-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeUpload}
                  className="hidden"
                />

                <label htmlFor="resume-upload">
                  <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                    <span>
  {isUploadingResume ? "Analyzing Resume..." : "Upload Resume"}
</span>
                  </Button>
                </label>

                {resumeName && (
                  <p className="text-green-400 mt-4">
                    Uploaded: {resumeName}
                  </p>
                )}
                {atsScore !== null && (
  <div className="mt-4 space-y-2 text-left">
    <p className="text-white font-semibold">
      ATS Score: <span className="text-indigo-400">{atsScore}%</span>
    </p>

    <p
      className={`font-semibold ${
        shortlisted ? "text-green-400" : "text-red-400"
      }`}
    >
      {shortlisted ? "Shortlisted ✅" : "Not Shortlisted ❌"}
    </p>

    {matchedSkills.length > 0 && (
      <p className="text-slate-400 text-sm">
        Skills Found: {matchedSkills.join(", ")}
      </p>
    )}
  </div>
)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="text-indigo-400" /> Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Confidence</span>
                  <span>78%</span>
                </div>
                <Progress value={78} />
              </div>

              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Clarity</span>
                  <span>72%</span>
                </div>
                <Progress value={72} />
              </div>

              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Technical Accuracy</span>
                  <span>68%</span>
                </div>
                <Progress value={68} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900 border-slate-800 text-white mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="text-indigo-400" /> AI Generated Interview Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
  onClick={regenerateQuestions}
  className="bg-indigo-600 hover:bg-indigo-700"
>
  Generate Questions
</Button>

            {questions.length > 0 && (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div
  key={index}
  onClick={() => setSelectedQuestion(question)}
  className="p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-indigo-500 hover:bg-slate-900 transition"
>
                    <p className="text-slate-300">
                      <span className="text-indigo-400 font-semibold">
                        Q{index + 1}.
                      </span>{" "}
                      {question}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {selectedQuestion && (
  <div className="mt-6 space-y-4">
    <div className="p-5 rounded-xl bg-slate-950 border border-indigo-500">
      <h3 className="text-lg font-semibold text-indigo-400 mb-2">
        Selected Question
      </h3>
      <p className="text-slate-300">{selectedQuestion}</p>
    </div>

    <div>
      <label className="block mb-2 text-sm text-slate-400">
        Type Your Answer
      </label>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={6}
        placeholder="Write your interview answer here..."
        className="w-full rounded-xl bg-slate-950 border border-slate-700 p-4 text-white outline-none focus:border-indigo-500"
      />
    </div>
   <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
  {!isRecording ? (
    <Button
      onClick={startRecording}
      className="bg-green-600 hover:bg-green-700"
    >
      Start Recording
    </Button>
  ) : (
    <Button
      onClick={stopRecording}
      className="bg-red-600 hover:bg-red-700"
    >
      Stop Recording
    </Button>
  )}

  {isRecording && (
    <p className="text-red-400 flex items-center">
      Recording...
    </p>
  )}
</div>
<Button onClick={analyzeAnswer} className="bg-pink-600 hover:bg-pink-700">
 {isAnalyzing ? "Analyzing..." : "Analyze Answer"}
</Button>
    <Button onClick={saveAnswer} className="bg-indigo-600 hover:bg-indigo-700">
  Save Answer
</Button>
  </div>
)}

{feedback && (
  <div className="p-5 rounded-xl bg-slate-950 border border-pink-500 space-y-4">
    <h3 className="text-lg font-semibold text-pink-400">
      AI Feedback
    </h3>

    <p>Communication Score: {feedback.communication}%</p>
    <Progress value={feedback.communication} />

    <p>Clarity Score: {feedback.clarity}%</p>
    <Progress value={feedback.clarity} />

    <p>Technical Score: {feedback.technical}%</p>
    <Progress value={feedback.technical} />

    <div>
      <h4 className="text-indigo-400 font-semibold mb-2">
        Improvement Tips
      </h4>
      {feedback.tips.map((tip, index) => (
        <p key={index} className="text-slate-400">
          • {tip}
        </p>
      ))}

     {feedback && (
  <Button onClick={downloadReport} className="bg-yellow-600 hover:bg-yellow-700">
    Download PDF Report
  </Button>
)}

    </div>
  </div>
)}


{savedAnswers.length > 0 && (
  <div className="mt-6 space-y-4">
    <h3 className="text-lg font-semibold text-indigo-400">
      Saved Answers
    </h3>

    {savedAnswers.map((item, index) => (
      <div
        key={index}
        className="p-4 rounded-xl bg-slate-950 border border-slate-800"
      >
        <p className="text-slate-300 font-semibold mb-2">
          Q{index + 1}. {item.question}
        </p>
        <p className="text-slate-400">
          {item.answer}
        </p>
      </div>
    ))}
  </div>
)}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage