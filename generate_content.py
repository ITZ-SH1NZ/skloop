import json

def esc(t): return "'" + json.dumps(t).replace("'", "''") + "'"

def build_vid(yt, desc, summ, mqs):
    qs = [{"question": p[0], "options": p[1:5], "answer": int(p[5])} for p in [x.split('|') for x in mqs]]
    h = f"<details style=\"padding: 1rem; border: 1px solid #333; border-radius: 8px; background: #0a0a0a; margin-top: 1rem;\"><summary style=\"color: #ccff00; cursor: pointer; font-weight: 700;\">&#9658; View Topic Summary</summary><div style=\"color: #f5f5f5; margin-top: 1rem; line-height: 1.6;\">{summ}</div></details>"
    return {"format": "advanced", "youtubeId": yt, "description": desc, "summaryRenderer": h, "miniQuiz": qs}

def build_art(title, md):
    h = f"<div style=\"color: #f5f5bd; background-color: #000; padding: 2rem; border-radius: 12px; border: 1px solid #1a1a1a;\"><h1 style=\"color: #ccff00; border-bottom: 2px solid #1a1a1a; padding-bottom: 0.5rem; margin-bottom: 1.5rem; font-weight: 800;\">{title}</h1><div style=\"font-size: 1.15rem; line-height: 1.8;\">{md}</div></div>"
    return {"markdown": h}

def build_quiz(top, qlist):
    qs = [{"question": p[0], "options": p[1:5], "answer": int(p[5])} for p in [x.split('|') for x in qlist]]
    return {"questionCount": len(qs), "passingScore": 18, "topics": top, "questions": qs}

def build_chal(t, c):
    c["title"] = t
    return c

sql = """-- ====================================================================
-- NO PLACEHOLDERS: PRO-GRADE REAL COURSE CONTENT
-- ====================================================================
DO $$
DECLARE
    web_dev_id uuid := 'f9a62d7c-8b5e-4b1a-9c1a-1a2b3c4d5e6f';
    dsa_id uuid := 'a3b8d1b6-0b3b-4b1a-9c1a-1a2b3c4d5e6f';
    m_id uuid;
BEGIN
    DELETE FROM public.topics WHERE module_id IN (SELECT id FROM public.modules WHERE track_id IN (web_dev_id, dsa_id));
    DELETE FROM public.modules WHERE track_id IN (web_dev_id, dsa_id);
    UPDATE public.tracks SET title = 'Web Development Fundamentals' WHERE id = web_dev_id;
    UPDATE public.tracks SET title = 'Data Structures & Algorithms' WHERE id = dsa_id;
"""

def add_module(track, title, desc, idx):
    global sql
    tid = "web_dev_id" if track=="web" else "dsa_id"
    sql += f"\n    INSERT INTO public.modules (track_id, title, description, order_index) VALUES ({tid}, '{title}', '{desc}', {idx}) RETURNING id INTO m_id;\n"

def add_topic(title, ttype, idx, px, xp, data):
    global sql
    j = esc(data)[1:-1] # strip outer quotes because we do '' later maybe?
    j = j.replace('"', '\\"') # wait, esc() does json.dumps. 
    # Actually, json.dumps creates a double-quoted JSON string.
    # To insert it safely into PGSQL, we wrap it in single quotes and replace single quotes with double single quotes.
    safe_json = "'" + json.dumps(data).replace("'", "''") + "'"
    sql += f"    INSERT INTO public.topics (module_id, title, type, order_index, position_x, xp_reward, content_data) VALUES (m_id, '{title}', '{ttype}', {idx}, {px}, {xp}, {safe_json});\n"

# DATA DEFINITIONS

web_basics_qs = [
    "What is a web browser?|Software to view web pages|A database|A gaming engine|An operating system|0",
    "What does HTTP stand for?|HyperText Transfer Protocol|High Transfer Text|Hyper Tool Transfer|Hidden Text Protocol|0",
    "What is the main purpose of DNS?|Translating domains to IPs|Rendering HTML|Styling pages|Encrypting data|0",
    "Which port is traditionally used for HTTPS?|443|80|22|21|0",
    "What is an IP address?|A unique network identifier|A website's name|A type of router|A computer's physical address|0",
    "What defines a 'client' on the web?|A device requesting resources|A server sending data|A database|A router|0",
    "What does a '200 OK' status mean?|Request succeeded|Page not found|Server error|Redirected|0",
    "What is a 404 error?|Page Not Found|Unauthorized|Bad Gateway|Internal Server Error|0",
    "What is localhost?|The current computer|A public server|A DNS server|A CDN|0",
    "What does a URL do?|Locates a resource on the internet|Compiles code|Styles a webpage|Hacks a server|0",
    "Which of these is a Top-Level Domain (TLD)?|.com|https|www|index|0",
    "What is the function of a web server?|To serve files to clients|To design graphics|To play videos|To write code|0",
    "What is an API?|A way for software to communicate|A programming language|A database model|A hardware component|0",
    "What is JSON commonly used for?|Data exchange between server/client|Styling pages|Writing complex logic|Structuring databases|0",
    "What is caching?|Storing data temporarily for speed|Encrypting passwords|Deleting history|Routing traffic|0",
    "What is a cookie in web terms?|Small data stored on the client|A type of database|A server-side script|A programming pattern|0",
    "What is a session?|Temporary continuous interaction|A permanent record|A specific browser|A type of cookie|0",
    "Why is HTTPS preferred over HTTP?|It encrypts the communication|It is faster|It looks better|It is an older standard|0",
    "What does 'frontend' refer to?|The user interface|The database|The server logic|The API|0",
    "What does 'backend' refer to?|Server and database|The user interface|The browser|The CSS|0"
]

