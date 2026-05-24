import mongoose from "mongoose"

const interviewSchema = new mongoose.Schema(
  {
    resumeName: String,

    atsScore: Number,

    shortlisted: Boolean,

    skills: [String],

    question: String,

    answer: String,

    feedback: {
      overallScore: Number,
      communicationScore: Number,
      clarityScore: Number,
      technicalScore: Number,
      relevanceScore: Number,
    },
  },
  {
    timestamps: true,
  }
)

const Interview = mongoose.model("Interview", interviewSchema)

export default Interview