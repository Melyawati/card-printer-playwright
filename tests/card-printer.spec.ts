import { test, expect, BrowserContext, type Page, Locator, ElementHandle } from '@playwright/test';
import assert from 'assert';
import exp from 'constants';
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

const deleteCustomFieldMessage = {
  en: 'Deleting. Continue?',
  ko: '선택된 항목을 목록에서 삭제합니다. \n계속하시겠습니까?'
}

async function checkPopupMsg(koMsg: string, enMsg: string, option: string) {
  console.log(`Checking popup message - KO: ${koMsg}, EN: ${enMsg}, Option: ${option}`);
}

let newUserBSB006: string | undefined = undefined;

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
  test('5. Print Card on an empty New User page', async ({ page }) => {
    await page.locator('button:has-text("USER")').click();
    await page.locator('button:has-text("ADD USER")').click();
    let isBtnPrintCardHasNgHideClass = await page.locator('p[ng-show="isSetCardPressoSetting"].ng-hide').isVisible();
    expect(isBtnPrintCardHasNgHideClass, "btn print card should found").toBeFalsy();
                
    page.locator('label[for="btnPrintCard"]').click();
    const checkPrintCardPopup = await page.waitForSelector('.popCnt', { state: 'visible', timeout: 3000 });
    expect(checkPrintCardPopup, 'Fail : Pop up is not showing up').toBeTruthy();

    page.locator("//div[@ng-model='print.selectedCard']").click();
    await page.click('#printCardDlg .cardTemplate .scroll > .selectList > li.item.item_0');
    await page.waitForTimeout(5000);
    let isPrintBtnPresent = page.locator('#printCardDlg [ng-click="doPrint()"]').isVisible();
    let isCancelButtonPresent = page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').isVisible();
    expect(isPrintBtnPresent, 'btn print should be present').toBeTruthy();
    expect(isCancelButtonPresent, 'btn cancel print should be present').toBeTruthy();

    page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').click();

    page.locator('label[for="btnPrintCard"]').click();
    let checkPrintCardPopup2nd = await page.waitForSelector('.popCnt', { state: 'visible', timeout: 3000 });
    expect(checkPrintCardPopup2nd, 'Fail : Pop up is not showing up').toBeTruthy();
    page.locator("//div[@ng-model='print.selectedCard']").click();
    await page.click('#printCardDlg .cardTemplate .scroll > .selectList > li.item.item_0');
    let isPrintBtnPresent2nd = page.locator('#printCardDlg [ng-click="doPrint()"]').isVisible();
    let isCancelButtonPresent2nd = page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').isVisible();

    expect(isPrintBtnPresent2nd, 'btn print should be present').toBeTruthy();
    expect(isCancelButtonPresent2nd, 'btn cancel print should be present').toBeTruthy();

    page.locator('#printCardDlg [ng-click="doPrint()"]').click();
    let isNoticeOkPresent = page.locator('.popFooter > .btnC > .okButton').isVisible();
    let isNoticeCancelPresent = page.locator('#dialogBtnCancel').isVisible();
    expect(isNoticeOkPresent, 'button ok should be present').toBeTruthy();
    expect(isNoticeCancelPresent, 'button cancel should be present').toBeTruthy();
  
    page.locator('[ng-click="doCancelPrintCard()"]').click();
    page.locator('#printCardDlg [ng-click="doPrint()"]').click();
    let isNoticeOkPresent2nd = page.locator('.popFooter > .btnC > .okButton').isVisible();
    let isNoticeCancelPresent2nd = page.locator('#dialogBtnCancel').isVisible();
    expect(isNoticeOkPresent2nd, 'button ok should be present').toBeTruthy();
    expect(isNoticeCancelPresent2nd, 'button cancel should be present').toBeTruthy();

    page.locator('#dialogBtnCancel').click();
    page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').click();

    await page.waitForTimeout(5000);
  });  
  test('6. Print Card on a filled New User page', async ({ page }) => {
    await page.locator('button:has-text("Settings")').click();
    await page.locator('li.server a:has-text("Server")').click();
    // add some new custom user field
    let newCustomUserField = {
        field1: {
            type: 'Text Input Box',
            name: 'occupation'
        },
        field2: {
            type: 'Number Input Box',
            name: 'grade'
        },
        field3: {
            type: 'Combo Box',
            name: 'color',
            data: 'red;blue;white;'
        }
    };
    
    // remove rows
    const rows = await page.$$('#customFieldSetTable tbody tr');

    // Iterate over each row
    for (const row of rows) {
        // Check if the delete button exists in the row
        const btnDeleteExist = await row.$('.ibtnDelete');

        // If delete button exists, click on it and check the popup message
        if (btnDeleteExist) {
            await btnDeleteExist.click();
            await checkPopupMsg(deleteCustomFieldMessage.ko, deleteCustomFieldMessage.en, 'Yes');
        }
    }

    page.click('[ng-click="doAddCustomField()"]');

    page.locator('#customFieldSetTable tr:nth-child(1) .customFieldName > input').fill(newCustomUserField.field1.name);
    page.click('#customFieldSetTable tr:nth-child(1) .customFieldType > [ng-model="item.type"]');
    page.click('#customFieldSetTable tr:nth-child(1) .customFieldType > [ng-model="item.type"] > .scroll > .selectList > li:nth-child(1)');

    await page.waitForTimeout(5000);
    page.click('[ng-click="doAddCustomField()"]');
    page.locator('#customFieldSetTable > tbody > tr:nth-child(2) .customFieldName > input').fill(newCustomUserField.field2.name);
    page.click('#customFieldSetTable > tbody > tr:nth-child(2) .customFieldType > [ng-model="item.type"]');
    page.click('#customFieldSetTable > tbody > tr:nth-child(2) .customFieldType > [ng-model="item.type"] > .scroll > .selectList > li:nth-child(2)');
  
    await page.waitForTimeout(5000);
    page.click('[ng-click="doAddCustomField()"]');
    page.locator('#customFieldSetTable > tbody > tr:nth-child(3) .customFieldName > input').fill(newCustomUserField.field3.name);
    page.click('#customFieldSetTable > tbody > tr:nth-child(3) .customFieldType > [ng-model="item.type"]');
    page.click('#customFieldSetTable > tbody > tr:nth-child(3) .customFieldType > [ng-model="item.type"] > .scroll > .selectList > li:nth-child(3)');
    page.locator('#customFieldSetTable > tbody > tr:nth-child(3) .customFieldData > [ng-model="item.data"]').fill(newCustomUserField.field3.data);
    await page.waitForTimeout(3000);
    page.click('[ng-click="doApply()"]');
    await page.waitForTimeout(3000);

    await page.locator('button:has-text("USER")').click();
    await page.locator('button:has-text("ADD USER")').click();
    // fill in user info
    let newUser = {
        name: 'Indra',
        email: 'indra@suprema.co.kr',
        department:'Dev',
        telephone: '123',
        customFieldInputBox: 'Inputbox',
        customFieldNumber: '456'
    };
    page.locator("//input[@ng-model='user.name']").fill(newUser.name);
    await page.waitForTimeout(2000);
    page.locator("//input[@ng-model='user.email']").fill(newUser.email);
    await page.waitForTimeout(2000);
    page.locator("//input[@ng-model='user.department']").fill(newUser.department);
    await page.waitForTimeout(2000);
    page.locator("//input[@ng-model='user.phone']").fill(newUser.telephone);
    await page.waitForTimeout(2000);
    page.locator("//input[@name='customField0']").fill(newUser.customFieldInputBox);
    await page.waitForTimeout(1000);
    page.locator("//input[@name='customField1']").fill(newUser.customFieldNumber);
    await page.waitForTimeout(1000);
    page.click('[ng-if="item.custom_field.type == USER_CUSTOM_FIELD_TYPE.SELECT"]');
    await page.waitForTimeout(2000);
    page.locator('[ng-if="item.custom_field.type == USER_CUSTOM_FIELD_TYPE.SELECT"] div.scrollY > ul.selectList  > li:nth-child(2)').click();
    await page.waitForTimeout(2000);
    page.click('label[for="btnPrintCard"]');
    let checkPrintCardPopup = await page.waitForSelector('.popCnt', { state: 'visible', timeout: 3000 });
    expect(checkPrintCardPopup, 'Fail : Pop up is not showing up').toBeTruthy();

    page.locator("//div[@ng-model='print.selectedCard']").click();
    await page.click('#printCardDlg .cardTemplate .scroll > .selectList > li.item.item_0');
    let isPrintBtnPresent = page.locator('#printCardDlg [ng-click="doPrint()"]').isVisible();
    let isCancelButtonPresent = page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').isVisible();

    expect(isPrintBtnPresent, 'btn print should be present').toBeTruthy();
    expect(isCancelButtonPresent, 'btn cancel print should be present').toBeTruthy();

    page.locator('#printCardDlg [ng-click="doPrint()"]').click();
    await page.waitForTimeout(5000);
    let isNoticeOkPresent = page.locator('.popFooter > .btnC > .okButton').isVisible();
    let isNoticeCancelPresent = page.locator('#dialogBtnCancel').isVisible();
    expect(isNoticeOkPresent, 'button ok should be present').toBeTruthy();
    expect(isNoticeCancelPresent, 'button cancel should be present').toBeTruthy();

    page.locator('#dialogBtnCancel').click();
    await page.waitForTimeout(2000);
    page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').click();
    await page.waitForTimeout(2000);
    const inputElement = await page.$('input[ng-model="user.user_id"]');

    if (!inputElement) {
        console.error('Input element not found');
        return;
    }

    newUserBSB006 = await inputElement.evaluate((element: HTMLElement) => {
      // Return the value of the attribute or undefined if it's null
      return (element as HTMLInputElement)?.value || undefined;
  });
    page.locator('[ng-click="addUser()"]').click();

    await page.waitForTimeout(5000);
  }); 

  test('7. Print Card on existing User', async ({ page }) => {
    await page.locator('button:has-text("USER")').click();
    // let isUserSearchExist = await page.locator('#boardSearchInput').isVisible();
   
      await page.fill('#boardSearchInput', 'Indra');
  
      // Click the search button
      await page.click('[ng-click="doSearchBoard()"].btnText');
      await page.locator('article.datagridTypeA .datagrid-btable > tbody > tr:nth-child(1)').click();
  
      page.locator('label[for="btnPrintCard"]').click();
      let checkPrintCardPopup = await page.waitForSelector('.popCnt', { state: 'visible', timeout: 3000 });
      expect(checkPrintCardPopup, 'Fail : Pop up is not showing up').toBeTruthy();
      
      page.locator("//div[@ng-model='print.selectedCard']").click();
      await page.waitForTimeout(5000);
      let isDefaultCardSelected = page.locator('#printCardDlg .cardTemplate .scroll > .selectList > li.item.item_0').click();
      let isPrintBtnPresent = page.locator('#printCardDlg [ng-click="doPrint()"]').isVisible();
      let isCancelButtonPresent = page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').isVisible();
      
      expect(isDefaultCardSelected, 'default card should be selected').toBeTruthy();
      expect(isPrintBtnPresent, 'btn print should be present').toBeTruthy();
      expect(isCancelButtonPresent, 'btn cancel print should be present').toBeTruthy();
      
      page.locator('#printCardDlg [ng-click="doPrint()"]').click();
      await page.waitForTimeout(5000);
      let isNoticeOkPresent = page.locator('.popFooter > .btnC > .okButton').isVisible();
      let isNoticeCancelPresent = page.locator('#dialogBtnCancel').isVisible();
      expect(isNoticeOkPresent, 'button ok should be present').toBeTruthy();
      expect(isNoticeCancelPresent, 'button cancel should be present').toBeTruthy();
      
      page.locator('#dialogBtnCancel').click();
      page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').click()
  
    await page.locator('button:has-text("USER")').click();
        await page.fill('#boardSearchInput', 'Indra');
        await page.click('[ng-click="doSearchBoard()"].btnText');
        await page.locator('article.datagridTypeA .datagrid-btable > tbody > tr:nth-child(1)').click();
  
        await page.click('label[for="btnPrintCard"]');
        await page.waitForSelector('.popCnt', { state: 'visible', timeout: 3000 });
  
        page.locator("//div[@ng-model='print.selectedCard']").click();
        await page.waitForTimeout(5000);
        let isDefaultCardSelected2nd = page.locator('#printCardDlg .cardTemplate .scroll > .selectList > li.item.item_0').click();
        let isPrintBtnPresent2nd = page.locator('#printCardDlg [ng-click="doPrint()"]').isVisible();
        let isCancelButtonPresent2nd = page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').isVisible();
  
        expect(isDefaultCardSelected2nd, 'default card should be selected').toBeTruthy();
        expect(isPrintBtnPresent2nd, 'btn print should be present').toBeTruthy();
        expect(isCancelButtonPresent2nd, 'btn cancel print should be present').toBeTruthy();
  
        page.locator("//div[@ng-model='print.selectedCard']").click();
        await page.waitForTimeout(5000);
        page.locator('#printCardDlg .cardTemplate .scroll > .selectList > li:nth-child(2)').click();
        page.locator('#printCardDlg [ng-click="doPrint()"]').click();
        await page.waitForTimeout(5000);
        let isNoticeOkPresent2nd = await page.$('.popFooter > .btnC > .okButton');
        let isNoticeCancelPresent2nd = await page.$('#dialogBtnCancel');
  
        expect(isNoticeOkPresent2nd, 'button ok should be present').toBeTruthy();
        expect(isNoticeCancelPresent2nd, 'button cancel should be present').toBeTruthy();
        page.locator('#dialogBtnCancel').click();
        page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').click();
        page.locator('[ng-click="addUser()"]').click();
    await page.waitForTimeout(5000);
  }); 
  test('8.Print Card on existing User after modify information', async({ page }) => {
    await page.locator('button:has-text("USER")').click();
    await page.fill('#boardSearchInput', 'Indra');
    await page.click('[ng-click="doSearchBoard()"].btnText');
    await page.locator('article.datagridTypeA .datagrid-btable > tbody > tr:nth-child(1)').click();

    // fill in user info
    let newUser = {
      name: 'Indra1',
      email: 'indra1@suprema.co.kr',
      department:'Dev',
      telephone: '12345',
      customFieldInputBox: 'Inputbox1',
      customFieldNumber: '4567'
    };
    page.locator("//input[@ng-model='user.name']").fill(newUser.name);
    await page.waitForTimeout(2000);
    page.locator("//input[@ng-model='user.email']").fill(newUser.email);
    await page.waitForTimeout(2000);
    page.locator("//input[@ng-model='user.department']").fill(newUser.department);
    await page.waitForTimeout(2000);
    page.locator("//input[@ng-model='user.phone']").fill(newUser.telephone);
    await page.waitForTimeout(2000);
    page.locator("//input[@name='customField0']").fill(newUser.customFieldInputBox);
    await page.waitForTimeout(1000);
    page.locator("//input[@name='customField1']").fill(newUser.customFieldNumber);
    await page.waitForTimeout(1000);
    page.click('[ng-if="item.custom_field.type == USER_CUSTOM_FIELD_TYPE.SELECT"]');
    await page.waitForTimeout(2000);
    page.locator('[ng-if="item.custom_field.type == USER_CUSTOM_FIELD_TYPE.SELECT"] div.scrollY > ul.selectList  > li:nth-child(3)').click();
    await page.waitForTimeout(2000);
    page.locator('label[for="btnPrintCard"]').click();
    let checkPrintCardPopup = await page.waitForSelector('.popCnt', { state: 'visible', timeout: 3000 });
    expect(checkPrintCardPopup, 'Fail : Pop up is not showing up').toBeTruthy();

    page.locator("//div[@ng-model='print.selectedCard']").click();
    await page.click('#printCardDlg .cardTemplate .scroll > .selectList > li.item.item_0');
    let isPrintBtnPresent = page.locator('#printCardDlg [ng-click="doPrint()"]').isVisible();
    let isCancelButtonPresent = page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').isVisible();

    expect(isPrintBtnPresent, 'btn print should be present').toBeTruthy();
    expect(isCancelButtonPresent, 'btn cancel print should be present').toBeTruthy();

    page.locator('#printCardDlg [ng-click="doPrint()"]').click();
    await page.waitForTimeout(5000);
    let isNoticeOkPresent = page.locator('.popFooter > .btnC > .okButton').isVisible();
    let isNoticeCancelPresent = page.locator('#dialogBtnCancel').isVisible();
    expect(isNoticeOkPresent, 'button ok should be present').toBeTruthy();
    expect(isNoticeCancelPresent, 'button cancel should be present').toBeTruthy();

    page.locator('#dialogBtnCancel').click();
    await page.waitForTimeout(2000);
    page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').click();
    page.locator('[ng-click="addUser()"]').click();
    page.locator('[ng-label="button.ok"]').click();

    await page.locator('article.datagridTypeA .datagrid-btable > tbody > tr:nth-child(1)').click();

    let newUser2 = {
      name: 'Indra2',
      email: 'indra2@suprema.co.kr',
      department:'Dev',
      telephone: '123456',
      customFieldInputBox: 'Inputbox2',
      customFieldNumber: '45678'
    };
    page.locator("//input[@ng-model='user.name']").fill(newUser2.name);
    await page.waitForTimeout(2000);
    page.locator("//input[@ng-model='user.email']").fill(newUser2.email);
    await page.waitForTimeout(2000);
    page.locator("//input[@ng-model='user.department']").fill(newUser2.department);
    await page.waitForTimeout(2000);
    page.locator("//input[@ng-model='user.phone']").fill(newUser2.telephone);
    await page.waitForTimeout(2000);
    page.locator("//input[@name='customField0']").fill(newUser2.customFieldInputBox);
    await page.waitForTimeout(1000);
    page.locator("//input[@name='customField1']").fill(newUser2.customFieldNumber);
    await page.waitForTimeout(1000);
    page.click('[ng-if="item.custom_field.type == USER_CUSTOM_FIELD_TYPE.SELECT"]');
    await page.waitForTimeout(2000);
    page.locator('[ng-if="item.custom_field.type == USER_CUSTOM_FIELD_TYPE.SELECT"] div.scrollY > ul.selectList  > li:nth-child(4)').click();

    page.locator('label[for="btnPrintCard"]').click();
    let checkPrintCardPopup2nd = await page.waitForSelector('.popCnt', { state: 'visible', timeout: 3000 });
    expect(checkPrintCardPopup2nd, 'Fail : Pop up is not showing up').toBeTruthy();

    page.locator("//div[@ng-model='print.selectedCard']").click();
    await page.click('#printCardDlg .cardTemplate .scroll > .selectList > li.item.item_0');
    let isPrintBtnPresent2nd = page.locator('#printCardDlg [ng-click="doPrint()"]').isVisible();
    let isCancelButtonPresent2nd = page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').isVisible();

    expect(isPrintBtnPresent2nd, 'btn print should be present').toBeTruthy();
    expect(isCancelButtonPresent2nd, 'btn cancel print should be present').toBeTruthy();

    page.locator("//div[@ng-model='print.selectedCard']").click();
    await page.waitForTimeout(5000);
    page.locator('#printCardDlg .cardTemplate .scroll > .selectList > li:nth-child(2)').click();

    page.locator('#printCardDlg [ng-click="doPrint()"]').click();
    await page.waitForTimeout(5000);
    let isNoticeOkPresent2nd = page.locator('.popFooter > .btnC > .okButton').isVisible();
    let isNoticeCancelPresent2nd = page.locator('#dialogBtnCancel').isVisible();
    expect(isNoticeOkPresent2nd, 'button ok should be present').toBeTruthy();
    expect(isNoticeCancelPresent2nd, 'button cancel should be present').toBeTruthy();

    page.locator('#dialogBtnCancel').click();
    await page.waitForTimeout(2000);
    page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').click();
    page.locator('[ng-click="addUser()"]').click();
    page.locator('[ng-label="button.ok"]').click();
    await page.waitForTimeout(5000);          
  });
  test('9. Verify default template changed on Add and Edit User page after changing default template', async ({ page }) => {
    const cardTemplatesTr = '#cardTemplateTable tbody tr';

    await page.locator('button:has-text("Settings")').click();
    await page.waitForTimeout(5000);
    const isCardPrinterBtnPresent = await page.locator('li.cardPrinter a').isVisible();
    expect(isCardPrinterBtnPresent, 'Card printer button should be available').toBeTruthy();                
    await page.locator('li.cardPrinter a:has-text("Card Printer")').click();
    await page.waitForTimeout(5000);
    let isTemplateChecked: boolean | undefined;
    const elements = await page.$$(cardTemplatesTr);

    for (let index = 0; index < elements.length; index++) {
        if (index === 1) {
            const elem = await elements[index].$('input[type="radio"]');
            const elemLabel = await elements[index].$('label');

            if (elemLabel) {
              await elemLabel.click();
              isTemplateChecked = await elem?.isChecked();
              expect(isTemplateChecked).toBe(true);
            } else {
                console.error('Label element not found.');
            }
            break;
        }
    }
    await page.waitForTimeout(5000);
    page.locator('[ng-click="doApplyCardPressoSetting();"]').click();
    await page.locator('button:has-text("USER")').click();
    await page.locator('button:has-text("ADD USER")').click();


    page.locator('label[for="btnPrintCard"]').click();
    let checkPrintCardPopup = await page.waitForSelector('.popCnt', { state: 'visible', timeout: 3000 });
    expect(checkPrintCardPopup, 'Fail : Pop up is not showing up').toBeTruthy();

    page.locator("//div[@ng-model='print.selectedCard']").click();
    await page.waitForTimeout(5000);
    let isDefaultCardSelected = page.locator('#printCardDlg .cardTemplate .scroll > .selectList > li.item.item_1').click();
    let isPrintBtnPresent = page.locator('#printCardDlg [ng-click="doPrint()"]').isVisible();
    let isCancelButtonPresent = page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').isVisible();
      
    expect(isDefaultCardSelected, 'default card should be selected').toBeTruthy();
    expect(isPrintBtnPresent, 'btn print should be present').toBeTruthy();
    expect(isCancelButtonPresent, 'btn cancel print should be present').toBeTruthy();

    page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').click();
    await page.waitForTimeout(5000);
    page.locator('[ng-click="cancelAddUser()"].btnBack').click();
    page.locator('article.datagridTypeA .datagrid-btable > tbody > tr:nth-child(1)').click();

    page.locator('label[for="btnPrintCard"]').click();
    let checkPrintCardPopup2nd = await page.waitForSelector('.popCnt', { state: 'visible', timeout: 3000 });
    expect(checkPrintCardPopup2nd, 'Fail : Pop up is not showing up').toBeTruthy();

    page.locator("//div[@ng-model='print.selectedCard']").click();
    let isDefaultCardSelected2nd = page.locator('#printCardDlg .cardTemplate .scroll > .selectList > li.item.item_1').click();
    await page.waitForTimeout(5000);
    let isPrintBtnPresent2nd = page.locator('#printCardDlg [ng-click="doPrint()"]').isVisible();
    let isCancelButtonPresent2nd = page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').isVisible();
      
    expect(isDefaultCardSelected2nd, 'default card should be selected').toBeTruthy();
    expect(isPrintBtnPresent2nd, 'btn print should be present').toBeTruthy();
    expect(isCancelButtonPresent2nd, 'btn cancel print should be present').toBeTruthy();
    page.locator('#printCardDlg [ng-click="doCancelPrintCard()"]').click();
    await page.waitForTimeout(5000);
  })

}); 

  
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