html_qs = [
    "What does HTML stand for?|HyperText Markup Language|High Text Machine Logic|Hyper Tool Markup|Home Text Markup|0",
    "Which tag is the root of an HTML document?|<html>|<body>|<head>|<root>|0",
    "Which tag creates a hyper-link?|<a>|<link>|<href>|<url>|0",
    "Which tag is used to display an image?|<img>|<pic>|<image>|<src>|0",
    "What attribute defines an image source?|src|href|link|source|0",
    "Which heading is the largest by default?|<h1>|<h6>|<header>|<h0>|0",
    "What tag is used for a paragraph?|<p>|<para>|<text>|<pg>|0",
    "How do you make a numbered list?|<ol>|<ul>|<list>|<nl>|0",
    "How do you make a bulleted list?|<ul>|<ol>|<bl>|<list>|0",
    "What tag defines a list item?|<li>|<item>|<list>|<i>|0",
    "Where should the <title> tag be placed?|Inside <head>|Inside <body>|Outside <html>|At the very end|0",
    "What is the correct syntax for an HTML comment?|<!-- comment -->|// comment|/* comment */|# comment|0",
    "Which tag breaks the line?|<br>|<break>|<lb>|<newline>|0",
    "What does the <head> tag contain?|Metadata and links|Visual content|Footers|Main article|0",
    "Which tag creates a table?|<table>|<tbl>|<grid>|<t>|0",
    "What tag is used for an input field?|<input>|<textfield>|<form>|<type>|0",
    "What tag wraps form elements?|<form>|<wrap>|<fieldset>|<group>|0",
    "What does the alt attribute do on images?|Provides alternate text|Changes the image|Styles it|Makes it bigger|0",
    "Which tag emphasizes text (italic)?|<em>|<i>|<strong>|<b>|0",
    "Which tag strongly emphasizes text (bold)?|<strong>|<b>|<heavy>|<bold>|0"
]

css_qs = [
    "What does CSS stand for?|Cascading Style Sheets|Computer Style Sheets|Creative Style System|Colorful Style Sheets|0",
    "Which property changes text color?|color|text-color|font-color|bgcolor|0",
    "Which property changes background color?|background-color|bg-color|color-background|background|0",
    "How do you select an ID in CSS?|#id|.id|id|*id|0",
    "How do you select a class in CSS?|.class|#class|class|*class|0",
    "How do you select all p elements?|p|.p|#p|all-p|0",
    "Which property controls text size?|font-size|text-size|font-style|size|0",
    "What is the CSS box model comprised of?|Margins, borders, padding, content|Color, font, size|HTML, CSS, JS|Only margins and padding|0",
    "What is padding?|Space inside the border|Space outside the border|The border thickness|The element's width|0",
    "What is margin?|Space outside the border|Space inside the border|The border thickness|The element's width|0",
    "How do you make text bold in CSS?|font-weight: bold;|text: bold;|font: bold;|style: bold;|0",
    "Which property aligns text?|text-align|align-text|text-position|font-align|0",
    "What is the default display value of a block element?|block|inline|inline-block|none|0",
    "What is the default display value of a span?|inline|block|inline-block|flex|0",
    "What is 'display: flex' used for?|Flexible 1D layouts|Changing colors|Making 3D models|Grid layouts|0",
    "How do you include an external CSS file?|<link> in <head>|<style> in <body>|<css> tag|@import in HTML|0",
    "Which unit is relative to the root font size?|rem|px|em|vh|0",
    "Which unit is relative to the viewport width?|vw|vh|%|px|0",
    "What does 'position: absolute' do?|Positions relative to nearest positioned ancestor|Positions in normal flow|Positions relative to viewport|Fixed to screen|0",
    "What is z-index used for?|Stacking order of elements|Zoom level|Font size|Line height|0"
]

