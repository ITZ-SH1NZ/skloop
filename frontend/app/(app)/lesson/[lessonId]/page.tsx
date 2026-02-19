"use client";

import { use, useState, useEffect } from "react";
import LessonLayout from "@/components/lesson/LessonLayout";
import VideoView from "@/components/lesson/VideoView";
import ArticleView from "@/components/lesson/ArticleView";
import QuizView from "@/components/lesson/QuizView";
import ChallengeView from "@/components/lesson/ChallengeView";
import FlowchartBuilder from "@/components/lesson/FlowchartBuilder";
import { useRouter } from "next/navigation";

// --- MOCK DATA FOR PROTOTYPE ---
const LESSON_CONTENT_MAP: Record<string, any> = {
    // HTML Module
    "1-1": {
        id: "1-1",
        title: "Tags & Attributes",
        moduleTitle: "HTML: The Skeleton",
        type: "video",
        duration: "8m",
        videoUrl: "https://www.youtube.com/embed/DefD936ptz0", // HTML Crash Course
        summary: `
            <p>HTML (HyperText Markup Language) is the standard markup language for documents designed to be displayed in a web browser. It can be assisted by technologies such as Cascading Style Sheets (CSS) and scripting languages such as JavaScript.</p>
            <h3>Core Concepts:</h3>
            <ul>
                <li><strong>Tags:</strong> The hidden keywords within a web page that define how your web browser must format and display the content.</li>
                <li><strong>Attributes:</strong> Provide additional information about HTML elements. All HTML elements can have attributes.</li>
            </ul>
        `
    },
    "1-2": {
        id: "1-2",
        title: "Semantic HTML5",
        moduleTitle: "HTML: The Skeleton",
        type: "article",
        readTime: "10m",
        content: `
            <h2>Understanding Semantic HTML</h2>
            <p>Semantic HTML5 elements clearly describe their meaning in a human- and machine-readable way.</p>
            <pre><code>&lt;header&gt;...&lt;/header&gt;
&lt;nav&gt;...&lt;/nav&gt;
&lt;main&gt;...&lt;/main&gt;
&lt;footer&gt;...&lt;/footer&gt;</code></pre>
            <p>Using semantic tags is crucial for search engine optimization (SEO) and accessibility (screen readers).</p>
        `
    },
    "1-3": {
        id: "1-3",
        title: "Building a Portfolio Skeleton",
        moduleTitle: "HTML: The Skeleton",
        type: "challenge",
        description: "It's time to build the structure for your personal portfolio website. Use Semantic HTML tags to create a clean, accessible layout.",
        requirements: [
            "Create a <header> containing an <h1> with your name.",
            "Add a <main> section for your content.",
            "Inside main, add two <section> elements: one for 'About' and one for 'Projects'.",
            "Add a <footer> with a copyright notice."
        ],
        hints: [
            "Use id attributes to uniquely identify sections (e.g., id='about').",
            "Don't worry about CSS yet, focus on the structure.",
            "Remember to close all your tags!"
        ],
        initialCode: {
            html: `
<header>
  <h1>My Portfolio</h1>
</header>
<main>
  <section id="about">
    <h2>About Me</h2>
    <p>I am a web developer.</p>
  </section>
  <!-- Add Projects section here -->
</main>
<footer>
  <p>&copy; 2024</p>
</footer>`,
            css: `
body { font-family: sans-serif; margin: 0; padding: 20px; }
header, main, footer { border: 1px dashed #ccc; padding: 10px; margin-bottom: 10px; }
h1 { color: #333; }`,
            js: `console.log("Portfolio skeleton loaded!");`
        }
    },
    "1-4": {
        id: "1-4",
        title: "HTML Mastery Quiz",
        moduleTitle: "HTML: The Skeleton",
        type: "quiz",
        questions: [
            {
                id: "q1",
                question: "Which HTML tag is used for the largest heading?",
                options: ["<heading>", "<h1>", "<h6>", "<head>"],
                correctIndex: 1
            },
            {
                id: "q2",
                question: "Which styling attribute is used to change text color?",
                options: ["font-color", "text-color", "color", "background-color"],
                correctIndex: 2
            },
            {
                id: "q3",
                question: "What does HTML stand for?",
                options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Multi Language"],
                correctIndex: 0
            }
        ]
    },

    // CSS Module
    "2-1": {
        id: "2-1",
        title: "Selectors & Specificity",
        moduleTitle: "CSS: Styling & Layout",
        type: "video",
        duration: "12m",
        videoUrl: "https://www.youtube.com/embed/s2H488Obe-Y", // Placeholder
        summary: `
            <p>CSS Selectors are the first step to styling your HTML. In this lesson, we cover:</p>
            <ul>
                <li><strong>Type Selectors:</strong> Selecting by tag name (e.g., <code>div</code>, <code>p</code>).</li>
                <li><strong>Class Selectors:</strong> Reusable styles (e.g., <code>.btn</code>, <code>.card</code>).</li>
                <li><strong>ID Selectors:</strong> Unique elements (e.g., <code>#header</code>).</li>
            </ul>
            <p>We also dive into <strong>Specificity</strong>, the set of rules browsers use to decide which style applies when multiple rules conflict.</p>
        `
    },
    "2-2": {
        id: "2-2",
        title: "The Box Model",
        moduleTitle: "CSS: Styling & Layout",
        type: "video",
        duration: "15m",
        videoUrl: "https://www.youtube.com/embed/rIO5326GpQc", // Placeholder
        summary: `
            <p>Every element in web design is a rectangular box. The <strong>Box Model</strong> consists of:</p>
            <ol>
                <li><strong>Content:</strong> The actual text or image.</li>
                <li><strong>Padding:</strong> Space between content and border.</li>
                <li><strong>Border:</strong> The edge of the box.</li>
                <li><strong>Margin:</strong> Space outside the border, separating it from other elements.</li>
            </ol>
        `
    },
    "2-3": {
        id: "2-3",
        title: "Flexbox Froggy",
        moduleTitle: "CSS: Styling & Layout",
        type: "challenge",
        description: "Help the frog get to the lilypad using CSS Flexbox properties!",
        requirements: [
            "Use 'justify-content' to align the frog horizontally.",
            "Move the frog to the right side of the pond."
        ],
        hints: [
            "justify-content: flex-end; will align items to the right.",
            "justify-content: center; will align items to the center."
        ],
        initialCode: {
            html: `
<div class="pond">
  <div class="frog">🐸</div>
  <div class="lilypad">🌱</div>
</div>`,
            css: `
.pond {
  display: flex;
  /* Add your code below to move the frog to the lilypad */
  
  height: 100vh;
  align-items: center;
  background: #2c3e50;
}

.frog { font-size: 50px; }
.lilypad { font-size: 50px; }`,
            js: `// No JS needed for this layout challenge`
        }
    },
    "2-4": {
        id: "2-4",
        title: "Building a Navbar",
        moduleTitle: "CSS: Styling & Layout",
        type: "challenge",
        description: "Create a responsive navigation bar using Flexbox. The logo should be on the left and links on the right.",
        requirements: [
            "Use Flexbox on the <nav> element.",
            "Space out the logo and links using 'justify-content: space-between'.",
            "Remove bullet points from the list.",
            "Display list items in a row."
        ],
        hints: [
            "Apply display: flex to the parent containers.",
            "list-style: none removes bullet points.",
            "gap property adds space between flex items."
        ],
        initialCode: {
            html: `
<nav>
  <div class="logo">Brand</div>
  <ul class="links">
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>`,
            css: `
nav {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #eee;
  /* TODO: Use Flexbox to separate Logo and Links */
  
}

.links {
  /* TODO: Fix list styling */
  
}

.links a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
}

body { font-family: system-ui; background: #f9f9f9; margin: 0; }`,
            js: ``
        }
    },
    "2-5": {
        id: "2-5",
        title: "CSS Grid Crash Course",
        moduleTitle: "CSS: Styling & Layout",
        type: "article",
        readTime: "20m",
        content: `
            <h2>Introduction to CSS Grid</h2>
            <p>CSS Grid Layout is a two-dimensional layout system for the web. It lets you layout items in rows and columns.</p>
            <pre><code>.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}</code></pre>
            <p>Unlike Flexbox, which is largely one-dimensional (either a row or a column), Grid handles both dimensions simultaneously, making it perfect for overall page layouts.</p>
            <h3>Key Concepts</h3>
            <ul>
                <li><strong>Grid Container:</strong> The parent element.</li>
                <li><strong>Grid Item:</strong> The direct children.</li>
                <li><strong>Grid Line:</strong> The dividing lines that make up the grid structure.</li>
            </ul>
        `
    },

    // DSA Module
    "3-1": {
        id: "3-1",
        title: "Logic Building with Flowcharts",
        moduleTitle: "DSA Foundations",
        type: "flowchart",
        description: "Learn to think like a programmer! Drag nodes to build a flowchart that calculates the sum of two numbers.",
        initialNodes: [], // Optional, FlowchartBuilder handles defaults
    },
    "3-2": {
        id: "3-2",
        title: "Two Pointer Technique",
        moduleTitle: "DSA Foundations",
        type: "challenge",
        mode: "algorithm",
        description: "Write a function `isPalindrome(str)` that returns `true` if the string is a palindrome, and `false` otherwise. Use the Two Pointer technique.",
        requirements: [
            "The function must be named `isPalindrome`.",
            "It should return a boolean value.",
            "Ignore non-alphanumeric characters and case."
        ],
        hints: [
            "Use two pointers: one at the start, one at the end.",
            "Move them towards the center while comparing characters.",
            "Use `str.replace(/[^a-z0-9]/gi, '').toLowerCase()` to clean the string."
        ],
        initialCode: `TWO POINTER TECHNIQUE ALGORITHM

1. Initialize two variables, left and right...
2. Loop while...
   - Check if...
   - Move pointers...
3. Return result...`
    },
    "3-3": {
        id: "3-3",
        title: "Pseudocode Basics",
        moduleTitle: "DSA Foundations",
        type: "challenge",
        mode: "pseudocode",
        description: "Write pseudocode for an algorithm that finds the maximum number in an array of integers.",
        requirements: [
            "Initialize a variable to store the max value.",
            "Loop through the array.",
            "Compare each element with the current max.",
            "Update max if the element is larger."
        ],
        hints: [
            "Start by assuming the first element is the max.",
            "Iterate from the second element to the end."
        ],
        initialCode: `ALGORITHM FindMax(arr)
  // Initialize max variable
  SET max TO ...

  // Loop through array
  FOR each number in arr DO
    // Compare and update
    IF ... THEN
      ...
    END IF
  END FOR

  RETURN max
END ALGORITHM`
    }
};

