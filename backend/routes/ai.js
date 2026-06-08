const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Groq = require('groq-sdk');

let groq = null;
const getGroq = () => {
  if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "placeholder" });
  return groq;
};

// POST /api/ai/intro — generate personalized match intro email
router.post('/intro', authMiddleware, async (req, res) => {
  const { client, match, matcherName } = req.body;

  if (!client || !match) {
    return res.status(400).json({ error: 'client and match data required' });
  }

  const prompt = `You are a professional matchmaker at The Date Crew, a premium Indian matrimonial service.

Write a warm, elegant, and personalized introduction email from matchmaker ${matcherName || 'your matchmaker'} to ${client.firstName} ${client.lastName} introducing ${match.firstName} ${match.lastName} as a potential match.

Client Profile:
- Name: ${client.firstName} ${client.lastName}, Age: ${client.age}, City: ${client.city}
- Profession: ${client.designation} at ${client.company}
- Education: ${client.degree} from ${client.college}
- Religion: ${client.religion}, Caste: ${client.caste}
- Wants Kids: ${client.wantKids}, Open to Relocate: ${client.openToRelocate}

Match Profile:
- Name: ${match.firstName} ${match.lastName}, Age: ${match.age}, City: ${match.city}
- Profession: ${match.designation} at ${match.company}
- Education: ${match.degree} from ${match.college}
- Religion: ${match.religion}
- Match Score: ${match.score}/100 (${match.label})
- Why they match: ${match.reasons?.join(', ')}

Write a 3-paragraph email:
1. Warm opening from the matchmaker
2. Introduction of the match with 2-3 specific compatibility highlights (be specific, not generic)
3. Call to action — suggest a video call or meeting

Keep the tone: warm, professional, premium, hopeful. Max 250 words. No subject line needed.`;

  try {
const completion = await getGroq().chat.completions.create({
       model: 'llama-3.3-70b-versatile',
       messages: [{ role: 'user', content: prompt }],
       temperature: 0.7,
       max_tokens: 400,
     });

    const emailText = completion.choices[0]?.message?.content || '';
    res.json({ email: emailText });
  } catch (err) {
    console.error('Groq error:', err.message);
    // Fallback template if Groq fails
    const fallback = `Dear ${client.firstName},

I hope this message finds you well. I am excited to share a wonderful match I have found for you after careful consideration.

I would like to introduce you to ${match.firstName} ${match.lastName}, a ${match.age}-year-old ${match.designation} based in ${match.city}. ${match.firstName} holds a ${match.degree} and has built an impressive career at ${match.company}. What stood out to me most is that you both ${match.reasons?.[0]?.toLowerCase() || 'share wonderful compatibility'} — a strong foundation for a meaningful relationship.

I believe this could be a truly special connection worth exploring. I would love to arrange a comfortable introduction call at your convenience. Please let me know a time that works for you, and I will coordinate everything from my end.

Warmly,
${matcherName || 'Your Matchmaker'} | The Date Crew`;

    res.json({ email: fallback, fallback: true });
  }
});

// POST /api/ai/score-explanation — AI narrative for a match score
router.post('/score-explanation', authMiddleware, async (req, res) => {
  const { client, match } = req.body;

  const prompt = `You are an expert Indian matrimonial matchmaker. In 2-3 sentences, explain why ${client.firstName} and ${match.firstName} are a ${match.label} (score: ${match.score}/100).

Key compatibility points: ${match.reasons?.join(', ')}
Potential concerns: ${match.redFlags?.length > 0 ? match.redFlags.join(', ') : 'none'}

Be specific, warm, and professional. Focus on relationship compatibility, not just demographics.`;

  try {
const completion = await getGroq().chat.completions.create({
       model: 'llama-3.3-70b-versatile',
       messages: [{ role: 'user', content: prompt }],
       temperature: 0.6,
       max_tokens: 150,
     });

    const explanation = completion.choices[0]?.message?.content || '';
    res.json({ explanation });
  } catch (err) {
    console.error('Groq error:', err.message);
    const fallback = `${client.firstName} and ${match.firstName} show strong compatibility with a score of ${match.score}/100. Key strengths include: ${match.reasons?.slice(0, 2).join(' and ')}. ${match.redFlags?.length > 0 ? `One area to discuss: ${match.redFlags[0]}.` : 'No major compatibility concerns identified.'}`;
    res.json({ explanation: fallback, fallback: true });
  }
});

module.exports = router;