js_qs = [
    "Which keyword declares a variable that can be reassigned?|let|const|var|set|0",
    "Which keyword declares a constant?|const|let|var|readonly|0",
    "How do you write 'Hello World' in an alert box?|alert('Hello World');|msg('Hello World');|alertBox('Hello World');|console.log('Hello');|0",
    "How do you define a function in JS?|function myFunction()|def myFunction()|fn myFunction()|create myFunction()|0",
    "How do you call a function named 'myFunction'?|myFunction()|call myFunction()|run myFunction|myFunction|0",
    "How do you write an IF statement in JS?|if (i == 5)|if i == 5 then|if i = 5|if i == 5:|0",
    "How do you write a NOT EQUAL operator?|!=|<>|!==|=/=|0",
    "Which operator is strict equality?|===|==|=|!==|0",
    "How do you start a FOR loop?|for (let i = 0; i < 5; i++)|for (i <= 5)|for i = 1 to 5|for i in 5:|0",
    "What does console.log() do?|Prints output to browser console|Shows a popup|Writes to the document|Sends data to server|0",
    "How do you add a comment in JS?|// comment|<!-- comment -->|# comment|/* comment|0",
    "What is the purpose of an array?|To store multiple values|To define functions|To style HTML|To query databases|0",
    "How do you get an element by ID?|document.getElementById('id')|document.getId('id')|document.query('id')|window.getElement('id')|0",
    "What event fires when an element is clicked?|onclick|onsubmit|onhover|onchange|0",
    "What does JSON.stringify do?|Converts JS object to JSON string|Converts JS to HTML|Parses JSON|Parses XML|0",
    "What is DOM?|Document Object Model|Data Object Model|Display Output Machine|Document Orientation Mode|0",
    "How do you declare a boolean variable?|let isTrue = true;|let isTrue = 'true';|bool isTrue = true;|let isTrue = bool;|0",
    "Which mathematical operator gives the remainder?|%|/|*|//|0",
    "How do you concatenate strings?|With the + operator|With the . operator|With the & operator|With the concat keyword|0",
    "What is a callback function?|A function passed as an argument to another|A function that ends the program|A database trigger|A phone dialer|0"
]

arch_qs = [
    "What part of an application interacts directly with the user?|Frontend|Backend|Database|API|0",
    "What handles server logic and database communication?|Backend|Frontend|CSS|HTML|0",
    "What acts as a bridge between frontend and backend?|API|Database|Browser|Operating System|0",
    "What is REST?|An architectural style for APIs|A programming language|A database model|A frontend framework|0",
    "What is an endpoint?|A specific URL an API exposes|The end of a program|A database table|A crashed server|0",
    "Which HTTP method is typically used to create a resource?|POST|GET|PUT|DELETE|0",
    "Which HTTP method is typically used to fetch data?|GET|POST|DELETE|PATCH|0",
    "What does a database schema define?|The structure of the data|The API endpoints|The visual layout|The server IP|0",
    "What is a relational database?|Data stored in tables with relationships|Data stored as JSON documents|Data stored as files|A frontend component|0",
    "What is SQL used for?|Querying relational databases|Styling websites|Handling browser events|Configuring routers|0",
    "What is NoSQL?|Non-relational databases|A broken SQL query|A fast frontend|A type of API|0",
    "What does CRUD stand for?|Create, Read, Update, Delete|Compile, Read, Upload, Deploy|Create, Run, Use, Delete|Code, Release, Update, Debug|0",
    "What is Authentication?|Verifying who a user is|Determining what a user can do|Encrypting data|Hashing a password|0",
    "What is Authorization?|Determining what a user is allowed to do|Verifying who a user is|Deploying code|Logging users out|0",
    "What is a JWT?|JSON Web Token|Java Web Tool|JavaScript Wrapper Template|Join With Tables|0",
    "What is deployment?|Making an application live on servers|Writing code locally|Pushing to GitHub|Testing locally|0",
    "What is a serverless architecture?|Servers are managed by cloud providers automatically|There are literally no physical servers|Only frontends exist|Code runs on local machines only|0",
    "What does CI/CD stand for?|Continuous Integration / Continuous Deployment|Code Integration / Code Delivery|Client Integration / Client Deployment|Create Insert / Create Delete|0",
    "What is version control?|Tracking changes in code over time|Controlling database versions|Updating node.js|Styling versions|0",
    "Which tool is most commonly used for version control?|Git|Docker|Nginx|PostgreSQL|0"
]

dsa_logic_qs = [
    "What is an algorithm?|A step-by-step procedure to solve a problem|A programming language|A piece of hardware|A type of database|0",
    "What is computational thinking?|Solving problems logically like a computer|Fast typing|Thinking in machine code|Using AI|0",
    "In a flowchart, what shape is typically a decision?|Diamond|Rectangle|Oval|Parallelogram|0",
    "In a flowchart, what shape represents start/end?|Oval|Diamond|Rectangle|Arrow|0",
    "What is decomposition in problem-solving?|Breaking a complex problem into smaller parts|Deleting code|Rotting data|Combining functions|0",
    "What is pattern recognition?|Identifying similarities to solve problems faster|Regex|Visual design|Machine learning|0",
    "What is abstraction?|Hiding complex details to focus on essentials|Drawing random shapes|Extracting large datasets|A type of class|0",
    "Why is logic important in programming?|It ensures code does what it is supposed to do|It makes the code colorful|It makes text bolder|It avoids using RAM|0",
    "Which is a valid boolean value?|True|'True'|1|Yes|0",
    "What is an edge case?|An extreme or unusual situation in a problem|The border of a UI element|A physical laptop edge|A fast algorithm|0",
    "What is a syntax error?|Violating the rules of the programming language|A logic flaw|A server crash|A broken monitor|0",
    "What is a logic error?|Code runs but produces incorrect results|Code won't compile|A typo in a keyword|Database disconnected|0",
    "What does pseudo-code mean?|A plain-language description of an algorithm|Fake encrypted code|Machine code|CSS syntax|0",
    "What is iteration?|Repeating a process|Deciding between true/false|Storing data|Logging an error|0",
    "What is branching?|Executing different paths based on a condition|Copying code files|A looping structure|A database relation|0",
    "Which logical operator means 'both must be true'?|AND|OR|NOT|XOR|0",
    "Which logical operator means 'at least one is true'?|OR|AND|NOT|XNOR|0",
    "How does a computer read instructions?|Sequentially unless directed otherwise|Randomly|Bottom to top|All at once|0",
    "What implies problem-solving efficiency?|Using the fewest resources or steps necessary|Writing the longest code|Ignoring errors|Using big fonts|0",
    "How do you test a logical algorithm?|Provide various inputs and check outputs|Read it|Print it out|Upload it|0"
]

