import requests
from playwright.sync_api import sync_playwright
import os

URL = "https://guardians.fami.life/UTK0204_?PERFORMANCE_ID=P197DSBD&PRODUCT_ID=P15UU08Q"

DISCORD_WEBHOOK = os.environ["DISCORD_WEBHOOK"]

TARGET_AREAS = [
    "搖滾熱力區",
    "應援熱力區"
]

def send_discord(msg):
    requests.post(DISCORD_WEBHOOK, json={
        "content": msg
    })

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=[
            "--disable-blink-features=AutomationControlled"
        ]
    )

    page = browser.new_page()

    page.goto(URL, wait_until="networkidle", timeout=120000)

    content = page.content()

    found = []

    for area in TARGET_AREAS:
        if area in content:
            # 找區域附近文字
            idx = content.find(area)
            nearby = content[idx:idx+500]

            if "已售完" not in nearby:
                found.append(area)

    if found:
        message = "🔥 發現釋票！\n\n"

        for f in found:
            message += f"✅ {f}\n"

        message += f"\n購票連結：\n{URL}"

        send_discord(message)

    browser.close()
