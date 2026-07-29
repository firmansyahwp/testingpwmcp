import {BrowserSessionContext, JsonObject, ToolResult, ToolStatus, ToolDefinition, ToolContext, } from "./types";
import {BrowserSession} from "./browser-session";
import { z } from "zod";
import { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { RuntimeConfig } from "../ai/runtime-config";

// ----------------------------------------------------------------------------------------------------------------------------------------
//                                                                 HELPER
// ----------------------------------------------------------------------------------------------------------------------------------------

// Build success response.
function success(message: string, data?: JsonObject,): ToolResult {
    return {status: ToolStatus.SUCCESS, message, data,};
}

// Build failure response.
function failure(message: string, data?: JsonObject,): ToolResult {
    return {status: ToolStatus.FAILED, message, data,};
}

// Ensure browser exists.
function requireBrowser(session: BrowserSessionContext,) {
    if (!session.browser) {
        throw new Error("Browser has not been launched.",);
    }
    return session.browser;
}

// Ensure browser context exists.
function requireContext(session: BrowserSessionContext,) {
    if (!session.context) {
        throw new Error("Browser context has not been created.",);
    }
    return session.context;
}

// Ensure active page exists.
function requirePage(session: BrowserSessionContext | ToolContext) {
    const sessionContext = "session" in session ? session.session : session;

    if (!sessionContext.page) {
        throw new Error("No active page.");
    }

    return sessionContext.page;
}

// Ensure locator exists.
function requireLocator(session: BrowserSessionContext, selector: string,): Locator {
    return requirePage(session).locator(selector);
}

// Execute tool action and handle errors.
async function executeTool(action: () => Promise<ToolResult>,): Promise<ToolResult> {
    try {
        return await action();
    } catch (error) {
        return failure(error instanceof Error ? error.message : "Unknown error",);
    }
}

// -----------------------------------------------------------------------------------------------------------------------------------------
//                                                       SCHEMAS
// -----------------------------------------------------------------------------------------------------------------------------------------

/* -------------------------------------------------------------------------- */
/*                               Base Schemas                                 */
/* -------------------------------------------------------------------------- */

const selectorSchema = z.object({

    selector: z.string().min(
        1,
        "Selector is required.",
    ),

});

type SelectorArgs = z.infer<typeof selectorSchema>;

const selectorTimeoutSchema = selectorSchema.extend({

    timeout: z.number()
        .int()
        .positive()
        .optional(),

});

type SelectorTimeoutArgs = z.infer<typeof selectorTimeoutSchema>;

const urlSchema = z.object({

    url: z.string().url(),

});

type UrlArgs = z.infer<typeof urlSchema>;

const timeoutSchema = z.object({

    timeout: z.number()
        .int()
        .positive(),

});

type TimeoutArgs = z.infer<typeof timeoutSchema>;

/* -------------------------------------------------------------------------- */
/*                              Navigation Schema                             */
/* -------------------------------------------------------------------------- */

const launchBrowserSchema = z.object({

    headless: z.boolean().optional(),

});

type LaunchBrowserArgs =
    z.infer<typeof launchBrowserSchema>;

const gotoSchema = z.object({

    url: z.string().url(),

    waitUntil: z.enum([
        "load",
        "domcontentloaded",
        "networkidle",
        "commit",
    ]).default("load"),

    timeout: z.number()
        .int()
        .positive()
        .optional(),

});

type GotoArgs = z.infer<typeof gotoSchema>;

const refreshSchema = z.object({});

type RefreshArgs =
    z.infer<typeof refreshSchema>;

const backSchema = z.object({});

type BackArgs =
    z.infer<typeof backSchema>;

const closeBrowserSchema = z.object({});

type CloseBrowserArgs =
    z.infer<typeof closeBrowserSchema>;

/* -------------------------------------------------------------------------- */
/*                              Interaction Schema                            */
/* -------------------------------------------------------------------------- */

const clickSchema = selectorSchema;

type ClickArgs =
    z.infer<typeof clickSchema>;

const typeSchema = selectorSchema.extend({

    text: z.string(),

    clear: z.boolean()
        .default(true),

});

type TypeArgs =
    z.infer<typeof typeSchema>;

const doubleClickSchema = selectorSchema;

type DoubleClickArgs = z.infer<typeof doubleClickSchema>;

const hoverSchema = selectorSchema;

type HoverArgs = z.infer<typeof hoverSchema>;

const pressKeySchema = z.object({

    key: z.string().min(1),

});

type PressKeyArgs = z.infer<typeof pressKeySchema>;

const selectOptionSchema = selectorSchema.extend({

    value: z.string(),

});

type SelectOptionArgs =
    z.infer<typeof selectOptionSchema>;

const checkSchema = selectorSchema;

type CheckArgs =
    z.infer<typeof checkSchema>;

const uncheckSchema = selectorSchema;

type UncheckArgs =
    z.infer<typeof uncheckSchema>;    

/* -------------------------------------------------------------------------- */
/*                                Waiting Schema                              */
/* -------------------------------------------------------------------------- */

const waitSchema = timeoutSchema;

type WaitArgs =
    z.infer<typeof waitSchema>;

const waitVisibleSchema =
    selectorTimeoutSchema;

type WaitVisibleArgs =
    z.infer<typeof waitVisibleSchema>;

const waitLoadSchema = z.object({

    state: z.enum([
        "load",
        "domcontentloaded",
        "networkidle",
    ]).default("load"),

});

type WaitLoadArgs =
    z.infer<typeof waitLoadSchema>;

const waitHiddenSchema =
    selectorTimeoutSchema;

type WaitHiddenArgs =
    z.infer<typeof waitHiddenSchema>;

/* -------------------------------------------------------------------------- */
/*                                Getter Schema                               */
/* -------------------------------------------------------------------------- */

const getTextSchema = selectorSchema;

type GetTextArgs =
    z.infer<typeof getTextSchema>;

const getValueSchema = selectorSchema;

type GetValueArgs =
    z.infer<typeof getValueSchema>;

const getAttributeSchema = selectorSchema.extend({

    name: z.string(),

});

type GetAttributeArgs =
    z.infer<typeof getAttributeSchema>;

const getUrlSchema = z.object({});

type GetUrlArgs =
    z.infer<typeof getUrlSchema>;

const getTitleSchema = z.object({});

type GetTitleArgs =
    z.infer<typeof getTitleSchema>;

const getCountSchema =
    selectorSchema;

type GetCountArgs =
    z.infer<typeof getCountSchema>;

const getHtmlSchema =
    selectorSchema;

type GetHtmlArgs =
    z.infer<typeof getHtmlSchema>;

/* -------------------------------------------------------------------------- */
/*                              Validation Schema                             */
/* -------------------------------------------------------------------------- */

const verifyVisibleSchema =
    selectorSchema;

type VerifyVisibleArgs =
    z.infer<typeof verifyVisibleSchema>;

const verifyEnabledSchema =
    selectorSchema;

type VerifyEnabledArgs =
    z.infer<typeof verifyEnabledSchema>;

const verifyCheckedSchema =
    selectorSchema;

type VerifyCheckedArgs =
    z.infer<typeof verifyCheckedSchema>;

const verifyTextSchema = z.preprocess((value) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const record = value as Record<string, unknown>;
        if (record.expected === undefined && typeof record.text === "string") {
            return { ...record, expected: record.text };
        }
    }
    return value;
}, selectorSchema.extend({
    expected: z.string(),
}));