export default function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
    // Unwrap params using React.use()
    const { lessonId } = use(params);
    const router = useRouter();
    const [lesson, setLesson] = useState<any>(null);

    useEffect(() => {
        // Find lesson data
        const data = LESSON_CONTENT_MAP[lessonId];
        if (data) {
            setLesson(data);
        } else {
            // Fallback for demo purposes if ID not found
            setLesson({
                id: lessonId,
                title: "Lesson Not Found (Demo)",
                moduleTitle: "Demo Module",
                type: "article",
                readTime: "1m",
                content: `<p>Content for lesson ID <strong>${lessonId}</strong> not found in mock data.</p>`
            });
        }
    }, [lessonId]);

    if (!lesson) return null; // Or a loading spinner

    const handleComplete = () => {
        console.log("Lesson Completed:", lesson.id);
        router.push("/course/web-dev"); // Go back to course map for now
    };

    return (
        <LessonLayout
            title={lesson.title}
            type={lesson.type}
            moduleTitle={lesson.moduleTitle}
            onComplete={handleComplete}
        >
            {lesson.type === "video" && (
                <VideoView
                    videoUrl={lesson.videoUrl}
                    summary={lesson.summary}
                    duration={lesson.duration}
                    onComplete={handleComplete}
                />
            )}

            {lesson.type === "article" && (
                <ArticleView
                    content={lesson.content}
                    readTime={lesson.readTime}
                    onComplete={handleComplete}
                />
            )}

            {lesson.type === "quiz" && (
                <QuizView
                    questions={lesson.questions}
                    onComplete={handleComplete}
                />
            )}

            {lesson.type === "challenge" && (
                <ChallengeView
                    title={lesson.title}
                    description={lesson.description}
                    requirements={lesson.requirements}
                    hints={lesson.hints}
                    initialCode={lesson.initialCode}
                    mode={lesson.mode || 'web'}
                />
            )}

            {lesson.type === "flowchart" && (
                <div className="h-[calc(100vh-3.5rem)]">
                    <FlowchartBuilder />
                </div>
            )}
        </LessonLayout>
    );
}
