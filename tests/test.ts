import { test, expect } from "@playwright/test"
test.beforeEach(async ({ page }) => {
    const app_url = process.env.APP_URL || '';
    await page.goto(app_url);
});

test.describe('check UI parts', () => {


    test('check that button is dispalyed on the page', async ({ page }) => {
        const buttonElem = await page.locator("[id='call-form-button']");
        await expect(buttonElem).toBeVisible();
    })

    test("check if the form popup opens when clicked", async ({ page }) => {
        await page.locator("[id='call-form-button']").click();

        const popupWindow = await page.locator("#call-form");
        await expect(popupWindow).toBeVisible();
    })

    test('check that form has all fields and right options', async ({ page }) => {
        await page.locator("[id='call-form-button']").click();

        // object key - selector, value - inner Text
        const labelsId = {
            "call-type-label": "Call Type",
            "phone-number-label": "Phone Number",
            "call-result-label": "Call Result",
        }
        const labelsIdVary = {
            "call-reason-label": "Call Reason",
            "result-type-label": "Result Type"
        }
        // check that all fields is available
        for (const [key, value] of Object.entries(labelsId)) {
            await expect(await page.locator(`#${key}`)).toBeVisible();
            await expect(await page.locator(`#${key}`)).toHaveText(value);
        }

        // check that select has right options 
        await page.locator(`//label[@id="${Object.keys(labelsId)[0]}"]/..`).click();
        await expect(page.locator(`//ul[@aria-labelledby="${Object.keys(labelsId)[0]}"]`)).toBeVisible();
        const incomingCall = await page.locator('//li[@data-value="Incoming Call"]');
        await expect(incomingCall).toBeVisible();
        await incomingCall.click();

        await page.locator(`//label[@id="${Object.keys(labelsId)[1]}"]/..`).click();
        await expect(page.locator(`//ul[@aria-labelledby="${Object.keys(labelsId)[1]}"]`)).toBeVisible();
        await page.locator('//li[@id="phone-number-option-0"]').click();

        await page.locator(`//label[@id="${Object.keys(labelsIdVary)[0]}"]/..`).click();
        await expect(page.locator(`//ul[@aria-labelledby="${Object.keys(labelsIdVary)[0]}"]`)).toBeVisible();
    })
})

test.describe("positive test cases", () => {

    test("choose incoming call and check that new field appears", async ({ page }) => {
        await page.locator("[id='call-form-button']").click();
        await expect(await page.locator("#call-form")).toBeVisible();

        // select first field
        await page.locator(`//label[@id="call-type-label"]/..`).click();
        const incomingCall = await page.locator('//li[@data-value="Incoming Call"]');
        await expect(incomingCall).toBeVisible();
        await incomingCall.click();

        // select second field
        await page.locator(`//label[@id="phone-number-label"]/..`).click();
        await page.locator('//li[@id="phone-number-option-0"]').click();

        //select third filed
        const callReasonField = await page.locator("#call-reason");
        await expect(callReasonField).toBeVisible();
        await callReasonField.click();

        const arrayOfCallReasosns = ["Email", "SMS", "Missed Call"];
        const listOfCallReasonXPath = '//ul[@aria-labelledby="call-reason-label"]';
        await (await page.locator(listOfCallReasonXPath)).evaluateAll(list => list.map(
            async (element, i) => await expect(element.textContent).toEqual(arrayOfCallReasosns[i])));

        await page.locator(listOfCallReasonXPath + '/*[1]').click();
        await expect(callReasonField).toHaveText("Email");

        // fill text area 

        const textArea = await page.locator("#call-result");
        await textArea.click();
        await textArea.fill("Something");

        // submit form 
        await page.locator("#form-save").click();
    })

    test("choose outgoing call and check that new field appears", async ({ page }) => {
        await page.locator("[id='call-form-button']").click();
        await expect(await page.locator("#call-form")).toBeVisible();

        // select first field
        await page.locator(`//label[@id="call-type-label"]/..`).click();
        const incomingCall = await page.locator('//li[@data-value="Outgoing Call"]');
        await expect(incomingCall).toBeVisible();
        await incomingCall.click();

        // select second field
        await page.locator(`//label[@id="phone-number-label"]/..`).click();
        await page.locator('//li[@id="phone-number-option-0"]').click();

        //select third filed
        const resaulTypeField = await page.locator("#result-type");
        await expect(resaulTypeField).toBeVisible();
        await resaulTypeField.click();

        const listOfReasultTypeXPath = '//ul[@aria-labelledby="result-type-label"]';
        const arrayofReasultType = ["Not available", "Wrong Person", "Busy", "Successful"];

        await (await page.locator(listOfReasultTypeXPath)).evaluateAll(list => list.map(
            async (element, i) => await expect(element.textContent).toEqual(arrayofReasultType[i])));

        await expect(await page.locator(listOfReasultTypeXPath)).toBeVisible();
        await page.locator(listOfReasultTypeXPath + '/*[1]').click();
        await expect(resaulTypeField).toHaveText("Not available");

        // fill text area 

        const textArea = await page.locator("#call-result");
        await textArea.click();
        await textArea.fill("Something");

        // submit form 
        await page.locator("#form-save").click();
    })

})