type VerifyTextArgs =
    z.infer<typeof verifyTextSchema>;

const verifyUrlSchema = z.preprocess((value) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const record = value as Record<string, unknown>;
        if (record.expected === undefined && typeof record.url === "string") {
            return { ...record, expected: record.url };
        }
    }
    return value;
}, z.object({
    expected: z.string(),
}));

type VerifyUrlArgs =
    z.infer<typeof verifyUrlSchema>;

const verifyHiddenSchema = selectorSchema;

type VerifyHiddenArgs =
    z.infer<typeof verifyHiddenSchema>;

const verifyDisabledSchema = selectorSchema;

type VerifyDisabledArgs =
    z.infer<typeof verifyDisabledSchema>;

const verifyValueSchema = z.preprocess((value) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const record = value as Record<string, unknown>;
        if (record.expected === undefined && typeof record.value === "string") {
            return { ...record, expected: record.value };
        }
    }
    return value;
}, selectorSchema.extend({
    expected: z.string(),
}));

type VerifyValueArgs =
    z.infer<typeof verifyValueSchema>;

const verifyCountSchema = z.preprocess((value) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const record = value as Record<string, unknown>;
        if (record.expected === undefined && typeof record.count === "number") {
            return { ...record, expected: record.count };
        }
    }
    return value;
}, selectorSchema.extend({
    expected: z.number()
        .int()
        .min(0),
}));

