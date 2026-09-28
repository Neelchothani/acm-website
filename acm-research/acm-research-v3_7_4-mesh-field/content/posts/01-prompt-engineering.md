---
title: "Prompt Engineering Techniques: Streamlining AI Workflows for Academic Deadlines"
date: "2025-10-25"
tag: "Prompt Engineering"
area: "Artificial Intelligence & Machine Learning"
motif: "prompt"
excerpt: "Prompt-engineering patterns for faster, cleaner AI workflows under academic deadlines."
url: "https://djsacm-research.github.io/blogs/Prompt-Engineering-Techniques-Streamlining-AI-Workflows-for-Academic-Deadlines"
---
It’s 2:30 AM, and you are not surprised, it usually is. You’re trying to work on a rather difficult college assignment that has you stumped — stuck in your tracks. Your notes blur together, and your chrome tabs have multiplied beyond recognition.

In a moment of frustration, you decide to give your AI assistant another chance. You type in the question, hoping for a breakthrough but the response feels muted, like a textbook excerpt, like it’s missing the heart of the question.

You sigh.

It feels inconsistent. Sometimes the responses make you feel like your AI agent has mind-reading capabilities and other times, not so much. The minutes on the watch move up by a digit and the puzzle pieces feel like they have slotted right in place.

It’s the ***way you asked the question*** that varied from time to time. Some days it resembled a detailed walkthrough of the question while on the others, the quick question yielded disappointing results. You start refining your prompt, now with conscious intent, and you were right\! This time the AI agent responds with empathy, context, and actionable insights.

Prompt engineering isn’t some far-fetched technical wizardry, it’s something that you have been doing without realizing\! Every time you rephrase a question for a friend or clarify your thoughts during a group discussion, you are shaping the way others interpret and respond to you.

It is exactly the same with AI. If you break down your prompt into clear elements, you are giving the AI agent all the tools that are necessary to think forward in the right direction.

*But what makes a prompt really that effective?*

-----

## Getting to know the Process of Brewing Effective Prompts

Now that you’ve seen just how much your results can change based on how you ask, let’s break down what goes into crafting a truly effective prompt.

![Coffee](/blog-images/01-prompt-engineering/coffee.png)  
Coffee's the Solution to literally anything

Think of it as brewing the perfect cup of coffee where each ingredient matters. With AI, every part of your prompt helps guide your agent, so it understands not just ***what you want***, but ***how to deliver a response*** that’s genuinely helpful and relevant to your assignment.

The process is outlined below:

**Role:** Mentioning the role of the AI agent for that specific prompt helps it to immerse itself into thinking from the perspective of a person who would value the current task the most, drawing out relevant responses.

**Task:** Provides a clean and sturdy framework that the AI agent can utilize to complete the given task, reducing the chances of getting side-tracked in the wrong direction.

**Instructions:** These describe in detail the requirements and constraints under which the task has to be performed.

**Context:** This emphasizes the role by providing accurate background information or situational details to ensure that the AI agent understands what I would like to call the ***‘life the task has led until now’.***

**Input:** The input refers to the raw data related to the task such as data that the AI agent has to work with to complete the task or examples that would familiarize the task to the agent.

-----

## Types of Prompting techniques

Once you’re comfortable with the building blocks of a good prompt, the next step is learning ***how to combine them in different ways*** in whatever way tonight’s university assignment demands\! These combinations are known as ***prompting techniques***, and choosing the right one can be the difference between an AI advice that makes you yawn or answers that actually help you break through that numbing 2:30 AM brain fog.

We’ll start with techniques you can use right away to guide language models. If tonight you just want an answer that makes sense, these will do the trick.

But for those nights when you catch yourself tinkering or dreaming up your own task-specific chatbots *(thank you, extra coffee)*, you might want to play with LangChain — a framework for building your own AI agents with reusable templates and just a few lines of code, perfect for those *‘running-on-zero-sleep’* moments.

## Zero-Shot Prompting: The Quick Ask

This one’s for when your brain can barely muster a full sentence. You toss the AI agent a plain request, nothing fancy, no examples.

![Zero-Shot Prompting: Flowchart](/blog-images/01-prompt-engineering/zero-shot-flowchart.png)  
Zero-Shot Prompting: Flowchart

**Prompt Example:**  
*“Create a survival guide for pulling an all-nighter before a big assignment deadline.”*

You’re just giving the model instructions without background or samples — straight to the point.

