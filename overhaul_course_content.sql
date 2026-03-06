-- ====================================================================
-- COURSE CONTENT OVERHAUL: Web Development & DSA
-- ====================================================================

DO $$
DECLARE
    web_dev_id uuid := 'f9a62d7c-8b5e-4b1a-9c1a-1a2b3c4d5e6f';
    dsa_id uuid := 'a3b8d1b6-0b3b-4b1a-9c1a-1a2b3c4d5e6f';
    m_id uuid;
BEGIN
    -- 1. CLEANUP (Delete existing topics then modules for these tracks)
    DELETE FROM public.topics WHERE module_id IN (SELECT id FROM public.modules WHERE track_id IN (web_dev_id, dsa_id));
    DELETE FROM public.modules WHERE track_id IN (web_dev_id, dsa_id);

    -- 2. UPDATE TRACK TITLES
    UPDATE public.tracks SET title = 'Web Development Fundamentals' WHERE id = web_dev_id;
    UPDATE public.tracks SET title = 'Programming Logic and DSA Foundations' WHERE id = dsa_id;

    -- =================================================================
    -- WEB DEVELOPMENT FUNDAMENTALS
    -- =================================================================

    -- Module 1: Understanding the Web
    INSERT INTO public.modules (track_id, title, description, order_index)
    VALUES (web_dev_id, 'Understanding the Web', 'Learn about clients, servers, and how the internet renders pages.', 0)
    RETURNING id INTO m_id;

    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data) VALUES
    (m_id, 'How the Internet Works', 'video', 0, 30, 20, '{"youtubeId": "qz0aGYMCzl0", "description": "Learn about clients, servers, DNS and how devices communicate."}'),
    (m_id, 'What Happens When You Type a URL', 'video', 1, 70, 20, '{"youtubeId": "dQw4w9WgXcQ", "description": "Step-by-step explanation of how a browser retrieves and renders a webpage."}'),
    (m_id, 'What is a Website', 'article', 2, 40, 15, '{"markdown": "# What is a Website\nUnderstand the difference between static and dynamic websites."}'),
    (m_id, 'How Browsers Render Pages', 'article', 3, 60, 15, '{"markdown": "# How Browsers Render Pages\nExplore how HTML, CSS and JavaScript are processed by browsers."}'),
    (m_id, 'Web Basics Quiz', 'quiz', 4, 50, 25, '{"questionCount": 20, "topics": ["internet vs web", "browser role", "server basics", "domain names"], "questions": [{"question": "Placeholder Question?", "options": ["Option 1", "Option 2"], "answer": 0}]}');

    -- Module 2: HTML Fundamentals
    INSERT INTO public.modules (track_id, title, description, order_index)
    VALUES (web_dev_id, 'HTML Fundamentals', 'Introduction to HTML tags, elements and structure.', 1)
    RETURNING id INTO m_id;

    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data) VALUES
    (m_id, 'HTML Crash Course', 'video', 0, 30, 20, '{"youtubeId": "qz0aGYMCzl0"}'),
    (m_id, 'Understanding Semantic HTML', 'video', 1, 70, 20, '{"youtubeId": "qz0aGYMCzl0"}'),
    (m_id, 'Core HTML Tags', 'article', 2, 40, 15, '{"markdown": "# Core HTML Tags\nHeadings, paragraphs, images, lists and links."}'),
    (m_id, 'HTML Page Structure', 'article', 3, 60, 15, '{"markdown": "<h1>HTML Structure & Semantics</h1><p>HTML structure refers to how a webpage is organized using HTML elements...</p>"}'),
    (m_id, 'Build Your First Webpage', 'challenge', 4, 30, 50, '{"challengeType": "web-ide", "title": "Build Your First Webpage", "objective": "Create a webpage with a heading, paragraph, image, list and a link.", "instructions": "Build a basic HTML page.", "initialHtml": "<h1>Hello</h1>", "initialCss": "", "initialJs": "", "validationRules": []}'),
    (m_id, 'HTML Quiz', 'quiz', 5, 50, 25, '{"questionCount": 20, "topics": ["html tags", "html elements", "lists", "links"], "questions": []}');

    -- Module 3: CSS Fundamentals
    INSERT INTO public.modules (track_id, title, description, order_index)
    VALUES (web_dev_id, 'CSS Fundamentals', 'Make your websites beautiful with selectors and the box model.', 2)
    RETURNING id INTO m_id;

    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data) VALUES
    (m_id, 'CSS Basics', 'video', 0, 30, 20, '{"youtubeId": "qz0aGYMCzl0"}'),
    (m_id, 'Understanding the CSS Box Model', 'video', 1, 70, 20, '{"youtubeId": "qz0aGYMCzl0"}'),
    (m_id, 'Fonts and Colors', 'article', 2, 40, 15, '{"markdown": "# Fonts and Colors\nApplying typography and color styling."}'),
    (m_id, 'Basic Layout Concepts', 'article', 3, 60, 15, '{"markdown": "# Basic Layout Concepts\nSpacing, alignment and display properties."}'),
    (m_id, 'Style Your Profile Page', 'challenge', 4, 30, 50, '{"challengeType": "web-ide", "title": "Style Your Profile Page", "objective": "Add colors, spacing and layout improvements.", "instructions": "Style the page using CSS.", "initialHtml": "", "initialCss": "body { }", "initialJs": "", "validationRules": []}'),
    (m_id, 'CSS Quiz', 'quiz', 5, 50, 25, '{"questionCount": 20, "topics": ["css selectors", "box model", "margin vs padding"], "questions": []}');

    -- Module 4: JavaScript Basics
    INSERT INTO public.modules (track_id, title, description, order_index)
    VALUES (web_dev_id, 'JavaScript Basics', 'Variables, functions and DOM manipulation.', 3)
    RETURNING id INTO m_id;

    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data) VALUES
    (m_id, 'JavaScript Fundamentals', 'video', 0, 30, 20, '{"youtubeId": "qz0aGYMCzl0"}'),
    (m_id, 'DOM Manipulation', 'video', 1, 70, 20, '{"youtubeId": "qz0aGYMCzl0"}'),
    (m_id, 'JavaScript Events', 'article', 2, 40, 15, '{"markdown": "# JavaScript Events\nHandling click, input and user interactions."}'),
    (m_id, 'Connecting JavaScript with HTML', 'article', 3, 60, 15, '{"markdown": "# Connecting JS\nUsing script tags and external JS files."}'),
    (m_id, 'Button Counter App', 'challenge', 4, 30, 50, '{"challengeType": "web-ide", "title": "Button Counter App", "objective": "Create a button that increases a counter when clicked.", "instructions": "Write JS to handle the click.", "initialHtml": "<button id=''btn''>0</button>", "initialCss": "", "initialJs": "", "validationRules": []}'),
    (m_id, 'JS Quiz', 'quiz', 5, 50, 25, '{"questionCount": 20, "topics": ["variables", "functions", "dom"], "questions": []}');

    -- Module 5: How Websites Work Together
    INSERT INTO public.modules (track_id, title, description, order_index)
    VALUES (web_dev_id, 'How Websites Work Together', 'Frontend, Backend, and APIs.', 4)
    RETURNING id INTO m_id;

    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data) VALUES
    (m_id, 'Frontend vs Backend', 'video', 0, 30, 20, '{"youtubeId": "qz0aGYMCzl0"}'),
    (m_id, 'Introduction to APIs', 'video', 1, 70, 20, '{"youtubeId": "qz0aGYMCzl0"}'),
    (m_id, 'Client Server Architecture', 'article', 2, 40, 15, '{"markdown": "# Client Server\nHow browsers communicate with servers."}'),
    (m_id, 'Basic Web Scaling Concepts', 'article', 3, 60, 15, '{"markdown": "# Scaling\nSimple overview of how large websites handle traffic."}'),
    (m_id, 'Build a Mini Website', 'challenge', 4, 30, 50, '{"challengeType": "web-ide", "title": "Build a Mini Website", "objective": "Create a multi-page website.", "instructions": "Build a mini site.", "initialHtml": "", "initialCss": "", "initialJs": "", "validationRules": []}'),
    (m_id, 'Architecture Quiz', 'quiz', 5, 50, 25, '{"questionCount": 20, "topics": ["client server", "apis", "frontend vs backend"], "questions": []}');


    -- =================================================================
    -- PROGRAMMING LOGIC AND DSA FOUNDATIONS
    -- =================================================================

    -- Module 1: Programming Logic
    INSERT INTO public.modules (track_id, title, description, order_index)
    VALUES (dsa_id, 'Programming Logic', 'Understanding how computers solve problems step-by-step.', 0)
    RETURNING id INTO m_id;

    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data) VALUES
    (m_id, 'What is Programming Logic', 'video', 0, 30, 20, '{"youtubeId": "v4cd1O4zkGw"}'),
    (m_id, 'Computational Thinking', 'video', 1, 70, 20, '{"youtubeId": "v4cd1O4zkGw"}'),
    (m_id, 'Algorithms Explained', 'article', 2, 40, 15, '{"markdown": "# Algorithms\nWhat an algorithm is and how it works."}'),
    (m_id, 'Steps in Problem Solving', 'article', 3, 60, 15, '{"markdown": "# Solving Steps\nHow programmers design logical solutions."}'),
    (m_id, 'Find the Larger Number', 'challenge', 4, 30, 50, '{"challengeType": "flowchart", "title": "Find the Larger Number", "objective": "Compare two numbers and output the larger value.", "requiredNodes": ["Start", "Input", "Decision", "End"], "task": "Find the larger of two inputs."}'),
    (m_id, 'Logic Quiz', 'quiz', 5, 50, 25, '{"questionCount": 20, "topics": ["algorithm basics", "logic steps"], "questions": []}');

    -- Module 2: Variables and Data
    INSERT INTO public.modules (track_id, title, description, order_index)
    VALUES (dsa_id, 'Variables and Data', 'How programs store and manipulate data.', 1)
    RETURNING id INTO m_id;

    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data) VALUES
    (m_id, 'Understanding Variables', 'video', 0, 30, 20, '{"youtubeId": "v4cd1O4zkGw"}'),
    (m_id, 'Inputs and Outputs', 'video', 1, 70, 20, '{"youtubeId": "v4cd1O4zkGw"}'),
    (m_id, 'Basic Data Types', 'article', 2, 40, 15, '{"markdown": "# Data Types\nNumbers, text and boolean values."}'),
    (m_id, 'Updating Values', 'article', 3, 60, 15, '{"markdown": "# Updating Values\nHow variables change during execution."}'),
    (m_id, 'Add Two Numbers', 'challenge', 4, 30, 50, '{"challengeType": "flowchart", "title": "Add Two Numbers", "objective": "Take two inputs and output their sum.", "requiredNodes": ["Start", "Input", "Process", "End"], "task": "Calculate sum of A and B."}'),
    (m_id, 'Data Quiz', 'quiz', 5, 50, 25, '{"questionCount": 20, "topics": ["variables", "assignment", "input"], "questions": []}');

    -- Module 3: Conditionals
    INSERT INTO public.modules (track_id, title, description, order_index)
    VALUES (dsa_id, 'Conditionals', 'Using conditions to control program flow.', 2)
    RETURNING id INTO m_id;

    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data) VALUES
    (m_id, 'If Statements', 'video', 0, 30, 20, '{"youtubeId": "v4cd1O4zkGw"}'),
    (m_id, 'Decision Making in Programs', 'video', 1, 70, 20, '{"youtubeId": "v4cd1O4zkGw"}'),
    (m_id, 'If vs If Else', 'article', 2, 40, 15, '{"markdown": "# If vs If Else\nBasic conditional structures."}'),
    (m_id, 'Nested Conditions', 'article', 3, 60, 15, '{"markdown": "# Nested Conditions\nUsing multiple conditions together."}'),
    (m_id, 'Even or Odd', 'challenge', 4, 30, 50, '{"challengeType": "flowchart", "title": "Even or Odd", "objective": "Determine whether a number is even or odd.", "requiredNodes": ["Start", "Decision", "End"], "task": "Check if N % 2 == 0."}'),
    (m_id, 'Conditionals Quiz', 'quiz', 5, 50, 25, '{"questionCount": 20, "topics": ["if statements", "branching logic"], "questions": []}');

    -- Module 4: Loops and Iteration
    INSERT INTO public.modules (track_id, title, description, order_index)
    VALUES (dsa_id, 'Loops and Iteration', 'Running repeated instructions.', 3)
    RETURNING id INTO m_id;

    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data) VALUES
    (m_id, 'For Loops', 'video', 0, 30, 20, '{"youtubeId": "v4cd1O4zkGw"}'),
    (m_id, 'While Loops', 'video', 1, 70, 20, '{"youtubeId": "v4cd1O4zkGw"}'),
    (m_id, 'Iteration Concepts', 'article', 2, 40, 15, '{"markdown": "# Iteration\nUnderstanding repetition in algorithms."}'),
    (m_id, 'Avoiding Infinite Loops', 'article', 3, 60, 15, '{"markdown": "# Infinite Loops\nCommon loop mistakes."}'),
    (m_id, 'Print Numbers 1 to 10', 'challenge', 4, 30, 50, '{"challengeType": "flowchart", "title": "Print Numbers 1 to 10", "objective": "Use a loop to display numbers from 1 to 10.", "requiredNodes": ["Start", "Loop", "End"], "task": "Loop from 1 to 10 and print."}'),
    (m_id, 'Loops Quiz', 'quiz', 5, 50, 25, '{"questionCount": 20, "topics": ["loops", "iteration"], "questions": []}');

    -- Module 5: Basic Algorithm Design
    INSERT INTO public.modules (track_id, title, description, order_index)
    VALUES (dsa_id, 'Basic Algorithm Design', 'Structured approaches to solving problems.', 4)
    RETURNING id INTO m_id;

    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data) VALUES
    (m_id, 'What is an Algorithm', 'video', 0, 30, 20, '{"youtubeId": "v4cd1O4zkGw"}'),
    (m_id, 'Designing Efficient Steps', 'video', 1, 70, 20, '{"youtubeId": "v4cd1O4zkGw"}'),
    (m_id, 'Intro to Time Complexity', 'article', 2, 40, 15, '{"markdown": "# Time Complexity\nBasic concept of algorithm efficiency."}'),
    (m_id, 'Combining Loops and Conditions', 'article', 3, 60, 15, '{"markdown": "# Combining Loops and Conditions\nDesigning slightly more complex algorithms."}'),
    (m_id, 'Sum of Numbers 1 to N', 'challenge', 4, 30, 50, '{"challengeType": "flowchart", "title": "Sum of Numbers 1 to N", "objective": "Calculate the sum from 1 to N using iteration.", "requiredNodes": ["Start", "Loop", "End"], "task": "Calculate sum from 1 to N."}'),
    (m_id, 'Algorithm Design Quiz', 'quiz', 5, 50, 25, '{"questionCount": 20, "topics": ["algorithm thinking", "efficiency concept"], "questions": []}');

END $$;
