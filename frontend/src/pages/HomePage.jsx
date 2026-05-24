import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, Brain, FileText, BarChart3 } from "lucide-react"
import { useNavigate } from "react-router-dom"

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card className="bg-slate-900 border-slate-800 text-white">
      <CardContent className="p-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </CardContent>
    </Card>
  )
}

function HomePage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: FileText,
      title: "Resume Upload",
      description: "Upload your resume and generate role-specific questions.",
    },
    {
      icon: Brain,
      title: "AI Questions",
      description: "OpenAI generates realistic technical and HR questions.",
    },
    {
      icon: Mic,
      title: "Voice Answers",
      description: "Record answers and evaluate communication skills.",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Get scores, weak areas, and improvement tips.",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Badge className="mb-6 bg-indigo-600 hover:bg-indigo-600">
          Career-Tech + AI + Speech Analytics
        </Badge>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight max-w-4xl">
          Crack Interviews with
          <span className="text-indigo-400"> AI Interview Coach</span>
        </h1>

        <p className="mt-6 text-xl text-slate-400 max-w-2xl">
          Practice mock interviews, answer with your voice, and receive
          AI-powered feedback.
        </p>

        <div className="mt-10">
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => navigate("/dashboard")}
          >
            Get Started
          </Button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage