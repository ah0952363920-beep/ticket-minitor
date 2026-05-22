const { chromium } = require('playwright');

const URL =
  'https://guardians.fami.life/UTK0204_?PERFORMANCE_ID=P197DSBD&PRODUCT_ID=P15UU08Q';

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  console.log('前往頁面...');

  await page.goto(URL, {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // 等待票區表格
  await page.waitForTimeout(5000);

  // 截圖
  await page.screenshot({
    path: 'screenshot.png',
    fullPage: true
  });

  // 取得頁面文字
  const content = await page.locator('body').innerText();

  console.log(content);

  // ====== 關鍵字判斷 ======
  const soldOutKeywords = [
    '已售完',
    '暫無票券',
    '無可售票券'
  ];

  const hasSoldOutKeyword = soldOutKeywords.some(k =>
    content.includes(k)
  );

  // 偵測可能有票的字樣
  const possibleTicketKeywords = [
    '空位',
    '剩餘',
    '可售',
    '立即購票'
  ];

  const hasTicketKeyword = possibleTicketKeywords.some(k =>
    content.includes(k)
  );

  const hasTicket =
    !hasSoldOutKeyword && hasTicketKeyword;

  console.log('是否可能有票：', hasTicket);

  if (hasTicket) {
    console.log('🎫 發現可能釋票！');

    if (process.env.DISCORD_WEBHOOK) {
      await fetch(process.env.DISCORD_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content:
            `🎫 富邦悍將可能釋票！\n${URL}`
        })
      });
    }
  }

  await browser.close();
})();
