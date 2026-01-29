from playwright.sync_api import sync_playwright

def verify_mobile_chat():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        # Use iPhone 12 context to simulate mobile
        device = p.devices['iPhone 12']
        context = browser.new_context(**device)
        page = context.new_page()

        # Capture console logs
        logs = []
        page.on("console", lambda msg: logs.append(msg.text))

        print("Navigating to localhost...")
        # Go to localhost
        page.goto("http://localhost:5173")

        # Wait for load
        print("Waiting for page load...")
        page.wait_for_load_state("networkidle")

        # Take screenshot of home
        page.screenshot(path="/home/jules/verification/mobile_home.png")
        print("Home screenshot taken.")

        # Find the chat trigger/button and click it
        print("Looking for chat button...")
        try:
            chat_btn = page.get_by_label("Abrir Chat")
            chat_btn.wait_for(state="visible", timeout=5000)
            chat_btn.click()
            print("Chat button clicked.")
        except Exception as e:
            print(f"Error finding/clicking chat button: {e}")
            print(f"Logs: {logs}")
            browser.close()
            return

        # Wait for chat to open. MiaMobile should be visible.
        # It renders text "Hola! Soy MIA..."
        try:
            print("Waiting for chat message...")
            page.get_by_text("Soy MIA").wait_for(state="visible", timeout=5000)
            print("Chat is visible.")

            # Take screenshot of open chat
            page.screenshot(path="/home/jules/verification/mobile_chat_open.png")
            print("Chat screenshot taken.")

            # Check for old logs
            old_log_found = any("Keyboard Detection" in log for log in logs)
            if old_log_found:
                print("FAILURE: Old keyboard detection logs found!")
            else:
                print("SUCCESS: No old keyboard detection logs found.")

            # Simulate input focus (to check full state logic)
            print("Simulating input focus...")
            page.get_by_placeholder("Escribe un mensaje...").click()
            # We can't verify layout shift easily without keyboard, but we can verify no crash.
            page.wait_for_timeout(1000)
            page.screenshot(path="/home/jules/verification/mobile_chat_focused.png")

        except Exception as e:
            print(f"Error verifying chat: {e}")
            print(f"Logs: {logs}")

        browser.close()

if __name__ == "__main__":
    verify_mobile_chat()