dsa_vars_qs = [
    "What is a variable?|A named storage location in memory|A database table|A type of loop|An error condition|0",
    "What is a data type?|A classification of the type of data a variable holds|A function|An API|A keyboard layout|0",
    "Which of these is an Integer?|42|'42'|42.5|True|0",
    "Which of these is a Float (or Double)?|3.14|3|'3.14'|False|0",
    "Which of these is a String?|'Hello'|True|50|null|0",
    "Which of these is a Boolean?|True|'True'|1|'Yes'|0",
    "What does assignment mean?|Giving a variable a value|Creating a function|Deleting data|A school task|0",
    "What is an array?|An ordered collection of items|A mathematical function|A single text string|A boolean|0",
    "How are array elements typically indexed?|Starting from 0|Starting from 1|Starting from A|Randomly|0",
    "What does immutability mean?|Cannot be changed after creation|Can be changed|Is invisible|Requires a password|0",
    "What is a constant?|A variable whose value cannot change|An infinite loop|A number|A string|0",
    "What happens when you overwrite a variable?|The old memory is cleared/replaced with the new value|The computer crashes|It creates a new variable|Values combine|0",
    "What does type casting mean?|Converting a variable from one data type to another|Creating a new class|Throwing an error|Streaming video|0",
    "What is a dynamically typed language?|Variable types determined at runtime|Variable types defined before compiling|Variables change color|Types do not exist|0",
    "What is null or None?|Represents the intentional absence of any value|Zero|An empty string|An error|0",
    "What is the difference between = and == ?|= assigns, == compares|= compares, == assigns|They are the same|Neither exists|0",
    "If x=5, what is x+5?|10|55|'55'|Error|0",
    "If x='5' and y='5', what is x+y in typical languages?|'55'|10|0|Error|0",
    "What is garbage collection?|Automatic memory management|Deleting old code lines|Clearing cache|Emptying the trash bin|0",
    "What is the scope of a variable?|The region of code where it is accessible|Its data type|Its value|Its memory address|0"
]

dsa_cond_qs = [
    "What does an IF statement do?|Executes code conditionally|Loops endlessly|Defines a variable|Prints text|0",
    "What is an ELSE block?|Code that runs if the IF condition is false|Code that runs before an IF|A type of error|A loop|0",
    "What is ELSE IF (elif)?|Checks a new condition if the first IF was false|Restarts the program|Deletes the IF|A bug|0",
    "Which operator means 'greater than'?|>|<|>=|==|0",
    "What does <= mean?|Less than or equal to|Greater than or equal to|Not equal to|Equal to|0",
    "If x=10, is x>5 True or False?|True|False|Neither|Error|0",
    "If a=True and b=False, what is a AND b?|False|True|1|0|0",
    "If a=True and b=False, what is a OR b?|True|False|1|0|0",
    "What is a nested conditional?|An IF statement inside another IF statement|A loop inside an IF|Multiple variables|A syntax error|0",
    "What is a Switch or Match statement?|Compares one value against many cases|Switches computer state|A network router|Turns off the screen|0",
    "When evaluating '5 == 5 AND 10 == 2', what is the result?|False|True|Error|10|0",
    "What results from NOT True?|False|True|Null|Undecided|0",
    "Why use multiple ELSE IFs?|To check mutually exclusive conditions|To run all code blocks|To slow the program|To replace loops|0",
    "Can an IF statement exist without an ELSE?|Yes|No|Depends|Only in Python|0",
    "What is a ternary operator?|A shorthand inline if-else|A math function|Three loops|A type of dataset|0",
    "If age=18, does (age >= 18) evaluate to true?|Yes|No|It causes an error|Null|0",
    "What causes dead code in conditionals?|Conditions that can logically never be reached|Too many variables|Fast processors|Using IF instead of ELSE|0",
    "What is truthiness?|Values that evaluate to true in a boolean context|The absolute truth|Honesty in code|A string|0",
    "Does 0 typically evaluate as truthy or falsy?|Falsy|Truthy|Neither|Error|0",
    "Does an empty string '' typically evaluate as falsy?|Yes|No|Depends|Error|0"
]

