from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use iPhone 12 Pro dimensions
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1",
            is_mobile=True,
            has_touch=True
        )
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5173/")

        # Wait for map controls to appear
        print("Waiting for chat button...")
        # Look for the button with label 'Abrir Chat'
        chat_btn = page.get_by_role("button", name="Abrir Chat")
        expect(chat_btn).to_be_visible(timeout=10000)

        print("Clicking chat button...")
        chat_btn.click()

        # Wait for chat to open. MiaMobile should be visible.
        # It has text "¡Hola! Soy MIA"
        print("Waiting for chat message...")
        chat_message = page.get_by_text("¡Hola! Soy MIA")
        expect(chat_message).to_be_visible()

        print("Checking backdrop-filter...")
        # Check computed style
        blur = chat_message.evaluate("el => getComputedStyle(el).backdropFilter")
        print(f"Backdrop filter: {blur}")

        if blur and blur != 'none':
             print("WARNING: backdrop-filter detected!")
        else:
             print("SUCCESS: No backdrop-filter detected.")

        # Simulate drag
        # Find the handle or the top part of the chat.
        # <div className="w-full flex justify-center pt-6 pb-4 cursor-grab ...">
        # It has a child div w-16 h-1.5

        print("Simulating drag...")
        # Use a more specific selector if needed, or get by visual aspect?
        # The handle is the first child of the main fixed div?
        # The main fixed div has z-50 fixed bottom-0...
        # Let's target the cursor-grab class which is on the handle container.
        handle = page.locator(".cursor-grab")
        expect(handle).to_be_visible()

        # Get initial bounding box
        box = handle.bounding_box()
        if box:
            start_y = box['y'] + box['height'] / 2
            start_x = box['x'] + box['width'] / 2

            # Drag up
            page.mouse.move(start_x, start_y)
            page.mouse.down()
            page.mouse.move(start_x, start_y - 200, steps=10)

            # Check if it moved (via style height? or visually?)
            # Since we use direct DOM manipulation, verify style.height on the main container
            # Main container is the parent of the handle.
            container = handle.locator("..")
            height_style = container.get_attribute("style")
            print(f"Container style during drag: {height_style}")

            page.mouse.up()

            # Wait for snap
            page.wait_for_timeout(1000)
        else:
            print("Could not find handle bounding box")

        print("Taking screenshot...")
        page.screenshot(path="/home/jules/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run()