**LangChain Example:**

    from langchain_core.prompts import PromptTemplate
     
    prompt = PromptTemplate(
        input_variables=["situation"],
        template="Create a survival guide for {situation}."
    )
    prompt_text = prompt.format(situation="pulling an all-nighter before a big assignment deadline")
     
    # Result: ["Stock up on snacks", "Find your power playlist", "Set mini-rewards"]

## One-Shot Prompting: The Guided Example

Sometimes the AI needs a little hint, a single example to show what you’re after.

![One-Shot Prompting: Flowchart](/blog-images/01-prompt-engineering/one-shot-flowchart.png)  
One-Shot Prompting: Flowchart

**Prompt Example:**  
*“Describe how to complete a group assignment efficiently.*

*Organize an initial meeting, assign tasks, set deadlines, and communicate regularly.*

*Describe how to complete an individual assignment efficiently.”*

Here, by sharing one example, you’re priming the AI agent to mirror the style or depth of answer you want.

**LangChain Example:**

    from langchain_core.prompts import PromptTemplate
     
    template = """
    Describe how to complete a group assignment efficiently.
    - Organize an initial meeting, assign tasks, set deadlines, and communicate regularly.
     
    Describe how to complete an individual assignment efficiently.
    """
    prompt = PromptTemplate(
        input_variables=["assignment_type"],
        template=template
    )
    prompt_text = prompt.format(assignment_type="individual assignment")
     
    # Result: "- Break the assignment into steps, set personal deadlines, focus on one task at a time, and review before submitting."

## Few-Shot Prompting: The Pattern Learner

When you want the AI agent to get the hang of your logic, show it a handful of examples so it picks up the pattern.

![Few-Shot Prompting: Flowchart](/blog-images/01-prompt-engineering/few-shot-flowchart.png)  
Few-Shot Prompting: Flowchart

**Prompt Example:**  
*“List steps for successfully completing a research paper.*

*Choose a topic, gather sources, create an outline, write drafts, review and edit, submit.*

*List steps for successfully finishing a group project.*

*Meet with group members, divide tasks, set deadlines, collaborate, review together, finalize and submit.*

*List steps for successfully preparing for a final exam.*

*Review notes, make a study schedule, practice problems, join study sessions, get adequate rest.*

*List steps for successfully completing a presentation assignment.”*

After showing this mix of cases, the AI agent is much more likely to spot the connections and give a relevant and precise answer.

**LangChain Example:**

    from langchain_core.prompts import PromptTemplate
     
    template = """
    List steps for successfully completing a research paper.
    - Choose a topic, gather sources, create an outline, write drafts, review and edit, submit.
     
    List steps for successfully finishing a group project.
    - Meet with group members, divide tasks, set deadlines, collaborate, review together, finalize and submit.
     
    List steps for successfully preparing for a final exam.
    - Review notes, make a study schedule, practice problems, join study sessions, get adequate rest.
     
    List steps for successfully completing a presentation assignment.
    """
    prompt = PromptTemplate(
        input_variables=["assignment_type"],
        template=template
    )
    prompt_text = prompt.format(assignment_type="presentation assignment")
     
    # Result: "- Plan your content, design slides, rehearse, seek feedback, finalize visuals, and present."

## When do we use each Prompting Technique?

Now that you know the main prompting techniques, the real question is: ***when do you use which?*** Before you toss another question at your AI agent, here’s a handy cheat sheet to help you match each style to those late-night existential dilemmas.

| Prompting Technique | When to Use                                                                | Strengths                                                     | Working Example                                                                                       |
| :------------------ | :------------------------------------------------------------------------- | :------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------- |
| Zero-Shot           | When the task is so simple that the model likely “knows” it already        | Quick and works accurately for generic questions              | Simple term definition or list (“List effective time management techniques for university students.”) |
| One-Shot            | When a task is somewhat familiar but needs clarity through an example      | Helps model learn expected format or response style           | New format for summaries (give one example first)                                                     |
| Few-Shot            | When the task is complex or requires the agent to follow a specific format | Boosts accuracy and consistency and supports custom workflows | Simulated structured notes and interview scripts (give a few examples first)                          |

Cheat Sheet Yayy\!

You can also try out all zero-shot, one-shot and few shot prompts sequentially and evaluate your results:

![Prompting Technique Selection Process ](/blog-images/01-prompt-engineering/prompting-technique-selection-process.png)  
Prompting Technique Selection Process

-----

## Advanced Prompting Techniques

