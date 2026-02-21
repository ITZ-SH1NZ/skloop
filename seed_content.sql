-- Seed more detailed content for Web Development and DSA tracks

-- 1. Web Development Track
DO $$
DECLARE
    web_dev_id uuid;
    mod1_id uuid;
    mod2_id uuid;
BEGIN
    SELECT id INTO web_dev_id FROM public.tracks WHERE slug = 'web-development';

    IF web_dev_id IS NULL THEN
        RAISE NOTICE 'Track "web-development" not found. Skipping seeding for this track.';
        RETURN;
    END IF;

    -- Module 1: Basics of Web
    INSERT INTO public.modules (track_id, title, description, order_index)
    VALUES (web_dev_id, 'HTML & CSS Fundamentals', 'Master the building blocks of the web.', 0)
    RETURNING id INTO mod1_id;

    -- Topic 1.1: Introduction to HTML (Video)
    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data)
    VALUES (mod1_id, 'Intro to HTML', 'video', 0, 30, 20, '{"youtubeId": "qz0aGYMCzl0"}');

    -- Topic 1.2: HTML Structures (Article)
    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data)
    VALUES (mod1_id, 'HTML Structure & Semantics', 'article', 1, 70, 15, '{"markdown": "# HTML Structure\nLearn about tags, elements and attributes..."}');

    -- Topic 1.3: HTML Quiz
    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data)
    VALUES (mod1_id, 'HTML Basics Quiz', 'quiz', 2, 40, 25, '{"questions": [{"question": "What does HTML stand for?", "options": ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink Text Management"], "answer": 0}]}');

    -- Topic 1.4: Web IDE Challenge (Build a Link)
    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data)
    VALUES (mod1_id, 'The First Link', 'challenge', 3, 60, 50, '{
        "challengeType": "web-ide",
        "instructions": "Create an <a> tag pointing to google.com with the text \"Search\".",
        "initialHtml": "<!-- Write your code here -->",
        "initialCss": "body { font-family: sans-serif; }",
        "initialJs": "// No JS needed",
        "validationRules": [{"type": "text-match", "text": "href=\"https://google.com\""}]
    }');

    -- Module 2: Styling with CSS
    INSERT INTO public.modules (track_id, title, description, order_index)
    VALUES (web_dev_id, 'CSS Styling & Layout', 'Make your websites beautiful.', 1)
    RETURNING id INTO mod2_id;

    -- Topic 2.1: Selectors (Video)
    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data)
    VALUES (mod2_id, 'CSS Selectors', 'video', 0, 30, 20, '{"youtubeId": "l1mO_PiafBg"}');
END $$;

-- 2. DSA Track
DO $$
DECLARE
    dsa_id uuid;
    mod1_id uuid;
BEGIN
    SELECT id INTO dsa_id FROM public.tracks WHERE slug = 'dsa';

    IF dsa_id IS NULL THEN
        RAISE NOTICE 'Track "dsa" not found. Skipping seeding for this track.';
        RETURN;
    END IF;

    -- Module 1: Big O & Arrays
    INSERT INTO public.modules (track_id, title, description, order_index)
    VALUES (dsa_id, 'Big O & Arrays', 'The foundation of efficient algorithms.', 0)
    RETURNING id INTO mod1_id;

    -- Topic 1.1: Big O (Video)
    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data)
    VALUES (mod1_id, 'Intro to Big O', 'video', 0, 50, 20, '{"youtubeId": "v4cd1O4zkGw"}');

    -- Topic 1.2: Array Search (Flowchart)
    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data)
    VALUES (mod1_id, 'Linear Search Logic', 'challenge', 1, 30, 50, '{
        "challengeType": "flowchart",
        "task": "Build a flowchart for searching an element in an array.",
        "requiredNodes": ["Start", "Loop", "Decision", "End"]
    }');
END $$;
