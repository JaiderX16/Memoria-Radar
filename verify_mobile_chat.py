from playwright.sync_api import sync_playwright, expect

def verify_mobile_chat(page):
    # 1. Arrange: Set viewport to mobile size and go to the app
    page.set_viewport_size({"width": 375, "height": 667})
    page.goto("http://localhost:5173")

    # 2. Act: Find the "Abrir Chat" button and click it
    # The button is inside a ControlButton, which has an aria-label
    chat_button = page.get_by_role("button", name="Abrir Chat")

    # Wait for the button to be visible
    expect(chat_button).to_be_visible(timeout=10000)
    chat_button.click()

    # 3. Assert: Verify the chat interface is visible
    # The chat container in MiaMobile.jsx has text "¡Hola! Soy MIA..."
    expect(page.get_by_text("¡Hola! Soy MIA")).to_be_visible()

    # 4. Verify input focus behavior
    # Find the input field
    chat_input = page.get_by_placeholder("Escribe un mensaje...")
    expect(chat_input).to_be_visible()

    # Focus the input
    chat_input.click()

    # We can't easily check for backdrop blur removal via standard locators,
    # but we can take a screenshot and visually verify.
    # Also we can check computed style for 'backdrop-filter' if we wanted to be fancy,
    # but the instructions ask for a screenshot.

    # 5. Screenshot
    page.screenshot(path="/home/jules/verification/mobile_chat_verification.png")
    print("Screenshot saved to /home/jules/verification/mobile_chat_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_mobile_chat(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
