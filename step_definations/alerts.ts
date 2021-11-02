import {click, not, slow, type, see} from 'blue-harvest';
import {browser, by} from "protractor";
import * as environments from '../config/environments.json';
import { Then, When } from 'cucumber';
import * as helper from '../step_definations/helper';
import {cli} from "webdriver-manager/built/lib/cli_instance";


When('I open the webtables page', async function() {
    const env = browser.params.env;
    const environmentUrl = environments.pratik_shah_teladoc_challenge1[env];
    await browser.waitForAngularEnabled(false);
    await browser.get(environmentUrl);
    const currentBrowserCapabilities = await helper.getCapabilities();
    if (currentBrowserCapabilities.get('platform') === `Mac OS X`) {
      await browser.manage().window().maximize();
    }
    try{
      await browser.executeScript('window.localStorage.clear();');
    }catch(err){
      console.log("Caught alert that is caused by w3c = false" + err);
    }
    await browser.executeScript('window.sessionStorage.clear();');
    await browser.driver.manage().deleteAllCookies();
  });

When('I click on Add User', async function() {
   await slow.see('Add User');
   await click('Add User');
   await click (by.xpath("//input[@name='FirstName']"));
   await type('Pratik');
   await click (by.xpath("//input[@name='LastName']"));
   await type('Shah');
   await click (by.xpath("//input[@name='UserName']"));
   await type('prat1001');
   await click (by.xpath("//input[@name='UserName']"));
   await type('prat1001');
   await click (by.xpath("//input[@name='Password']"));
   await type('test@123');
   await click('Company AAA');
   await click('---');
   await click('Sales Team');
   await click (by.xpath("//input[@name='Email']"));
   await type('test@gmail.com');
   await click (by.xpath("//input[@name='Mobilephone']"));
   await type('8002222222');
   await click('Save');
});

When('I search for user novak and delete it', async function() {
    await click('Search');
    await type('novak');
    await slow.see('novak');
    await click("(//button[@class='btn btn-link'])[2]");
    await click('Ok');
});

Then('I should be able to validate that the user was added successfully', async function(){
  await click('Search');
  await type('pra');
  await slow.see('pratik');
});

Then('I should be able to validate that the user was deleted successfully', async function(){
    await click('Search');
    await type('novak');
    await not.see('novak');
});