test.describe("negative test cases", () => {

    test("try to send empty form", async ({ page }) => {
        await page.locator("[id='call-form-button']").click();

        await page.locator("#form-save").click();

        const errorMessageCallResult = await page.locator('#call-result-helper-text');
        const errorMessageCallType = await page.locator('//span[contains(@class, "validation-error")]');
        const errorMessagePhoneNumber = await page.locator('#phone-number-helper-text');
        await expect(errorMessageCallResult).toHaveText("Required");
        await expect(errorMessageCallType).toHaveText("Required");
        await expect(errorMessagePhoneNumber).toHaveText("Required");
    })

    test("try to submit form only with text area", async ({ page }) => {
        await page.locator("[id='call-form-button']").click();

        const textArea = await page.locator("#call-result");
        await textArea.click();
        await textArea.fill("Something");

        // submit form 
        await page.locator("#form-save").click();

        const errorMessageCallType = await page.locator('//span[contains(@class, "validation-error")]');
        const errorMessagePhoneNumber = await page.locator('#phone-number-helper-text');
        await expect(errorMessageCallType).toHaveText("Required");
        await expect(errorMessagePhoneNumber).toHaveText("Required");
    })

    test("try to submit form without call type", async ({ page }) => {
        await page.locator("[id='call-form-button']").click();

        //select second form
        await page.locator(`//label[@id="phone-number-label"]/..`).click();
        await page.locator('//li[@id="phone-number-option-0"]').click();

        const textArea = await page.locator("#call-result");
        await textArea.click();
        await textArea.fill("Something");
        // submit form 
        await page.locator("#form-save").click();

        const errorMessageCallType = await page.locator('//span[contains(@class, "validation-error")]');
        await expect(errorMessageCallType).toHaveText("Required");
    })

    test("try to submit form without call reason or result type", async ({ page }) => {
        await page.locator("[id='call-form-button']").click();

        // select first field
        await page.locator(`//label[@id="call-type-label"]/..`).click();
        const incomingCall = await page.locator('//li[@data-value="Incoming Call"]');
        await expect(incomingCall).toBeVisible();
        await incomingCall.click();

        // select second field
        await page.locator(`//label[@id="phone-number-label"]/..`).click();
        await page.locator('//li[@id="phone-number-option-0"]').click();

        const textArea = await page.locator("#call-result");
        await textArea.click();
        await textArea.fill("Something");
        // submit form 
        await page.locator("#form-save").click();

        const errorMessageCallReason = await page.locator('//span[contains(@class, "validation-error")]');
        await expect(errorMessageCallReason).toHaveText("Required");
    })
})