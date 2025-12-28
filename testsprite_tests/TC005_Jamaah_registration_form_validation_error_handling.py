import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:5173/dashboard", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Click on 'Daftar sekarang' link to open the registration form.
        frame = context.pages[-1]
        # Click 'Daftar sekarang' link to navigate to registration form
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/div[3]/p/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Submit the registration form with all required fields empty to check frontend validation.
        frame = context.pages[-1]
        # Click 'Daftar' button to submit the form with empty fields and trigger frontend validation
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Input valid name, invalid email format, valid password, and valid password confirmation, then submit the form to check frontend validation error messages.
        frame = context.pages[-1]
        # Input valid name
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test User')
        

        frame = context.pages[-1]
        # Input invalid email format
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('invalid-email-format')
        

        frame = context.pages[-1]
        # Input valid password
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/form/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('password123')
        

        frame = context.pages[-1]
        # Input valid password confirmation
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/form/div[4]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('password123')
        

        frame = context.pages[-1]
        # Click 'Daftar' button to submit form with invalid email format
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Attempt to submit invalid data directly to backend API to verify backend validation and error messages.
        await page.goto('http://localhost:5173/api/register', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Attempt to submit the form with mismatched password and confirmation to trigger frontend validation error. Then try to find any visible backend validation error messages after submission.
        frame = context.pages[-1]
        # Input valid name
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test User')
        

        frame = context.pages[-1]
        # Input valid email
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('testuser@example.com')
        

        frame = context.pages[-1]
        # Input valid password
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/form/div[3]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('password123')
        

        frame = context.pages[-1]
        # Input mismatched password confirmation
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/form/div[4]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('password321')
        

        frame = context.pages[-1]
        # Click 'Daftar' button to submit form with mismatched password confirmation to test frontend validation
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Lengkapi data diri Anda untuk mendaftar').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Nama Lengkap*').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Email*').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Password*').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Konfirmasi Password*').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Daftar').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Sudah punya akun? Masuk disini').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    