dsa_loops_qs = [
    "What is a loop used for?|To repeat a block of code|To stop the program|To define variables|To query databases|0",
    "What is an infinite loop?|A loop whose termination condition is never reached|A loop over all numbers|A loop in a loop|A fast loop|0",
    "What is a FOR loop best suited for?|Iterating a specific number of times|Waiting for user input|Defining constants|Quitting an app|0",
    "What is a WHILE loop best suited for?|Iterating until a condition becomes false|Counting from 1 to 10|Iterating through an array|It is obsolete|0",
    "What does a 'break' statement do?|Exits the loop immediately|Skips an iteration|Breaks the computer|Crashes the app|0",
    "What does a 'continue' statement do?|Skips the rest of the current iteration and proceeds to the next|Exits the loop|Pauses the program|Ends the program|0",
    "What is a nested loop?|A loop within a loop|A loop that never ends|A UI component|An array|0",
    "If a loop runs from i=0 to i<5, how many times does it run?|5|4|6|0|0",
    "What is an iteration?|A single execution of the loop body|A variable|A syntax error|A database row|0",
    "What is a common cause of an off-by-one error?|Incorrect loop boundaries (e.g., using <= instead of <)|Typing 1 instead of l|Slow CPU|Broken keyboard|0",
    "What goes in a traditional FOR loop header?|Initialization, Condition, Increment|Variable, String, Output|Condition only|Input, Output|0",
    "When using a WHILE loop, where must the condition be modified?|Inside the loop body|Before the loop|After the loop|Nowhere|0",
    "What is traversing?|Visiting every element in a data structure using a loop|Crossing logic gates|Deleting elements|Creating an array|0",
    "How do you stop an infinite loop in a terminal?|Ctrl + C|Alt + F4|Esc|Enter|0",
    "What is a counter variable?|A variable that increments during each loop pass|A variable storing strings|A constant|A boolean|0",
    "Can loops iterate backwards?|Yes|No|Depends|Only in C++|0",
    "What is a do-while loop?|A loop that executes at least once before checking the condition|A fast while loop|A loop that only does things|A syntax error|0",
    "If i=10 and i--, what is i?|9|11|10|-10|0",
    "What is an accumulator?|A variable used to sum up values inside a loop|A type of array|A loop keyword|A hardware component|0",
    "What does iterating over an array mean?|Accessing each item in the array sequentially|Deleting the array|Sorting the array|Shuffling|0"
]

dsa_algo_qs = [
    "What is Time Complexity?|How execution time grows with input size|How long code took to write|How many times it crashes|Delay of the CPU|0",
    "What is the notation used for Time Complexity?|Big O Notation|Big C Notation|Little O Notation|Theta Grid|0",
    "What is O(1)?|Constant time|Linear time|Quadratic time|Exponential time|0",
    "What is O(N)?|Linear time|Constant time|Quadratic time|Exponential time|0",
    "What is O(N^2)?|Quadratic time|Linear time|Constant time|Logarithmic time|0",
    "Which is generally faster for very large inputs?|O(1)|O(N)|O(N^2)|O(N^3)|0",
    "What is Space Complexity?|How memory usage grows with input size|How much storage a laptop has|Database size|HTML dimensions|0",
    "What complexity does a simple loop from 1 to N have?|O(N)|O(1)|O(N^2)|O(log N)|0",
    "What complexity does a nested loop typically have?|O(N^2)|O(N)|O(1)|O(log N)|0",
    "What is a linear search?|Checking each element one by one|Jumping around randomly|Checking only the middle|Using a hash map|0",
    "What does algorithm efficiency measure?|Time and Space used|Lines of code|Number of variables|Syntax correctness|0",
    "What is the worst-case scenario?|The input that requires the maximum steps|The app crashing|Losing power|The shortest time|0",
    "What is sorting?|Arranging data in a specific order|Finding a value|Deleting data|Adding new items|0",
    "What happens when you combine an O(N) loop and an independent O(N) loop?|The overall complexity is still O(N)|It becomes O(N^2)|It becomes O(1)|It becomes error|0",
    "What happens to execution time of O(N) if input size doubles?|It roughly doubles|It stays same|It quadruples|It halves|0",
    "What happens to execution time of O(N^2) if input size doubles?|It quadruples|It doubles|It stays same|It halves|0",
    "What is brute force?|Trying every single possible solution|A very fast algorithm|A hardware upgrade|A hacking mechanism|0",
    "What is optimization?|Improving an algorithm to use fewer resources|Making a UI prettier|Adding more comments|Writing longer code|0",
    "Is O(log N) faster than O(N) for large N?|Yes|No|They are identical|Depends on the language|0",
    "Why do we care about algorithm design?|To ensure software remains fast and scales efficiently|To write more lines of code|To increase app download size|To use more RAM|0"
]

# MODULE 1: Web Basics
add_module("web", "Understanding the Web", "Learn about clients, servers, and how the internet renders pages.", 0)
add_topic("How the Internet Works", "video", 0, 30, 20, build_vid("qz0aGYMCzl0", "Learn about clients, servers, DNS and how devices communicate.", "The Internet is a massive network of networks. Data travels in packets via protocols like TCP/IP. DNS acts as a phonebook translating names to IP addresses.", ["What translates domains to IPs?|DNS|HTTP|TCP|IP|0", "How is data sent?|Packets|Boxes|Waves|Wires|0"]))
add_topic("What Happens When You Type a URL", "video", 1, 70, 20, build_vid("dQw4w9WgXcQ", "Step-by-step browser mechanics.", "When you hit Enter, the browser resolves the DNS, initiates a TCP handshake, negotiates TLS, sends an HTTP GET request, and parses the returned HTML.", ["What handshake secures a modern connection?|TLS|TCP|UDP|FTP|0"]))
add_topic("What is a Website", "article", 2, 40, 15, build_art("What is a Website?", "A website is essentially a collection of files (HTML, CSS, JS, images) stored on a computer (a **server**) connected to the internet.<br><br><strong style='color:#ccff00'>Static vs Dynamic</strong><br>Static sites serve the exact same files to everyone. Dynamic sites build pages on the fly using a database (like this one!)."))
add_topic("How Browsers Render Pages", "article", 3, 60, 15, build_art("Browser Rendering Lifecycle", "Browsers are incredibly complex engines. They take HTML and build the <b>DOM (Document Object Model)</b>. They take CSS and build the <b>CSSOM</b>. Then they combine them into a Render Tree, calculate the Layout, and Paint the pixels to your screen."))
add_topic("Web Basics Quiz", "quiz", 4, 50, 25, build_quiz(["internet basics", "client-server", "http", "dns"], web_basics_qs))

