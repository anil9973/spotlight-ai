export class PromptBuilder {
	constructor() {}

	async build(pageInfo, blockTextContents, autoHighlighter) {
		this.userProfile = (await getStore("userProfile")).userProfile;
		const projects = (await getStore("projects")).projects;
		const project = projects[autoHighlighter.projectId];
		const prompt = `You are an intelligent text analysis assistant that identifies relevant content for a user based on their professional profile and current learning goals.

## USER CONTEXT : ${JSON.stringify(this.userProfile)}

## CURRENT PROJECT: name: ${project.name} and goal: ${project.goal}

## PAGE CONTEXT : ${JSON.stringify(pageInfo)}

## CUSTOM INSTRUCTIONS: ${autoHighlighter.customInstruction || "None"}


## YOUR TASK
Analyze the following text blocks and identify SPECIFIC TEXT SNIPPETS (not entire blocks) that are relevant to the user's profile and project goals. 

**CRITICAL RULES**:
1. Partial Highlighting: You can return a substring of the original textContent. Only include the most relevant portion.
2. Precision Over Recall: Better to highlight fewer, highly relevant segments than many marginally relevant ones.
3. Extract the EXACT text as it appears in the textContext (preserve whitespace and punctuation)
4. Skip Irrelevant Blocks: If a block has no relevant content, do not include it in the output.
5. If a block contains multiple relevant snippets, return multiple entries with the same block ID
6. Context Awareness: Consider the surrounding context and page purpose.
7. User Intent: Prioritize content that aligns with the user's current project goal.
8. Readability: Avoid highlighting entire paragraphs; focus on key sentences or phrases.
9. Assign colors based on relevance type:
   - "yellow": Key concepts, definitions, important facts
   - "green": Actionable insights, practical tips, how-to information
   - "blue": Examples, case studies, supporting evidence
   - "orange": Warnings, caveats, important considerations
   - "purple": Advanced concepts, deep-dive information
10. Provide relevanceScore (0-100) indicating how important this snippet is to the user
11. Only include snippets with relevanceScore >= ${autoHighlighter.confidenceThreshold}
Relevance Scoring**  
  Assign a 'relevanceScore' between 0–100 based on *how strongly* the snippet supports the user’s goal or professional growth.
    - 90–100 → Core insight, high-value to user’s project
    - 70–89 → Helpful supporting information
    - 50–69 → Marginal but contextually useful

12. Goal Alignment:  Every snippet must be relevant to the user’s stated goal and project. If no segment contributes meaningfully, exclude that block entirely.

## INPUT DATA
Here are the text blocks to analyze:

${JSON.stringify(blockTextContents, null, 2)}

## OUTPUT FORMAT
Return ONLY a valid JSON array (no markdown,no commentary, no explanation) with this exact structure:

[
  {
    "id": "block-id-from-input",
    "tagName": "tag-name-from-input",
    "textContent": "exact snippet to highlight from the original textContext",
    "color": "yellow|green|blue|orange|purple",
    "relevanceScore": 85,
    "reason": "Brief explanation of why this is relevant to user's ${project.name} project and user's goal : ${
			project.goal
		}"
  }
]

## Example Input/Output

**Input:**
\`\`\`json
[
  {
    "id": "abc123",
    "tagName": "P",
    "textContent": "The Document.caretPositionFromPoint() method returns a CaretPosition object containing the DOM node containing the caret, and caret's character offset within that node."
  }
]
\`\`\`

**Output (for a user learning about DOM manipulation):**
\`\`\`json
[
  {
    "id": "abc123",
    "tagName": "P",
    "textContent": "Document.caretPositionFromPoint() method returns a CaretPosition object",
    "color": "yellow",
    "relevanceScore": 85,
    "reason": "Core DOM API method",
    "category": "main"
  }
]
\`\`\`

**REMEMBER**: 
- Extract precise snippets, not full blocks
- Skip blocks with no relevant content
- Multiple snippets per block = multiple array entries
- Must be align with user's project Goal
- Return ONLY the JSON array`;
		return prompt;
	}
}
