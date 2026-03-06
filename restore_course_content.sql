-- ====================================================================
-- FALLBACK RESTORE SCRIPT: Web Development & DSA
-- ====================================================================

DO $$
DECLARE
    web_dev_id uuid := 'f9a62d7c-8b5e-4b1a-9c1a-1a2b3c4d5e6f';
    dsa_id uuid := 'a3b8d1b6-0b3b-4b1a-9c1a-1a2b3c4d5e6f';
    mod1_id uuid;
    mod2_id uuid;
BEGIN
    -- 1. CLEANUP Overhauled Content
    DELETE FROM public.topics WHERE module_id IN (SELECT id FROM public.modules WHERE track_id IN (web_dev_id, dsa_id));
    DELETE FROM public.modules WHERE track_id IN (web_dev_id, dsa_id);

    -- 2. RESTORE TRACK TITLES
    UPDATE public.tracks SET title = 'Web Development' WHERE id = web_dev_id;
    UPDATE public.tracks SET title = 'Data Structures & Algorithms' WHERE id = dsa_id;

    -- ==========================================
    -- RESTORE WEB DEV MODULES
    -- ==========================================

    INSERT INTO public.modules (id, track_id, title, description, order_index)
    VALUES ('0e7a91a4-6f8a-4670-a630-6cb5b1fcae32', web_dev_id, 'HTML & CSS Fundamentals', 'Master the building blocks of the web.', 0)
    RETURNING id INTO mod1_id;

    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data) VALUES
    (mod1_id, 'Intro to HTML', 'video', 0, 30, 20, '{"youtubeId": "qz0aGYMCzl0"}'),
    (mod1_id, 'HTML Structure & Semantics', 'article', 1, 70, 15, '{"markdown": "# HTML Structure\nLearn about tags, elements and attributes..."}'),
    (mod1_id, 'HTML Basics Quiz', 'quiz', 2, 40, 25, '{"questions": [{"question": "What does HTML stand for?", "options": ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink Text Management"], "answer": 0}]}'),
    (mod1_id, 'The First Link', 'challenge', 3, 60, 50, '{"challengeType": "web-ide", "instructions": "Create an <a> tag pointing to google.com with the text \"Search\".", "initialHtml": "<!-- Write your code here -->", "initialCss": "body { font-family: sans-serif; }", "initialJs": "// No JS needed", "validationRules": [{"type": "text-match", "text": "href=\"https://google.com\""}]}');

    INSERT INTO public.modules (id, track_id, title, description, order_index)
    VALUES ('a0875e2f-6b4e-4fbc-8f6c-ae8b072735f7', web_dev_id, 'CSS Styling & Layout', 'Make your websites beautiful.', 1)
    RETURNING id INTO mod2_id;

    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data)
    VALUES (mod2_id, 'CSS Selectors', 'video', 0, 30, 20, '{"youtubeId": "l1mO_PiafBg"}');


    -- ==========================================
    -- RESTORE DSA MODULES
    -- ==========================================

    INSERT INTO public.modules (id, track_id, title, description, order_index)
    VALUES ('95dc1f92-ca62-45fa-a48d-c34d67737183', dsa_id, 'Big O & Arrays', 'The foundation of efficient algorithms.', 0)
    RETURNING id INTO mod1_id;

    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data) VALUES
    (mod1_id, 'Intro to Big O', 'video', 0, 50, 20, '{"youtubeId": "v4cd1O4zkGw"}'),
    (mod1_id, 'Linear Search Logic', 'challenge', 1, 30, 50, '{"challengeType": "flowchart", "task": "Build a flowchart for searching an element in an array.", "requiredNodes": ["Start", "Loop", "Decision", "End"]}');

END $$;