type VerifyCountArgs =
    z.infer<typeof verifyCountSchema>;

const verifyTitleSchema = z.preprocess((value) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const record = value as Record<string, unknown>;
        if (record.expected === undefined && typeof record.title === "string") {
            return { ...record, expected: record.title };
        }
    }
    return value;
}, z.object({
    expected: z.string(),
}));

type VerifyTitleArgs =
    z.infer<typeof verifyTitleSchema>;

const verifyAttributeSchema = z.preprocess((value) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const record = value as Record<string, unknown>;
        if (record.expected === undefined && typeof record.value === "string") {
            return { ...record, expected: record.value };
        }
    }
    return value;
}, selectorSchema.extend({
    name: z.string(),
    expected: z.string(),
}));

type VerifyAttributeArgs =
    z.infer<typeof verifyAttributeSchema>;    

/* -------------------------------------------------------------------------- */
/*                               Advanced Schema                              */
/* -------------------------------------------------------------------------- */

const scrollSchema = selectorSchema.optional();

type ScrollArgs =
    z.infer<typeof scrollSchema>;

const uploadSchema = selectorSchema.extend({

    filePath: z.string(),

});

type UploadArgs =
    z.infer<typeof uploadSchema>;

const dragDropSchema = z.object({

    source: z.string(),

    target: z.string(),

});

type DragDropArgs =
    z.infer<typeof dragDropSchema>;

// ----------------------------------------------------------------------------------------------------------------------------------------
//                                                        CORE TOOLS
// ----------------------------------------------------------------------------------------------------------------------------------------

/* -------------------------------------------------------------------------- */
/*                           Launch Browser Tool                              */
/* -------------------------------------------------------------------------- */

export const launchBrowserTool: ToolDefinition<LaunchBrowserArgs> = {

    name: "launch_browser",

    description:
        "Launch a new Playwright browser session.",

    schema: launchBrowserSchema,

    execute: async ({args}) => {      
        await BrowserSession.launch({
            headless: args.headless ?? RuntimeConfig.headless,
        });
        return success(
            "Browser launched successfully.",
        );
    }

};

/* -------------------------------------------------------------------------- */
/*                            Close Browser Tool                              */
/* -------------------------------------------------------------------------- */

export const closeBrowserTool: ToolDefinition<CloseBrowserArgs> = {

    name: "close_browser",

    description:
        "Close the current Playwright browser session.",

    schema: closeBrowserSchema,

    execute: async ({args}) => {
            await BrowserSession.close();
            return success(
                "Browser closed successfully.",
            );
    }

};

/* -------------------------------------------------------------------------- */
/*                            Navigation Tools                                */
/* -------------------------------------------------------------------------- */

export const gotoTool: ToolDefinition<GotoArgs> = {
    
    name: "goto",

    description:
        "Navigate the current page to the specified URL.",

    schema: gotoSchema,

    execute: async (ctx) => {
            const { session, args } = ctx;
            const page = requirePage(session);
            await page.goto(args.url, {
                waitUntil: args.waitUntil,
                timeout: args.timeout,
            });
            return success(`Navigated to '${args.url}'.`);
        }   

};

export const refreshTool: ToolDefinition<RefreshArgs> = {

    name: "refresh",

    description:
        "Reload the current page.",

    schema: refreshSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
        const page = requirePage(session);
            await page.reload({waitUntil: "load",});
            return success(
                "Page refreshed successfully.",
            );
    }    

};

export const backTool: ToolDefinition<BackArgs> = {

    name: "back",

    description:
        "Navigate back to the previous page.",

    schema: backSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const page = requirePage(session);
            await page.goBack({waitUntil: "load",});
            return success(
                "Navigated back successfully.",
            );
        }       

};

/* -------------------------------------------------------------------------- */
/*                           Interaction Tools                                */
/* -------------------------------------------------------------------------- */

export const clickTool: ToolDefinition<ClickArgs> = {

    name: "click",

    description:
        "Click an element.",

    schema: clickSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const page = requirePage(session);
            await page.locator(args.selector).click();
            return success(
                `Clicked '${args.selector}'.`,
            );
        }

};

