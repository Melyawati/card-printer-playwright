import { test, expect, BrowserContext, type Page, Locator } from '@playwright/test';
import assert from 'assert';
import { chromium } from 'playwright';

const login = {
  login_id: 'admin',
  password: 'admin1234!'
}

const testCardPressoConfig = {
  id : 'ADMIN',
  password : 'admin',
  ipAddress : '127.0.0.1',
  port : '632',
  printerName : 'Microsoft Print to PDF',
  cardTemplates : ['department.card', 'example-two-side.card'],
  defaultCardTemplate: 0
}


test.describe('Card Printer', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://localhost/#/login');
        await page.locator("//input[@ng-model='user.id']").fill(login.login_id);
        await page.locator("//input[@ng-model='user.password']").fill(login.password);
        await page.click('.btnLogin'); 
    });
  test('Login to BioStar 2 and access Badge setting', async ({ page }) => {
    await page.locator('button:has-text("Settings")').click();
    await page.waitForTimeout(5000);
    const isCardPrinterBtnPresent = await page.locator('li.cardPrinter a').isVisible();
    expect(isCardPrinterBtnPresent, 'Card printer button should be available').toBeTruthy();                
    await page.locator('li.cardPrinter a:has-text("Card Printer")').click();
    await page.waitForTimeout(5000);
    let isTooltipPresent = await page.locator('[tooltip-class="customTooltip"]').isVisible();
    let comboboxElement = await page.locator("//div[@ng-model='testPrint.selectedCard']");
    let isCardComboboxDisabled = await comboboxElement.getAttribute('disabled');
    let btnTestPrintDisable = await page.locator('button.btnTestPrint');
    let isBtnTestPrintDisabled = await btnTestPrintDisable.getAttribute('disabled');
    let isApplyButtonPresent = await page.locator('button[ng-click="doApplyCardPressoSetting();"]').isVisible();
    let isCancelButtonPresent = await page.locator('button[ng-label="button.cancel"]').isVisible();
    
    const ipAddressElement = await page.$('input[model="cardPressoSetting.ipAddress"]');
    if (ipAddressElement) {
      const ipAddressAttributeValue = await ipAddressElement.getAttribute('value');
      if (ipAddressElement === null) {
        throw new Error('Element not found');
      }
    
      // Assert the attribute value
     expect(ipAddressAttributeValue).toBe(testCardPressoConfig.ipAddress);
    }
    const ipAddressPortElement = await page.$('input[model="cardPressoSetting.ipAddressPort"]');
    if (ipAddressPortElement) {
      const portAttributeValue = await ipAddressPortElement.getAttribute('value');
      if (ipAddressElement === null) {
        throw new Error('Element not found');
      }
    expect(portAttributeValue).toBe(testCardPressoConfig.port);
    }
    expect(isTooltipPresent, 'tooltip should present').toBeTruthy();
    expect(isCardComboboxDisabled).toBeTruthy();
    if (isCardComboboxDisabled) {
      console.log('combobox should be disabled');
    } else {
      console.error('Combobox is not disabled');
    }
    expect(isBtnTestPrintDisabled).toBeTruthy();

    
    if (isBtnTestPrintDisabled) {
      console.log('btn test print should be disabled');
    } else {
      console.error('btn test is not disabled.');
    }
    expect(isApplyButtonPresent, 'apply btn should present').toBeTruthy();
    expect(isCancelButtonPresent, 'cancel btn should present').toBeTruthy();
    await page.waitForTimeout(5000);
 
  });
  test('Verify Print Card button', async ({ page }) => {
    await page.locator('button:has-text("USER")').click();
    await page.locator('button:has-text("ADD USER")').click();
    let isBtnPrintCardHasNgHideClass = await page.locator('p[ng-show="isSetCardPressoSetting"].ng-hide').isVisible();
    expect(isBtnPrintCardHasNgHideClass, "btn print card should not found").toBeFalsy();
    await page.locator('[ng-click="cancelAddUser()"].btnBack').click();
    await page.locator('article.datagridTypeA .datagrid-btable > tbody > tr:nth-child(1)').click();
    let isBtnPrintCardHasNgHideClass2nd = await page.locator('p[ng-show="isSetCardPressoSetting"].ng-hide').isVisible();
    expect(isBtnPrintCardHasNgHideClass2nd, "btn print card should not found").toBeFalsy();

    await page.waitForTimeout(5000);
  });  

  
})

// test('get started link', async () => {
//   // const browser = await puppeteer.launch({ ignoreHTTPSErrors: true });
//   const browser: BrowserContext =  await chromium.launchPersistentContext('', {
//     channel: 'chrome',
//     headless: false,
//     ignoreHTTPSErrors: true
//     });

//   const page: Page = await browser.newPage();
//   await page.goto('https://localhost/#/login');
//   await page.locator("//input[@ng-model='user.id']").fill(login.login_id);
//   await page.locator("//input[@ng-model='user.password']").fill(login.password);

//   await page.click('.btnLogin'); 

//   await page.waitForTimeout(5000);


// });
