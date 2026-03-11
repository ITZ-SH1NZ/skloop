
-- ====================================================================
-- FIX: RE-GENERATE YOUTUBE VIDEOS FOR TRACKS
-- This script replaces the invalid Grounding API tokens with real YT IDs.
-- ====================================================================

DO $$
BEGIN

    -- How the Internet Works -> How does the INTERNET work? ICT #2 Sabin
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"x3c1ih2NJEg"') 
    WHERE title = 'How the Internet Works';

    -- What Happens When You Type a URL -> What Happens When You Type a URL ByteByteGo
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"AlkDbnbv7dk"') 
    WHERE title = 'What Happens When You Type a URL';

    -- HTML Crash Course -> HTML Crash Course For Absolute Beginners Traversy Media
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"UB1O30fR-EE"') 
    WHERE title = 'HTML Crash Course';

    -- Understanding Semantic HTML -> Semantic HTML Kevin Powell
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"YOsMJQfwqow"') 
    WHERE title = 'Understanding Semantic HTML';

    -- CSS Basics -> CSS Basics for Beginners Kevin Powell
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"JnTPd9G6hoY"') 
    WHERE title = 'CSS Basics';

    -- Understanding the CSS Box Model -> CSS Box Model Kevin Powell
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"M6coJNLFBWI"') 
    WHERE title = 'Understanding the CSS Box Model';

    -- JavaScript Fundamentals -> JavaScript Tutorial for Beginners Full Course Mosh
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"W6NZfCO5SIk"') 
    WHERE title = 'JavaScript Fundamentals';

    -- DOM Manipulation -> Learn DOM Manipulation In 18 Minutes Web Dev Simplified
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"y17RuWkWdn8"') 
    WHERE title = 'DOM Manipulation';

    -- Frontend vs Backend -> Frontend vs Backend
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"1mXrxc_sv1o"') 
    WHERE title = 'Frontend vs Backend';

    -- Introduction to APIs -> APIs for Beginners Full Course freecodecamp
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"WXsD0ZgxjRw"') 
    WHERE title = 'Introduction to APIs';

    -- What is Programming Logic -> How To Build Programming Logic
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"4xh1Vek9vnk"') 
    WHERE title = 'What is Programming Logic';

    -- Computational Thinking -> Computational Thinking Full Course
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"0JUN9aDxVmI"') 
    WHERE title = 'Computational Thinking';

    -- Understanding Variables -> What is a variable in programming Khan Academy
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"KpJ385shzgM"') 
    WHERE title = 'Understanding Variables';

    -- Inputs and Outputs -> Programming Inputs and Outputs
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"aiM2Y87umr4"') 
    WHERE title = 'Inputs and Outputs';

    -- If Statements -> If Statements Programming
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"HQ3dCWjfRZ4"') 
    WHERE title = 'If Statements';

    -- Decision Making in Programs -> Decision Making in Programs
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"aK3C3j6xI6c"') 
    WHERE title = 'Decision Making in Programs';

    -- For Loops -> Mastering For Loops in 2 Minutes Python C++
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"KWgYha0clzw"') 
    WHERE title = 'For Loops';

    -- While Loops -> While Loops Programming
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"qUPXsPtWGoY"') 
    WHERE title = 'While Loops';

    -- What is an Algorithm -> What is an Algorithm Crash Course Computer Science
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"rL8X2mlNHPM"') 
    WHERE title = 'What is an Algorithm';

    -- Designing Efficient Steps -> Intro to Algorithms Crash Course
    UPDATE public.topics 
    SET content_data = jsonb_set(content_data, '{youtubeId}', '"rL8X2mlNHPM"') 
    WHERE title = 'Designing Efficient Steps';

END $$;
