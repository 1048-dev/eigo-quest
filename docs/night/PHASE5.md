# Phase 5 - AI conversation step
- New final lesson step "conversation": the child talks with a character (Haru by default) about lesson.conversation.aiTask, max 6 turns.
- API POST /api/conversation: uses @anthropic-ai/sdk when ANTHROPIC_API_KEY is set (model from env CONVERSATION_MODEL, default "claude-haiku-5-5").
  Follow the existing pattern in src/lib/grading/aiGrader.ts. System prompt: kind friend, very short simple English for ages 6-12,
  stays on the lesson topic, gently models the target expressions, never asks for personal information, no unsafe topics.
- Fallback when there is no key or any error: scripted replies from lesson.conversation.lines with simple keyword matching. Always success:true.
- Input: Web Speech API SpeechRecognition (en-US) when available; otherwise tap-to-choose suggested replies or typing. Output: speechSynthesis.
- Completing the conversation counts toward lesson completion (do not block if speech is unavailable).
- Tests for the fallback engine and the API contract.
