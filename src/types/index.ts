
export interface Story {
  id: string;
  title: string;
  principle: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  createdAt: string;
  updatedAt: string;
  elevenLabsConversationId?: string; // New field to store ElevenLabs conversation ID
  conversation?: {
    messages: Array<{
      role: 'ai' | 'user';
      content: string;
    }>;
    audioUrl: string | null;
    timestamp: string | null;
  };
}

export const LEADERSHIP_PRINCIPLES = [
  {
    name: "Customer Obsession",
    description: "Leaders start with the customer and work backwards. They work vigorously to earn and keep customer trust."
  },
  {
    name: "Ownership",
    description: "Leaders are owners. They think long term and don't sacrifice long-term value for short-term results."
  },
  {
    name: "Invent and Simplify",
    description: "Leaders expect and require innovation and invention from their teams and always find ways to simplify."
  },
  {
    name: "Are Right, A Lot",
    description: "Leaders are right a lot. They have strong judgment and good instincts."
  },
  {
    name: "Learn and Be Curious",
    description: "Leaders are never done learning and always seek to improve themselves."
  },
  {
    name: "Hire and Develop the Best",
    description: "Leaders raise the performance bar with every hire and promotion."
  },
  {
    name: "Insist on the Highest Standards",
    description: "Leaders have relentlessly high standards — many people may think these standards are unreasonably high."
  },
  {
    name: "Think Big",
    description: "Thinking small is a self-fulfilling prophecy. Leaders create and communicate a bold direction."
  },
  {
    name: "Bias for Action",
    description: "Speed matters in business. Many decisions and actions are reversible and do not need extensive study."
  },
  {
    name: "Frugality",
    description: "Accomplish more with less. Constraints breed resourcefulness, self-sufficiency, and invention."
  },
  {
    name: "Earn Trust",
    description: "Leaders listen attentively, speak candidly, and treat others respectfully."
  },
  {
    name: "Dive Deep",
    description: "Leaders operate at all levels, stay connected to the details, and audit frequently."
  },
  {
    name: "Have Backbone; Disagree and Commit",
    description: "Leaders are obligated to respectfully challenge decisions when they disagree, even when doing so is uncomfortable."
  },
  {
    name: "Deliver Results",
    description: "Leaders focus on the key inputs for their business and deliver them with the right quality and in a timely fashion."
  }
];

export const PRACTICE_QUESTIONS = [
  "Tell me about a time when you had to deliver results under pressure.",
  "Describe a situation where you had to influence others without authority.",
  "Give an example of how you've demonstrated ownership in your previous role.",
  "Tell me about a time when you had to make a difficult decision with limited information.",
  "Describe a situation where you innovated to solve a complex problem.",
  "Tell me about a time when you received critical feedback and how you responded.",
  "Describe a situation where you had to prioritize competing demands.",
  "Give an example of how you've demonstrated customer obsession.",
  "Tell me about a time when you had to adapt to a significant change.",
  "Describe a situation where you disagreed with a team member and how you resolved it."
];