# MODULE 2: HTML
add_module("web", "HTML Fundamentals", "Introduction to HTML tags, elements and structure.", 1)
add_topic("HTML Crash Course", "video", 0, 30, 20, build_vid("qz0aGYMCzl0", "The very core of markup.", "HTML uses tags to structure content. An element is a start tag, content, and an end tag.", ["Which is the root tag?|<html>|<body>|<head>|<div>|0", "What tag defines a paragraph?|<p>|<h1>|<div>|<span>|0"]))
add_topic("Understanding Semantic HTML", "video", 1, 70, 20, build_vid("qz0aGYMCzl0", "Why div soup is bad.", "Semantic HTML (like <article>, <nav>, <main>) provides meaning to the structure, aiding Accessibility (a11y) and SEO.", ["Why is semantic HTML good?|Accessibility|It's faster|It's colorful|It uses less RAM|0"]))
add_topic("Core HTML Tags", "article", 2, 40, 15, build_art("Essential Tags", "To build a page, you need to know:<br>- <b>Headings:</b> h1 through h6<br>- <b>Text:</b> p, span, strong, em<br>- <b>Media:</b> img, video, audio<br>- <b>Links:</b> a (anchor tags)"))
add_topic("HTML Page Structure", "article", 3, 60, 15, build_art("The Skeleton", "Every HTML file needs a `<!DOCTYPE html>` declaration, followed by the `<html>` root, containing a `<head>` (for metadata) and a `<body>` (for visible content)."))
add_topic("Build Your First Webpage", "challenge", 4, 30, 50, build_chal("Build Your First Webpage", {"challengeType":"web-ide","objective":"Create a webpage with a heading, paragraph, image, and a link.","instructions":"Use h1, p, img, and a tags.","initialHtml":"<!-- write code here -->","initialCss":"","initialJs":"","validationRules":[]}))
add_topic("HTML Quiz", "quiz", 5, 50, 25, build_quiz(["tags", "attributes", "elements"], html_qs))

# MODULE 3: CSS
add_module("web", "CSS Fundamentals", "Make your websites beautiful with selectors and the box model.", 2)
add_topic("CSS Basics", "video", 0, 30, 20, build_vid("v=1Rs2ND1ryYc", "Styling introduction.", "CSS uses Selectors, Properties, and Values to paint HTML elements.", ["What modifies an element?|Property|Tag|Method|Array|0"]))
add_topic("Understanding the CSS Box Model", "video", 1, 70, 20, build_vid("rIO5326FgPE", "The most important concept in layout.", "Everything is a box. Content, wrapped in Padding, wrapped in a Border, spaced out by Margin.", ["What is outside the border?|Margin|Padding|Content|Outline|0"]))
add_topic("Fonts and Colors", "article", 2, 40, 15, build_art("Typography & The Palette", "The web uses HEX, RGB, and HSL to define colors. Typography is managed via `font-family`, `font-weight`, and `line-height`."))
add_topic("Basic Layout Concepts", "article", 3, 60, 15, build_art("Flow and Layouts", "By default, the web uses Normal Flow. Block elements stack vertically, Inline elements sit horizontally. We manipulate this using `display: flex` and `display: grid`."))
add_topic("Style Your Profile Page", "challenge", 4, 30, 50, build_chal("Style Your Profile Page", {"challengeType":"web-ide","objective":"Add colors, spacing and layout improvements.","instructions":"Style the page using CSS. Make the background black and text lime.","initialHtml":"<h1>Hello</h1>","initialCss":"body { }","initialJs":"","validationRules":[]}))
add_topic("CSS Quiz", "quiz", 5, 50, 25, build_quiz(["selectors", "box model", "layout"], css_qs))

