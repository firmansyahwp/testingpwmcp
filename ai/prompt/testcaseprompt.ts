/**
 * Defines the JSON output contract for the AI Planner.
 *
 * This prompt ONLY describes the JSON format expected by the
 * application.
 *
 * Behaviour and reasoning are defined in plannerprompt.ts.
 */

export const TestCasePrompt = `
# OUTPUT FORMAT

Return ONLY one valid JSON object.

Do NOT return:

- Markdown
- Code fences
- Comments
- Explanations
- Notes
- Examples

The first character must be:

{

The last character must be:

}

---

# ROOT OBJECT

The root object represents one ExecutionPlan.

Structure:

{
  "objective": "",
  "summary": "",
  "generatedAt": "",
  "generatedBy": "",
  "testCases": []
}

---

# EXECUTION PLAN

Required fields

objective

string

summary

string

generatedAt

ISO-8601 datetime

Example

2026-06-29T10:00:00Z

generatedBy

string

Example

gpt-5.5

testCases

array

Must contain at least one Test Case.

---

# TEST CASE

Each test case must contain

{
    "id":"",
    "name":"",
    "tags":[],
    "steps":[]
}

Required

id

Unique identifier.

Example

TC001

name

Short business scenario.

Example

Login with valid credential

tags

Always array.

Example

[
    "Smoke",
    "Positive",
    "UI"
]

steps

Must contain one or more execution steps.

---

# EXECUTION STEP

Each step must contain

{
    "id":"",
    "name":"",
    "description":"",
    "tool":"",
    "arguments":{},
    "continueOnFailure":false,
    "timeout":30000,
    "retry":0,
    "notes":""
}

Required

id

Example

STEP001

name

Short action.

Good

Open Login Page

Enter Username

Enter Password

Click Login

Verify Dashboard

Bad

Login Success

Authentication

Complete Login

description

Describe one executable action.

tool

Must match exactly one MCP tool.

arguments

Object.

Must contain only the arguments required by that tool.

continueOnFailure

Boolean.

Default

false

timeout

Milliseconds.

Default

30000

retry

Integer.

Default

0

notes

Optional.

Empty string if not needed.

---

# MCP TOOL CONTRACT

Only these tool names are allowed.

goto

click

double_click

right_click

hover

type

press_key

check

uncheck

select_option

wait

wait_visible

wait_hidden

verify_text

verify_visible

verify_hidden

verify_title

verify_url

upload

scroll

drag_drop

evaluate

screenshot

Do NOT generate any other tool.

---

# TOOL ARGUMENT CONTRACT

goto

{
"url":"https://www.google.com"
}

type

{
"selector":"#username",
"text":"Admin"
}

click

{
"selector":"#loginButton"
}

double_click

{
"selector":"#employee"
}

right_click

{
"selector":"#employee"
}

hover

{
"selector":"#menu"
}

check

{
"selector":"#remember"
}

uncheck

{
"selector":"#remember"
}

select_option

{
"selector":"#country",
"value":"Indonesia"
}

press_key

{
"key":"Enter"
}

wait

{
"timeout":2000
}

wait_visible

{
"selector":"#dashboard"
}

wait_hidden

{
"selector":"#loading"
}

verify_text

{
"selector":"h6",
"text":"Dashboard"
}

verify_visible

{
"selector":"#dashboard"
}

verify_hidden

{
"selector":"#loading"
}

verify_title

{
"title":"OrangeHRM"
}

verify_url

{
"url":"https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index"
}

upload

{
"selector":"input[type=file]",
"path":"test-data/sample.pdf"
}

scroll

{
"selector":"#employeeTable"
}

drag_drop

{
"source":"#source",
"target":"#target"
}

evaluate

{
"script":"document.title"
}

screenshot

{
"name":"Dashboard"
}

---

# STEP RULES

One step

=

One MCP tool

Never combine actions.

Correct

goto

↓

type

↓

type

↓

click

↓

verify_text

Wrong

Login successfully

Verify dashboard and logout

Open browser and login

---

# TEST CASE RULES

Every Test Case must

- represent one business scenario
- be executable independently
- contain at least one execution step
- have a meaningful expectedResult

Split large scenarios into multiple test cases.

---

# DATA QUALITY

Generate realistic values.

Good

Admin

admin123

Dashboard

Employee List

Leave Request

Performance Review

John Doe

Bad

string

example

value

abc

test123

---

# VALIDATION

Before returning the response verify:

✓ JSON is valid

✓ No markdown

✓ No code fences

✓ No explanations

✓ Root object exists

✓ objective exists

✓ generatedAt exists

✓ generatedBy exists

✓ testCases exists

✓ Every test case has id

✓ Every test case has name

✓ Every test case has expectedResult

✓ Every test case has steps

✓ Every step has id

✓ Every step has tool

✓ Every step has arguments

✓ Every tool exists in MCP

✓ "selector" is used instead of "locator"

✓ "text" is used instead of "value" for type

✓ One step equals one tool

✓ No unsupported fields

Return ONLY the JSON object.
`;