export const doubleClickTool: ToolDefinition<DoubleClickArgs> = {

    name: "double_click",

    description:
        "Double click an element.",

    schema: doubleClickSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const page = requirePage(session);
            await page.locator(args.selector).dblclick();
            return success(
                `Double clicked '${args.selector}'.`,
            );        
    }


};

export const hoverTool: ToolDefinition<HoverArgs> = {

    name: "hover",

    description:
        "Hover over an element.",

    schema: hoverSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const page = requirePage(session);
            await page.locator(args.selector).hover();
            return success(
                `Hovered '${args.selector}'.`,
            );        
    }


};

export const typeTool: ToolDefinition<TypeArgs> = {

    name: "type",

    description:
        "Fill text into an input element.",

    schema: typeSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const page = requirePage(session);
            const locator = page.locator(
                args.selector,
            );
            if (args.clear) {
                await locator.clear();
            }
            await locator.fill(
                args.text,
            );
            return success(
                `Filled '${args.selector}'.`,
            );
    }


};

export const pressKeyTool: ToolDefinition<PressKeyArgs> = {

    name: "press_key",

    description:
        "Press a keyboard key.",

    schema: pressKeySchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const page = requirePage(session);
            await page.keyboard.press(
                args.key,
            );
            return success(
                `Pressed '${args.key}'.`,
            );        
    }


};

export const selectOptionTool: ToolDefinition<SelectOptionArgs> = {

    name: "select_option",

    description:
        "Select option from dropdown.",

    schema: selectOptionSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const page = requirePage(session);
            await page.locator(
                args.selector,
            ).selectOption(
                args.value,
            );
            return success(
                `Selected '${args.value}'.`,
            );
    }


};

export const checkTool: ToolDefinition<CheckArgs> = {

    name: "check",

    description:
        "Check a checkbox.",

    schema: checkSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const page = requirePage(session);
            await page.locator(
                args.selector,
            ).check();
            return success(
                `Checked '${args.selector}'.`,
            );
    }


};

export const uncheckTool: ToolDefinition<UncheckArgs> = {

    name: "uncheck",

    description:
        "Uncheck a checkbox.",

    schema: uncheckSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const page = requirePage(session);
            await page.locator(
                args.selector,
            ).uncheck();
            return success(
                `Unchecked '${args.selector}'.`,
            );
    }


};

/* -------------------------------------------------------------------------- */
/*                              Waiting Tools                                 */
/* -------------------------------------------------------------------------- */

export const waitTool: ToolDefinition<WaitArgs> = {

    name: "wait",

    description:
        "Wait for a specified amount of time.",

    schema: waitSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            await new Promise<void>((resolve) =>
                setTimeout(resolve, args.timeout),
            );
            return success(
                `Waited ${args.timeout} ms.`,
            );
    }


};

export const waitVisibleTool: ToolDefinition<WaitVisibleArgs> = {

    name: "wait_visible",

    description:
        "Wait until an element becomes visible.",

    schema: waitVisibleSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const locator = requireLocator(
                session,
                args.selector,
            );
            await locator.waitFor({
                state: "visible",
                timeout: args.timeout,
            });
            return success(
                `Element '${args.selector}' is visible.`,
            );

    }


};

export const waitHiddenTool: ToolDefinition<WaitHiddenArgs> = {

    name: "wait_hidden",

    description:
        "Wait until an element becomes hidden.",

    schema: waitHiddenSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const locator = requireLocator(
                session,
                args.selector,
            );
            await locator.waitFor({
                state: "hidden",
                timeout: args.timeout,
            });
            return success(
                `Element '${args.selector}' is hidden.`,
            );
    }


};

export const waitLoadTool: ToolDefinition<WaitLoadArgs> = {

    name: "wait_load",

    description:
        "Wait until the page reaches the specified load state.",

    schema: waitLoadSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const page = requirePage(session);
            await page.waitForLoadState(
                args.state,
            );
            return success(
                `Page reached '${args.state}' state.`,
            );
    }


};

/* -------------------------------------------------------------------------- */
/*                               Getter Tools                                 */
/* -------------------------------------------------------------------------- */