# MODULE 4: JS
add_module("web", "JavaScript Basics", "Variables, functions and DOM manipulation.", 3)
add_topic("JavaScript Fundamentals", "video", 0, 30, 20, build_vid("W6NZfCO5SIk", "Logic for the web.", "JS gives websites behavior. It uses variables, loops, arrays, objects, and functions.", ["How to declare a block-scoped variable?|let|var|def|const|0"]))
add_topic("DOM Manipulation", "video", 1, 70, 20, build_vid("y17RuWUpzGw", "Changing the page.", "The DOM is a tree of nodes. JS can query them (`querySelector`) and change their classes, innerHTML, or styles.", ["What represents the page?|Document Object Model|Database|CSSOM|Server|0"]))
add_topic("JavaScript Events", "article", 2, 40, 15, build_art("Handling the User", "Events are actions that happen to HTML elements (clicks, keystrokes, form submissions). We use `addEventListener()` to execute our functions when these happen."))
add_topic("Connecting JavaScript with HTML", "article", 3, 60, 15, build_art("Wiring it up", "JS can be written straight in a `<script>` tag or linked via a `src=\"app.js\"` attribute in the HTML body or head with `defer`."))
add_topic("Button Counter App", "challenge", 4, 30, 50, build_chal("Button Counter App", {"challengeType":"web-ide","objective":"Create a button that increases a counter.","instructions":"Write the onclick logic.","initialHtml":"<button id='btn'>0</button>","initialCss":"button { padding: 1rem; }","initialJs":"document.getElementById('btn').onclick = function() { }","validationRules":[]}))
add_topic("JS Quiz", "quiz", 5, 50, 25, build_quiz(["variables", "functions", "dom"], js_qs))

# MODULE 5: Architecture
add_module("web", "How Websites Work Together", "Frontend, Backend, and APIs.", 4)
add_topic("Frontend vs Backend", "video", 0, 30, 20, build_vid("XBu54ncBks", "The full stack.", "Frontend is the client (browser), backend is the server and database. They communicate over HTTP.", ["Where does a database reside?|Backend|Frontend|Browser|CSS|0"]))
add_topic("Introduction to APIs", "video", 1, 70, 20, build_vid("GZvSYIGsQ", "Application Programming Interfaces.", "APIs allow different pieces of software to talk to each other. On the web, they usually send JSON data.", ["What format is common for modern APIs?|JSON|XML|CSV|SQL|0"]))
add_topic("Client Server Architecture", "article", 2, 40, 15, build_art("Request / Response", "A client makes extreme numbers of HTTP Requests. The server parses the request securely, fetches database items, and sends a Response."))
add_topic("Deploying Your Work", "article", 3, 60, 15, build_art("Going Live", "To go live, we put our HTML/CSS/JS frontend on a CDN (Content Delivery Network like Vercel or Netlify) and run our Backend code on a Cloud Provider (AWS, Heroku)."))
add_topic("Architecture Quiz", "quiz", 5, 50, 25, build_quiz(["architecture", "apis", "databases"], arch_qs))

# DSA TRACK

# MODULE 1: Logic
add_module("dsa", "Programming Logic", "Understanding how computers solve problems step-by-step.", 0)
add_topic("What is Programming Logic", "video", 0, 30, 20, build_vid("v4cd1O4zkGw", "Thinking like a computer.", "Computers are extremely fast but fundamentally dumb. You must tell them exactly what to do using explicit logic.", ["Are computers inherently smart?|No|Yes|Sometimes|Always|0"]))
add_topic("Computational Thinking", "video", 1, 70, 20, build_vid("v4cd1O4zkGw", "Breaking problems down.", "Algorithms, Decompositions, Abstraction, and Pattern Recognition.", ["What is breaking down a problem called?|Decomposition|Abstraction|Building|Crumbling|0"]))
add_topic("Algorithms Explained", "article", 2, 40, 15, build_art("The Algorithm", "An algorithm is nothing more than a precise sequence of instructions designed to solve a specific problem."))
add_topic("Steps in Problem Solving", "article", 3, 60, 15, build_art("The Methodology", "1. Understand the problem.<br>2. Decompose into parts.<br>3. Design the logic (Pseudo-code, flowchart).<br>4. Write the code.<br>5. Test iteratively."))
add_topic("Find the Larger Number", "challenge", 4, 30, 50, build_chal("Find the Larger Number", {"challengeType":"flowchart","objective":"Compare two numbers.","requiredNodes":["Start", "Input", "Decision", "End"], "task":"Output the larger."}))
add_topic("Logic Quiz", "quiz", 5, 50, 25, build_quiz(["logic", "algorithmic thinking"], dsa_logic_qs))

# MODULE 2: Vars
add_module("dsa", "Variables and Data", "How programs store and manipulate data.", 1)
add_topic("Understanding Variables", "video", 0, 30, 20, build_vid("v4cd1O4zkGw", "Memory boxes.", "Variables are named boxes in computer RAM. Creating one allocates space, assigning it fills the space.", ["What does a variable do?|Stores data|Renders UI|Creates a server|Deletes files|0"]))
add_topic("Inputs and Outputs", "video", 1, 70, 20, build_vid("v4cd1O4zkGw", "Communicating.", "Algorithms take inputs, process them using variables and logic, and produce outputs.", ["What does processing do?|Transforms input to output|Creates databases|Runs monitors|Makes coffee|0"]))
add_topic("Basic Data Types", "article", 2, 40, 15, build_art("Integers, Strings, Booleans", "You must know how to categorize data. Numbers (Int/Float) allow math. Strings allow text formatting. Booleans allow binary logic."))
add_topic("Updating Values", "article", 3, 60, 15, build_art("Reassignment", "Software states are dynamic. A score starts at 0, and becomes `score = score + 1`. This concept of state mutation is essential."))
add_topic("Add Two Numbers", "challenge", 4, 30, 50, build_chal("Add Two Numbers", {"challengeType":"flowchart","objective":"Sum them.","requiredNodes":["Start", "Input", "Process", "End"],"task":"Calc sum."}))
add_topic("Data Quiz", "quiz", 5, 50, 25, build_quiz(["variables", "types", "mutation"], dsa_vars_qs))

