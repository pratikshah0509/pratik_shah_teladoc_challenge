/**
 * This helper file is meant for common functions that are used as part of the framework.
 * Eg: Upload, scroll, etc.
 * Do not include application specific functions in this file.
 */

import {$, browser, by, Capabilities, element, protractor, WebElement} from 'protractor';

export async function getCapabilities(): Promise<Capabilities> {
    const capabilities = await browser.getCapabilities();
    const browserDetails = `Script is running on ${capabilities.get('browserName')} ${capabilities.get('version')}, ${capabilities.get('platform')}. The driver version is ${capabilities.get('chrome').chromedriverVersion.substring(0, 13)}`;
    console.log(browserDetails);
    return capabilities;
}