You’ve survived the basics, and maybe even used them to claw your way through a few blurry-eyed, caffeine-fuelled hours.

But what if you want your AI agent to do more than just answer questions? What about the time when your course assignments get trickier and your bedtime gets more theoretical than real? What about when you’re craving responses that feel almost human?

The simple stuff doesn’t always cut it. Ready to try something more interesting?

## Chain of Thought Prompting

Sometimes, what you need isn’t just a quick and easy solution, rather a ***step by step visualization*** of the problem. Chain of Thought Prompting lives with the belief that ***‘talking through the process stitches together possible communication tears’.***

![Chain of Thought Prompting: Flowchart and Prompting Process](/blog-images/01-prompt-engineering/cot-flowchart-and-process.png)  
Chain of Thought Prompting: Flowchart and Prompting Process

**Prompt Example:**  
*“Walk me through, step by step, how you would approach and complete a challenging university assignment from start to finish.”*

The AI agent won’t just blurt out a diagnosis; it will lay out its thought process as if you were working through the problem together.

**LangChain Example:**

    from langchain_core.prompts import PromptTemplate
     
    prompt = PromptTemplate(
        input_variables=["task"],
        template="""Let's think through this process step-by-step.
    Task: {task}
     
    Step 1: Carefully read the assignment instructions.
    Step 2: Break down requirements and clarify any doubts.
    Step 3: Plan your timeline and identify milestones.
    Step 4: Gather necessary resources and information.
    Step 5: Draft your work, leaving time for review.
    Step 6: Revise, edit, and finalize before submitting.
    """
    )
    prompt_text = prompt.format(task="completing a challenging university assignment")
     
    # Result: Each step is laid out clearly, guiding the student from start to finish.

## Role-based Prompting

There are nights when it’s not just about ***what you ask,*** but ***who you want your AI to be.*** Maybe you need an insight from a course-specific professor, or even another stressed out student like yourself. That’s where role-based prompting comes in. By giving your AI a persona, you coax out responses sculpted for real-world expertise or empathy, which makes it perfect for scenarios such as interviews that crave depth.

![Role-based Prompting: Flowchart](/blog-images/01-prompt-engineering/role-based-flowchart.png)  
Role-based Prompting: Flowchart

![Role-based Prompting Process](/blog-images/01-prompt-engineering/role-based-process.png)  
Role-based Prompting Process

**Prompt Example:**  
*“You are a senior student who always finishes assignments early. Share your strategy for staying on top of deadlines and producing high-quality work.”*

Here, you’re asking the AI agent to answer in the voice, personality and knowledge of an expert, drawing out more realistic and authentic responses.

**LangChain Example:**

    from langchain_core.prompts import PromptTemplate
     
    prompt = PromptTemplate(
        input_variables=["role", "task"],
        template="""You are a {role}.
    Task: {task}
     
    Describe your personal approach step-by-step so others can follow your example.
    """
    )
    prompt_text = prompt.format(
        role="senior student who always finishes assignments early",
        task="staying on top of deadlines and producing high-quality assignments"
    )
     
    # Result: The strategy is explained from the perspective of a reliable, experienced student.

## Contextual Prompting

Now picture this:

Your third cup of coffee has gone cold, your usually detailed notes look like hieroglyphs, and you are wrestling with your coursework that’s got more twists than any of your nightmares.

You need your AI agent to do more than just answer; you want it to understand the ***backstory, the subtle clues and the emotional tone.***

Contextual prompting does just that\! *It gives your agent the complete biography that the task’s ancestors have lived through.*

![Contextual Prompting: Flowchart](/blog-images/01-prompt-engineering/contextual-flowchart.png)  
Contextual Prompting: Flowchart

![Contextual Prompting Process](/blog-images/01-prompt-engineering/contextual-process.png)  
Contextual Prompting Process

**Prompt Example:**  
*“It’s the last week of the semester, you have three assignments due, and you’re feeling overwhelmed. Suggest an action plan that helps manage the workload and reduces stress.”*

You’re guiding your AI agent into factoring in everything, not just the concepts of the assignment, but the life context so that the advice actually fits the real person in your scenario.

**LangChain Example:**

    from langchain_core.prompts import PromptTemplate
     
    prompt = PromptTemplate(
        input_variables=["context", "problem"],
        template="""Context: {context}
    Problem: {problem}
     
    Provide a practical, prioritized action plan considering the current challenges.
    """
    )
    prompt_text = prompt.format(
        context="Last week of semester, three assignments due, feeling overwhelmed",
        problem="managing workload and reducing stress"
    )
     
    # Result: Step-by-step guide tailored to the situation, including time management and stress reduction.