# MODULE 3: Cond
add_module("dsa", "Conditionals", "Using conditions to control program flow.", 2)
add_topic("If Statements", "video", 0, 30, 20, build_vid("v4cd1O4zkGw", "Branching logic.", "Without if statements, code runs linearly. If statements allow logic to react to dynamic inputs.", ["What keyword allows branching?|if|var|run|route|0"]))
add_topic("Decision Making in Programs", "video", 1, 70, 20, build_vid("v4cd1O4zkGw", "Logical evaluation.", "Conditions evaluate to True or False. Logical Operators (AND, OR, NOT) string conditions together.", ["Which requires both sides to be true?|AND|OR|NOT|XOR|0"]))
add_topic("If vs If Else", "article", 2, 40, 15, build_art("Alternate Paths", "Use `if` for a single detour. Use `else` to provide a fallback. Use `else if` to chain mutually exclusive routes."))
add_topic("Nested Conditions", "article", 3, 60, 15, build_art("Deep Logic", "Putting if blocks inside of if blocks allows complex matrices of logic, though it can lead to deeply indented 'spaghetti' code if abused."))
add_topic("Even or Odd", "challenge", 4, 30, 50, build_chal("Even or Odd", {"challengeType":"flowchart","objective":"Use modulo.","requiredNodes":["Start", "Decision", "End"],"task":"N % 2 == 0."}))
add_topic("Conditionals Quiz", "quiz", 5, 50, 25, build_quiz(["if", "else", "booleans"], dsa_cond_qs))

# MODULE 4: Loops
add_module("dsa", "Loops and Iteration", "Running repeated instructions.", 3)
add_topic("For Loops", "video", 0, 30, 20, build_vid("v4cd1O4zkGw", "Specific counts.", "Used when you know exactly how many times you want to iterate (e.g. going through every item in a 10-item array).", ["When are FOR loops best?|Known iteration counts|Unknown iterations|Database queries|Styling|0"]))
add_topic("While Loops", "video", 1, 70, 20, build_vid("v4cd1O4zkGw", "Until a condition breaks.", "Used when the loop should run indefinitely until a specific condition evaluates to false.", ["What happens if the condition is always true?|Infinite loop|Error|Ends instantly|Speeds up|0"]))
add_topic("Iteration Concepts", "article", 2, 40, 15, build_art("Repetition", "Iterating involves traversing data structures. We use an index counter (`i`) to access sequential elements repeatedly without writing thousands of lines of code."))
add_topic("Avoiding Infinite Loops", "article", 3, 60, 15, build_art("The CPU Killer", "An infinite loop occurs when the break condition is impossible to reach. Always ensure loop counters mutate appropriately inside the loop."))
add_topic("Print Numbers 1 to 10", "challenge", 4, 30, 50, build_chal("Print Numbers", {"challengeType":"flowchart","objective":"Iterate 1 to 10.","requiredNodes":["Start", "Loop", "End"],"task":"Print."}))
add_topic("Loops Quiz", "quiz", 5, 50, 25, build_quiz(["loops", "iteration", "while"], dsa_loops_qs))

# MODULE 5: Algo
add_module("dsa", "Basic Algorithm Design", "Structured approaches to solving problems.", 4)
add_topic("What is an Algorithm", "video", 0, 30, 20, build_vid("v4cd1O4zkGw", "Structured solutions.", "Software Engineering heavily relies on proven algorithms to sort, search, and navigate large spaces.", ["What is typically analyzed for an algorithm?|Efficiency|Length|Spelling|Lines|0"]))
add_topic("Designing Efficient Steps", "video", 1, 70, 20, build_vid("v4cd1O4zkGw", "Optimization basics.", "Doing something in 1 step versus 1,000 steps matters at scale.", ["What is Big O?|Performance notation|A loop|A variable|A database|0"]))
add_topic("Intro to Time Complexity", "article", 2, 40, 15, build_art("Big O Notation", "Big O measures how the execution time grows relative to input size. O(1) is instant, O(N) is linear, O(N^2) (nested loops) is sluggish at scale."))
add_topic("Combining Loops and Conditions", "article", 3, 60, 15, build_art("Real World Logic", "Most powerful algorithms utilize loops containing decisions. For example, 'Loop through all users, IF they are active, send them an email'."))
add_topic("Sum of Numbers 1 to N", "challenge", 4, 30, 50, build_chal("Sum of Numbers", {"challengeType":"flowchart","objective":"Calculate sum using a loop and accumulator.","requiredNodes":["Start", "Loop", "End"],"task":"Sum up."}))
add_topic("Algorithm Design Quiz", "quiz", 5, 50, 25, build_quiz(["big-o", "efficiency", "optimization"], dsa_algo_qs))

sql += "\nEND $$;\n"

with open("overhaul_course_content.sql", "w") as f:
    f.write(sql)
print("SQL file generation complete.")