export const getTextTool: ToolDefinition<GetTextArgs> = {

    name: "get_text",

    description:
        "Get text content of an element.",

    schema: getTextSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const locator = requireLocator(
                session,
                args.selector,
            );
            const text =
                await locator.textContent();
            return success(
                "Text retrieved successfully.",
                {
                    text,
                },
            );

    }


};

export const getValueTool: ToolDefinition<GetValueArgs> = {

    name: "get_value",

    description:
        "Get input value.",

    schema: getValueSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const locator = requireLocator(
                session,
                args.selector,
            );
            const value =
                await locator.inputValue();
            return success(
                "Value retrieved successfully.",
                {
                    value,
                },
            );
    }


};

export const getAttributeTool: ToolDefinition<GetAttributeArgs> = {

    name: "get_attribute",

    description:
        "Get element attribute.",

    schema: getAttributeSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const locator = requireLocator(
                session,
                args.selector,
            );
            const value =
                await locator.getAttribute(
                    args.name,
                );
            return success(
                "Attribute retrieved successfully.",
                {
                    attribute: args.name,
                    value,
                },
            );

    }


};

export const getUrlTool: ToolDefinition<GetUrlArgs> = {

    name: "get_url",

    description:
        "Get current page URL.",

    schema: getUrlSchema,

    execute: async (session) =>

        executeTool(async () => {

            const page =
                requirePage(session);

            return success(
                "URL retrieved successfully.",
                {
                    url: page.url(),
                },
            );

        }),

};

export const getTitleTool: ToolDefinition<GetTitleArgs> = {

    name: "get_title",

    description:
        "Get current page title.",

    schema: getTitleSchema,

    execute: async (session) =>

        executeTool(async () => {

            const page =
                requirePage(session);

            const title =
                await page.title();

            return success(
                "Title retrieved successfully.",
                {
                    title,
                },
            );

        }),

};

export const getCountTool: ToolDefinition<GetCountArgs> = {

    name: "get_count",

    description:
        "Count matching elements.",

    schema: getCountSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const locator =
                requireLocator(
                    session,
                    args.selector,
                );
            const count =
                await locator.count();
            return success(
                "Count retrieved successfully.",
                {
                    count,
                },
            );

    }


};

export const getHtmlTool: ToolDefinition<GetHtmlArgs> = {

    name: "get_html",

    description:
        "Get element HTML.",

    schema: getHtmlSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const locator =
                requireLocator(
                    session,
                    args.selector,
                );
            const html =
                await locator.innerHTML();
            return success(
                "HTML retrieved successfully.",
                {
                    html,
                },
            );

    }


};

/* -------------------------------------------------------------------------- */
/*                           Validation Tools                                 */
/* -------------------------------------------------------------------------- */

export const verifyVisibleTool: ToolDefinition<VerifyVisibleArgs> = {

    name: "verify_visible",

    description: "Verify element is visible.",

    schema: verifyVisibleSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            await expect(
                requireLocator(session, args.selector),
            ).toBeVisible();
            return success("Element is visible.");
    }

};

export const verifyHiddenTool: ToolDefinition<VerifyHiddenArgs> = {

    name: "verify_hidden",

    description: "Verify element is hidden.",

    schema: verifyHiddenSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            await expect(
                requireLocator(session, args.selector),
            ).toBeHidden();
            return success("Element is hidden.");
    }

};

export const verifyEnabledTool: ToolDefinition<VerifyEnabledArgs> = {

    name: "verify_enabled",

    description: "Verify element is enabled.",

    schema: verifyEnabledSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            await expect(
                requireLocator(session, args.selector),
            ).toBeEnabled();
            return success("Element is enabled.");

    }

};

export const verifyDisabledTool: ToolDefinition<VerifyDisabledArgs> = {

    name: "verify_disabled",

    description: "Verify element is disabled.",

    schema: verifyDisabledSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            await expect(
                requireLocator(session, args.selector),
            ).toBeDisabled();
            return success("Element is disabled.");
    }

};

export const verifyCheckedTool: ToolDefinition<VerifyCheckedArgs> = {

    name: "verify_checked",

    description: "Verify checkbox is checked.",

    schema: verifyCheckedSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            await expect(
                requireLocator(session, args.selector),
            ).toBeChecked();
            return success("Checkbox is checked.");
    }

};