## Retrieval-Augmented Prompting

Retrieval-Augmented Prompting equips your AI agent to deliver answers grounded in real and up-to-date information from external sources like scientific research articles, textbooks, or databases.

Instead of relying only on what the model ‘remembers’, RAP lets the AI actively ***fetch relevant evidence*** to back up its recommendations, making responses much more trustworthy.

![Retrieval-Augmented Prompting: Flowchart](/blog-images/01-prompt-engineering/retrieval-augmented-flowchart.png)  
Retrieval-Augmented Prompting: Flowchart

![Retrieval-Augmented Prompting Process](/blog-images/01-prompt-engineering/retrieval-augmented-process.png)  
Retrieval-Augmented Prompting Process

**Prompt Example:**  
*“Based on proven university study tips, list three effective techniques for improving concentration while working on assignments. Include references or short summaries from reliable sources.”*

The AI agent will seek out factual sources and build its answer around them.

**LangChain Example:**

    from langchain_core.prompts import PromptTemplate
     
    prompt = PromptTemplate(
        input_variables=["task"],
        template="""Retrieve evidence-based techniques for:
    Task: {task}
     
    List three methods, each with a brief reference or summary from a trusted source.
    """
    )
    prompt_text = prompt.format(task="improving concentration while working on assignments")
     
    # Result: The output includes cited techniques like Pomodoro, spaced repetition, and active breaks with supporting summaries or source info.

## Tree of Thought Prompting

Let’s be honest — if you’ve made it through all the caffeine, academic project twists, and prompting techniques so far, you deserve extra credit for sheer persistence\! Now, for the grand finale: Tree-of-Thought (ToT) Prompting.

Instead of a single way forward, ToT lets your AI branch out, ***exploring multiple paths and perspectives before landing on a final answer.***

It’s like building your own brain map with the AI agent, ***testing several strategies in parallel, and choosing the most promising one.*** Think of it as brainstorming at warp speed, a useful trick when your own mind feels stuck on repeat at this hour.

![Tree of Thought Prompting: Flowchart](/blog-images/01-prompt-engineering/tot-flowchart.png)  
Tree of Thought Prompting: Flowchart

![Tree of Thoughts Prompting Process](/blog-images/01-prompt-engineering/tot-process.png)  
Tree of Thoughts Prompting Process

**Prompt Example:**  
*“Consider different strategies for organizing tasks in a busy week with multiple assignments. For each method — using a planner, digital tools, or prioritizing deadlines — explain the steps, pros and cons, and recommend which strategy is most effective for staying on track.”*

With ToT, the AI lays out various solution trees, so you get a full view of possible answers; no more tunnel vision.

**LangChain Example:**

    from langchain_core.prompts import PromptTemplate
     
    prompt = PromptTemplate(
        input_variables=["challenge"],
        template="""Explore multiple approaches for:
    Challenge: {challenge}
     
    For each strategy, describe the steps, list the pros and cons, and select the best approach with your reasoning.
    """
    )
    prompt_text = prompt.format(challenge="organizing tasks in a busy week with multiple assignments")
     
    # Result: Compares planner use, digital tools, and deadline prioritization, then recommends the optimal strategy.

-----

## Wrapping Up: Your AI Toolkit Is Ready

Congratulations\! You’ve just built yourself a complete arsenal of prompting techniques that can turn those overwhelming late-night study sessions into productive breakthroughs. From the simple elegance of zero shot prompting to the multi-branched exploration of tree of thought, you now have the tools to get exactly what you need from your AI agent.

But here’s the real magic: you don’t have to stick to just one technique. The most powerful prompts often combine multiple approaches.

Imagine role-based prompting mixed with chain-of-thought reasoning, or contextual prompting enhanced with retrieval-augmented evidence. The combinations are endless, and each study session might call for a different concoction\!

Additionally, remember, every time you refine your prompt, you’re training yourself to communicate more effectively, not just with AI, but with people too.

Now go ahead and prompt with confidence, your university assignments *(and your sleep schedule)* will thank you.

***Sweet dreams, and may your next 2:30 AM session be your most productive yet.***

-----

### Written By:

![Gauri Shirke](/blog-images/01-prompt-engineering/gauri.png)

Gauri Shirke

Author | AI Researcher | Engineer
