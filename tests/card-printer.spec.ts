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

async function assertTextMatch(page, selector, expectedValue) {
    const element = await page.$(selector);
    if (!element)
      throw new Error(`Element with selector "${selector}" not found.`);
    
    const attributeValue = await element.getAttribute('value');
    if (attributeValue !== null) {
      console.log(attributeValue);
      expect(attributeValue).toBe(expectedValue);
    } else {
      console.error('Attribute value is null.');
    }
}


test.describe('Card Printer', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://localhost/#/login');
        await page.locator("//input[@ng-model='user.id']").fill(login.login_id);
        await page.locator("//input[@ng-model='user.password']").fill(login.password);
        await page.click('.btnLogin'); 
    });
  test('1. Login to BioStar 2 and access Badge setting', async ({ page }) => {
    await page.locator('button:has-text("Settings")').click();
    await page.waitForTimeout(5000);
    const isCardPrinterBtnPresent = await page.locator('li.cardPrinter a').isVisible();
    expect(isCardPrinterBtnPresent, 'Card printer button should be available').toBeTruthy();                
    await page.locator('li.cardPrinter a:has-text("Card Printer")').click();
    await page.waitForTimeout(5000);
    let isTooltipPresent = await page.locator('[tooltip-class="customTooltip"]').isVisible();
    let comboboxElement =  page.locator("//div[@ng-model='testPrint.selectedCard']");
    let isCardComboboxDisabled = await comboboxElement.getAttribute('disabled');
    let btnTestPrintDisable = page.locator('button.btnTestPrint');
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
  test('2. Verify Print Card button', async ({ page }) => {
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
  test('3. Fill in Badge Setting', async ({ page }) => {
    const cardTemplateElem1 = '#cardTemplateTable tbody tr:nth-child(1) input[type="text"]';
    const cardTemplateElem2 = '#cardTemplateTable tbody tr:nth-child(2) input[type="text"]';
    const cardTemplatesTr = '#cardTemplateTable tbody tr';

    await page.locator('button:has-text("Settings")').click();              
    await page.locator('li.cardPrinter a:has-text("Card Printer")').click();
    await page.click('.ngbssToggleCheckBox .switch');
    let isCheckboxSelected = await page.locator('checkBoxValue').isVisible();
    expect(isCheckboxSelected, 'toggle should be use').toBeFalsy();
    let btnTestPrint = page.locator('button.btnTestPrint');
    let isBtnTestPrintDisabled = await btnTestPrint.getAttribute('disabled');
    expect(isBtnTestPrintDisabled).toBeFalsy();
    if (isBtnTestPrintDisabled) {
        console.log('bbtn test print should be enabled');
    } else {
        console.error('btn test is not enabled.');
    }

    await page.locator("//input[@data-ng-model='cardPressoSetting.cardpressoId']").fill(testCardPressoConfig.id);
    await page.locator("//input[@data-ng-model='cardPressoSetting.cardpressoPassword']").fill(testCardPressoConfig.password);
    await page.locator("//input[@data-ng-model='cardPressoSetting.printerName']").fill(testCardPressoConfig.printerName);
    const cardpressoIdElement = await page.$('input[model="cardPressoSetting.cardpressoId"]');
    if (cardpressoIdElement) {
      const cardpressoIdAttributeValue = await cardpressoIdElement.getAttribute('value');
      if (cardpressoIdElement === null) {
        throw new Error('Element not found');
      }
    
      // Assert the attribute value
     expect(cardpressoIdAttributeValue).toBe(testCardPressoConfig.id);
    }
    const cardpressoPasswordElement = await page.$('input[model="cardPressoSetting.password"]');
    if (cardpressoPasswordElement) {
        const CardpressoPasswordAttributeValue = await cardpressoPasswordElement.getAttribute('value');
        if (cardpressoPasswordElement === null) {
          throw new Error('Element not found');
        }
      
        // Assert the attribute value
       expect(CardpressoPasswordAttributeValue).toBe(testCardPressoConfig.password);
      }
      const printerNameElement = await page.$('input[model="cardPressoSetting.printName"]');
      if (printerNameElement) {
          const printerNameAttributeValue = await printerNameElement.getAttribute('value');
          if (printerNameElement === null) {
            throw new Error('Element not found');
          }
        
          // Assert the attribute value
         expect(printerNameAttributeValue).toBe(testCardPressoConfig.printerName);
        }

    let btnDelete = page.locator('.ibtnDelete');
    let btnDeleteCount = 0;
    await page.locator('.ibtnDelete').count().then(function(count) {
        btnDeleteCount = count;
    });
    for (let i = 0; i < btnDeleteCount; i++) {
        btnDelete.first().click();
    }
    await page.locator('[ng-click="doAddCardTemplate()"]').click();

    await page.locator(cardTemplateElem1).fill('C:\\Users\\Oddbit\\Documents\\My Cards\\abc');
    let isTemplateErrorPresent = page.locator('tooltip-box[name="cardTemplateAdd0"] [ng-label="validate.invalidCardPressoFilename"]').isVisible();
    expect(isTemplateErrorPresent, 'template should be present').toBeTruthy();

    await page.locator(cardTemplateElem1).fill('C:\\Users\\Oddbit\\Documents\\My Cards?\\example.card');
    isTemplateErrorPresent = page.locator('tooltip-box[name="cardTemplateAdd0"] [ng-label="validate.invalidCardPressoFilename"]').isVisible();
    expect(isTemplateErrorPresent, 'template should be present').toBeTruthy();

    await page.locator(cardTemplateElem1).fill('C:\\Users\\Oddbit\\Documents\\My Cards\\pdfcard.pdf');
    isTemplateErrorPresent = page.locator('tooltip-box[name="cardTemplateAdd0"] [ng-label="validate.invalidCardPressoFilename"]').isVisible();
    expect(isTemplateErrorPresent, 'template should be present').toBeTruthy();

    await page.locator(cardTemplateElem1).fill('C:\\Users\\Oddbit\\Documents\\My Cards\\numbers.xlsx');
    isTemplateErrorPresent = page.locator('tooltip-box[name="cardTemplateAdd0"] [ng-label="validate.invalidCardPressoFilename"]').isVisible();
    expect(isTemplateErrorPresent, 'template should be present').toBeTruthy();

    await page.locator(cardTemplateElem1).fill('C:\\Users\\Oddbit\\Documents\\My Cards\\dummy.jpg');
    isTemplateErrorPresent = page.locator('tooltip-box[name="cardTemplateAdd0"] [ng-label="validate.invalidCardPressoFilename"]').isVisible();
    expect(isTemplateErrorPresent, 'template should be present').toBeTruthy();

    await page.locator(cardTemplateElem1).fill('C:\\Users\\Oddbit\\Documents\\My Cards\\dummy.png');
    isTemplateErrorPresent = page.locator('tooltip-box[name="cardTemplateAdd0"] [ng-label="validate.invalidCardPressoFilename"]').isVisible();
    expect(isTemplateErrorPresent, 'template should be present').toBeTruthy();

    await page.locator(cardTemplateElem1).fill('C:\\Users\\Oddbit\\Documents\\My Cards\\dummycard.card');
    isTemplateErrorPresent = page.locator('tooltip-box[name="cardTemplateAdd0"] [ng-label="validate.invalidCardPressoFilename"]').isVisible();
    expect(isTemplateErrorPresent, 'template should not be present').toBeTruthy();

    let preparedCard1 = 'C:\\Users\\Oddbit\\Documents\\My Cards\\department.card';
    await page.locator(cardTemplateElem1).fill(preparedCard1);
    isTemplateErrorPresent = page.locator('tooltip-box[name="cardTemplateAdd0"] [ng-label="validate.invalidCardPressoFilename"]').isVisible();
    expect(isTemplateErrorPresent, 'template should not be present').toBeTruthy();

    let isTemplateInComboBox = false;
const listComboElements = await page.$$('.list-data-item');
const listComboData = await Promise.all(listComboElements.map(async (row) => {
    const valHandle = await row.evaluateHandle(row => row.textContent);
    const val = await valHandle.jsonValue();
    await valHandle.dispose();
    return val;
}));

    isTemplateInComboBox = listComboData.indexOf(preparedCard1) >= 0;
    expect(isTemplateInComboBox, 'template should be present in combobox').toBeFalsy();
    let isTemplateChecked = false;
    const templateElements = await page.$$(cardTemplatesTr);

    for (const element of templateElements) {
    const inputElement = await element.$('input[type="text"]');
    const elemText = await (inputElement ? inputElement.getAttribute('value') : null);

        if (elemText === preparedCard1) {
            const radioInput = await element.$('input[type="radio"]');
            const labelElement = await element.$('label');
            if (radioInput && labelElement) {
            await labelElement.click();
            isTemplateChecked = await radioInput.isChecked();
            } else {
            throw new Error('Radio input or label element not found');
            }
            expect(isTemplateChecked,'card template should be checked').toBeTruthy();
            break;
        }
    }
    page.locator('[ng-click="doAddCardTemplate()"]').click();

    let preparedCard2 = 'C:\\Users\\Oddbit\\Documents\\My Cards\\example-two-side.card';
    await page.locator(cardTemplateElem2).fill(preparedCard2);
    isTemplateErrorPresent = page.locator('tooltip-box[name="cardTemplateAdd1"] [ng-label="validate.invalidCardPressoFilename"]').isVisible();
    expect(isTemplateErrorPresent, 'template should not be present').toBeTruthy();

    let isTemplateInComboBox2 = false;
    let listComboData2 = await page.$$('.list-data-item');
    let comboListData2 = await Promise.all(listComboData2.map(async (row) => {
        const valHandle = await row.evaluateHandle(row => row.textContent);
        const val = await valHandle.jsonValue();
        await valHandle.dispose();
        return val;
    }));

    isTemplateInComboBox2 = comboListData2.indexOf(preparedCard2) >= 0;
    expect(isTemplateInComboBox2, 'template should be present in combobox').toBeFalsy();

    let isTemplateChecked2 = false;
    const templateElements2 = await page.$$(cardTemplatesTr);

    for (const element of templateElements2) {
    const inputElement = await element.$('input[type="text"]');
    const elemText = await (inputElement ? inputElement.getAttribute('value') : null);

        if (elemText === preparedCard2) {
            const radioInput = await element.$('input[type="radio"]');
            const labelElement = await element.$('label');
            if (radioInput && labelElement) {
            await labelElement.click();
            isTemplateChecked2 = await radioInput.isChecked();
            } else {
            throw new Error('Radio input or label element not found');
            }
            expect(isTemplateChecked2,'card template should not be checked').toBeFalsy();
            break;
        }
    }

    page.locator("//div[@ng-model='testPrint.selectedCard']").click();
    await page.click('div[ng-model="testPrint.selectedCard"] .scroll > .selectList > li:nth-child(1)');
    await page.waitForTimeout(5000);
    page.locator("//div[@ng-model='testPrint.selectedCard']").click();
    await page.click('div[ng-model="testPrint.selectedCard"] .scroll > .selectList > li:nth-child(2)');;
    await page.waitForTimeout(1000);

    page.locator('[ng-click="doApplyCardPressoSetting();"]').click();

    await page.waitForTimeout(5000);
  }); 
  test('4. Verify Print Card button', async ({ page }) => {
    await page.locator('button:has-text("USER")').click();
    await page.locator('button:has-text("ADD USER")').click();
    let isBtnPrintCardHasNgHideClass = await page.locator('p[ng-show="isSetCardPressoSetting"].ng-hide').isVisible();
    expect(isBtnPrintCardHasNgHideClass, "btn print card should found").toBeFalsy();
    
    page.locator('[ng-click="cancelAddUser()"].btnBack').click();
    await page.click('article.datagridTypeA .datagrid-btable > tbody > tr:nth-child(1)');

    let isBtnPrintCardHasNgHideClass2nd = await page.locator('p[ng-show="isSetCardPressoSetting"].ng-hide').isVisible();
    expect(isBtnPrintCardHasNgHideClass2nd, "btn print card should found").toBeFalsy();

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