export const verifyTextTool: ToolDefinition<VerifyTextArgs> = {

    name: "verify_text",

    description: "Verify element text.",

    schema: verifyTextSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            await expect(
                requireLocator(session, args.selector),
            ).toContainText(args.expected);
            return success("Text verified.");

    }

};

export const verifyValueTool: ToolDefinition<VerifyValueArgs> = {

    name: "verify_value",

    description: "Verify input value.",

    schema: verifyValueSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            await expect(
                requireLocator(session, args.selector),
            ).toHaveValue(args.expected);
            return success("Value verified.");
    }

};

export const verifyUrlTool: ToolDefinition<VerifyUrlArgs> = {

    name: "verify_url",

    description: "Verify current URL.",

    schema: verifyUrlSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            await expect(
                requirePage(session),
            ).toHaveURL(args.expected);
            return success("URL verified.");
    }

};

export const verifyTitleTool: ToolDefinition<VerifyTitleArgs> = {

    name: "verify_title",

    description: "Verify page title.",

    schema: verifyTitleSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            await expect(
                requirePage(session),
            ).toHaveTitle(args.expected);
            return success("Title verified.");

    }

};

export const verifyCountTool: ToolDefinition<VerifyCountArgs> = {

    name: "verify_count",

    description: "Verify element count.",

    schema: verifyCountSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            await expect(
                requireLocator(session, args.selector),
            ).toHaveCount(args.expected);
            return success("Count verified.");

    }

};

export const verifyAttributeTool: ToolDefinition<VerifyAttributeArgs> = {

    name: "verify_attribute",

    description: "Verify attribute value.",

    schema: verifyAttributeSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            await expect(
                requireLocator(session, args.selector),
            ).toHaveAttribute(
                args.name,
                args.expected,
            );
            return success("Attribute verified.");

    }

};

/* -------------------------------------------------------------------------- */
/*                             Advanced Tools                                 */
/* -------------------------------------------------------------------------- */

export const scrollTool: ToolDefinition<ScrollArgs> = {

    name: "scroll",

    description:
        "Scroll to an element or to the bottom of the page.",

    schema: scrollSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const page = requirePage(session);
            if (args?.selector) {
                await requireLocator(
                    session,
                    args.selector,
                ).scrollIntoViewIfNeeded();
                return success(
                    `Scrolled to '${args.selector}'.`,
                );
            }
            await page.evaluate(() => {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                });
            });
            return success(
                "Scrolled to bottom of page.",
            );

    }



};

export const uploadTool: ToolDefinition<UploadArgs> = {

    name: "upload",

    description:
        "Upload file to an input element.",

    schema: uploadSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            await requireLocator(
                session,
                args.selector,
            ).setInputFiles(
                args.filePath,
            );
            return success(
                `Uploaded '${args.filePath}'.`,
            );
    }

};

export const dragDropTool: ToolDefinition<DragDropArgs> = {

    name: "drag_drop",

    description:
        "Drag one element onto another.",

    schema: dragDropSchema,

    execute: async (ctx) => {
        const {session, args} = ctx;
            const page = requirePage(session);
            await page.dragAndDrop(
                args.source,
                args.target,
            );
            return success(
                "Drag and drop completed.",
            );

    }

};

/* -------------------------------------------------------------------------- */
/*                              Export Tools                                  */
/* -------------------------------------------------------------------------- */

export const tools: ToolDefinition[] = [

    // Core
    launchBrowserTool,
    closeBrowserTool,

    // Navigation
    gotoTool,
    refreshTool,
    backTool,

    // Interaction
    clickTool,
    doubleClickTool,
    hoverTool,
    typeTool,
    pressKeyTool,
    selectOptionTool,
    checkTool,
    uncheckTool,

    // Waiting
    waitTool,
    waitVisibleTool,
    waitHiddenTool,
    waitLoadTool,

    // Getter
    getTextTool,
    getValueTool,
    getAttributeTool,
    getUrlTool,
    getTitleTool,
    getCountTool,
    getHtmlTool,

    // Validation
    verifyVisibleTool,
    verifyHiddenTool,
    verifyEnabledTool,
    verifyDisabledTool,
    verifyCheckedTool,
    verifyTextTool,
    verifyValueTool,
    verifyUrlTool,
    verifyTitleTool,
    verifyCountTool,
    verifyAttributeTool,

    // Advanced
    scrollTool,
    uploadTool,
    dragDropTool,

];