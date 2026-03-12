-- ====================================================================
-- REVAMP WEB DEV CHALLENGES: RICH VALIDATION RULES & INSTRUCTIONS
-- ====================================================================
DO $$
BEGIN
    -- 1. Build Your First Webpage
    UPDATE public.topics 
    SET content_data = jsonb_set(
        jsonb_set(
            content_data, 
            '{validationRules}', 
            '[
                {"text": "Add a main heading using <h1>", "type": "dom-selector", "selector": "h1"},
                {"text": "Write a short bio in a paragraph <p>", "type": "dom-selector", "selector": "p"},
                {"text": "Include a profile image using <img>", "type": "dom-selector", "selector": "img"},
                {"text": "Add a link to your favorite site <a>", "type": "dom-selector", "selector": "a"}
            ]'::jsonb
        ),
        '{hints}',
        '[
            "Make sure your tags are properly closed like <h1>Title</h1>.",
            "The <img> tag is a void tag, it doesn''t need a closing tag!",
            "Use the href attribute on the <a> tag to point to a URL."
        ]'::jsonb
    )
    WHERE title = 'Build Your First Webpage' AND type = 'challenge';

    -- 2. Style Your Profile Page
    UPDATE public.topics 
    SET content_data = jsonb_set(
        jsonb_set(
            content_data, 
            '{validationRules}', 
            '[
                {"text": "Set the body background to black", "type": "css-prop", "selector": "body", "property": "background-color", "value": "rgb(0, 0, 0)"},
                {"text": "Set the text color to Lime (#D4F268)", "type": "css-prop", "selector": "body", "property": "color", "value": "rgb(212, 242, 104)"},
                {"text": "Add some padding (at least 20px) to the body", "type": "css-prop", "selector": "body", "property": "padding", "value": "20px"}
            ]'::jsonb
        ),
        '{hints}',
        '[
            "You can use hex codes like #000000 or color names like black.",
            "Lime is specifically #D4F268 in our theme.",
            "Check the CSS box model lesson if you forgot how padding works!"
        ]'::jsonb
    )
    WHERE title = 'Style Your Profile Page' AND type = 'challenge';

    -- 3. Button Counter App
    UPDATE public.topics 
    SET content_data = jsonb_set(
        jsonb_set(
            content_data, 
            '{validationRules}', 
            '[
                {"text": "Target the button using its ID ''btn''", "type": "text-match", "text": "getElementById(''btn'')"},
                {"text": "Implement the onclick listener", "type": "regex", "text": "onclick\\s*="},
                {"text": "Increment the counter and update innerHTML", "type": "text-match", "text": "innerHTML"}
            ]'::jsonb
        ),
        '{hints}',
        '[
            "Use document.getElementById(''btn'') to find the button.",
            "Inside the function, you can use innerHTML to change the text.",
            "Variables can be incremented using counter++ or counter = counter + 1."
        ]'::jsonb
    )
    WHERE title = 'Button Counter App' AND type = 'challenge';

END $$;
