/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs'
import { resolve } from 'path'
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer-core'
import { CredentialsType, PostType, browserOptions } from './types'


export function delayedResolve(max = 3000, min = 2000) {
    return new Promise((resolve) => {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        setTimeout(() => {
            resolve(`Resolved after ${delay} milliseconds`);
        }, delay);
    });
}


export const launchBrowser = async (data: browserOptions = { autoCloseAlert: false, disableNotifications: true }): Promise<[Browser, Page]> => {
    const browser = await puppeteer.launch({
        headless: false,
        args: [`${data.disableNotifications && '--disable-notifications'}`, '--no-sandbox', '--trace-warnings', `--window-size=1404,1024`],
        // executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        pipe: true,
    })
    const page = await (await browser.pages())[0]
    await page.setViewport({ width: 1080, height: 1024 })

    const context = await browser.defaultBrowserContext()
    const origins = ["www.facebook.com", "m.facebook.com", "web.facebook.com"]
    origins.forEach(origin => {
        context.overridePermissions(`https://${origin}`, ['geolocation', 'notifications'])
    })

    if (data.autoCloseAlert) {
        page.on('dialog', async (dialog) => {
            console.log(`Dialog of type '${dialog.type()}' detected with message: '${dialog.message()}'`);
            // Close the dialog by dismissing it
            await dialog.dismiss();
        });
    }

    return [browser, page]
}

export const loginToAccount = async (page: Page, loginInfo: CredentialsType): Promise<boolean> => {
    `This functionis used to login to a specified user's account pass in page: Page, loginInfo: { email: string, password: string }`
    try {
        // Load cookies if there are cookies if there are cookies
        const cookiesPath = resolve(__dirname, 'cookies', `${loginInfo.email.replace('.com', '')}-cookies.json`)

        console.log("COOKIE: ", cookiesPath)

        if (fs.existsSync(cookiesPath)) {
            const cookies = await fs.readFileSync(cookiesPath)
            await page.setCookie(...JSON.parse(cookies.toString()))
        }

        // 
        await page.goto('https://m.facebook.com', { timeout: 120000 })


        const HomeButtonFirstCheck = await page.waitForSelector('*[aria-label="Home"]', { timeout: 60000 })
        if (await HomeButtonFirstCheck?.isVisible()) {
            const newcookies = await page.cookies()
            fs.writeFileSync(cookiesPath, JSON.stringify(newcookies))
            return true
        }

        // Insert email email address and password
        try {
            const emailInput = await page.waitForSelector(`#m_login_email`)
            await emailInput?.type(loginInfo.email)
            await delayedResolve()
            const PasswordInput = await page.waitForSelector(`#m_login_password`)
            await PasswordInput?.type(loginInfo.password)

            // Click Login button
            await delayedResolve()
            const loginButton = await page.waitForSelector(`button[name="login"]`)
            // await loginButton.click()


            await Promise.all([
                page.waitForNavigation(),
                loginButton?.click(),
            ])

            // Check for password saving option
            const pageContent = await page.content()
            if (pageContent.includes(`Save your password now to make logging in even easier.`)) {
                console.log(`Finding "not now" button`)
                const NotNow = await page.$$(`a`)
                for (const link of NotNow) {
                    const stringValue = (await link.getProperty('innerText')).jsonValue()
                    if ((await stringValue).toLowerCase().includes('not now')) {
                        console.log(`Found "not now" button`)
                        await Promise.all([
                            page.waitForNavigation(),
                            link.click()
                        ])
                        console.log(`Clicked "not now"`)
                        break
                    }
                }
            }
        } catch (e) { /* empty */ }

        // Reload page on web.facebook.com
        await page.goto('https://web.facebook.com', { timeout: 120000 })

        const HomeButton = await page.waitForSelector('*[aria-label="Home"]', { timeout: 60000 })
        if (await HomeButton?.isVisible()) {
            const newcookies = await page.cookies()
            fs.writeFileSync(cookiesPath, JSON.stringify(newcookies))
            return true
        }


        return false
    } catch (error) {
        console.log((error as any)?.message)

        // Checking if you're already logged in
        try {
            const HomeButton = await page.waitForSelector('*[aria-label="Home"]', { timeout: 60000 })
            if (await HomeButton?.isVisible()) {
                const newcookies = await page.cookies()
                fs.writeFileSync(`/cookies/${loginInfo.email}-cookies.json`, JSON.stringify(newcookies))
                return true
            }
        } catch (e) { /* empty */ }
        return false
    }
}


export const createPost = async (page: Page, data: PostType): Promise<boolean> => {
    try {
        console.log('Creating post')
        // Finding the button  for post photos or videos
        const className = await page.evaluate(() => {
            const divs = Array.from(document.querySelectorAll('div'))
            const postNode = divs.find((e) => e.innerText == 'Photo/video')
            return postNode?.className;
        })

        console.log(`Found 'Photo/video' button`)

        await delayedResolve()
        const postSomething = (await page.$$(`div[class="${className}"]`))[1]
        // Clicking the button
        const rect = await page.evaluate((postSomething) => {
            const { top, left, height, width } = postSomething.getBoundingClientRect();
            return { top, left, height, width };
        }, postSomething);

        let uploadModal = false
        for (let index = 0; index < 3; index++) {
            await page.mouse.click(rect.left + (rect.width / 2), rect.top + (rect.height / 2))
            try {
                await page.waitForSelector('*[aria-label="Create post"]', { visible: true, timeout: 90 })
                uploadModal = true
            } catch {
                continue
            }
        }
        if (!uploadModal) return false

        // Clicking the center of the screen, this will click the modal that has appeared asking you to upload the file.
        await delayedResolve(7000, 5000)
        const dimensions = await page.evaluate(() => {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            };
        });

        const centerCordinates = [dimensions.width / 2, dimensions.height / 2]

        // Click button and also wait for file chooser
        await delayedResolve(6000, 7000);
        console.log(`Clicking center of the screen at ${centerCordinates}`)
        const [fileChooser] = await Promise.all([
            page.waitForFileChooser(),
            page.mouse.click(centerCordinates[0], centerCordinates[1])
        ])

        const uploadingFollowingFiles = data.upload

        // Select the files to upload
        console.log(`Uploading following files ${uploadingFollowingFiles}`)
        await fileChooser.accept(uploadingFollowingFiles);

        // Enter the text you want to add to the upload.
        await delayedResolve();
        await (await page.$(`div[aria-label*="What's on your mind,"]`))?.click();

        await delayedResolve();
        await page.keyboard.type(data.text, { delay: 300 });

        console.log("Awaiting Post button enablement")
        await page.waitForFunction(() => {
            return !document.querySelector('*[aria-label="Post"]')?.getAttribute('aria-disabled')
        }, { timeout: 1000 * 60 * 5 })
        console.log("Post button enabled")

        await delayedResolve();
        const postButton = await page.waitForSelector(`*[aria-label="Post"]`)
        await page.evaluate((button) => {
            // @ts-expect-error Button will be clicked
            button?.click()
        }, postButton)

        await page.waitForFunction(() => { return !document.querySelector('*[aria-label="Post"]') }, { timeout: 30 * 60 * 1000 })

        console.log('Post creation process completed, confirm on the website')

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export const getMyProfiles = async (page: Page, returnHandle: boolean = true): Promise<[string[], ElementHandle<Element>[]] | [string[], null]> => {
    try {
        await Promise.all([
            page.waitForNavigation(),
            page.goto(`https://www.facebook.com/`)
            // page.goto(`https://www.facebook.com/pages/?category=your_pages`)
        ])

        await delayedResolve()
        const profileIcon = await page.waitForSelector('*[aria-label="Your profile"]')
        await profileIcon?.click()

        const seeAllProfiles = await page.waitForSelector('*[aria-label="See all profiles"]')
        await delayedResolve()
        await seeAllProfiles?.click()

        // const pages = await page.$$(`div[style="border-radius: max(0px, min(var(--card-corner-radius), calc((100vw - 4px - 100%) * 9999))) / var(--card-corner-radius);"]`)
        await delayedResolve(4000, 3000)
        const pages = await page.$$(`div[style="transform: translateX(0%) translateZ(1px);"] div[role="list"] div[role="listitem"]`)

        const pageNames: string[] = []
        const pageIndex: number[] = []
        for (const p in pages) {
            const text: string = await (await pages[p].getProperty('innerText')).jsonValue() as string
            if (!text.includes('Create new profile or Page')) { pageNames.push(text.split('\n')[0]); pageIndex.push(Number(p)) }
        }

        return returnHandle ? [pageNames, pages.filter((_, i) => pageIndex.includes(i))] : [pageNames, null]
    } catch (error) {
        return [[], null]
    }
}

export const SwitchProfiles = async (page: Page, ProfileName: string) => {

    console.log(`Switching profile to ${ProfileName}`)

    const pages = await getMyProfiles(page, true)

    const divIndex = pages[0].findIndex(e => ProfileName == e)
    if (divIndex === -1) return false

    // const moreBtn = await pages[1][divIndex].$('div[aria-label="More"]')
    await delayedResolve()
    // await moreBtn.click()
    if (pages[1]) {
        await Promise.all([
            pages[1][divIndex].click(),
            page.waitForNavigation()
        ])
    }

    // await page.waitForSelector('div[role="menuitem"]')
    // const menuItems = await page.$$('div[role="menuitem"]')
    // let optionIndex = -1
    // for (const ind in menuItems) {
    //     optionIndex++;
    //     const text = await (await menuItems[ind].getProperty('innerText')).jsonValue()
    //     if (text.trim().toLowerCase().includes('switch now'))
    //         break
    // }
    // if (optionIndex == -1) return false
    // const switchButton = menuItems[optionIndex]
    // await delayedResolve()
    // await switchButton.click()

    // await page.waitForSelector('div[aria-label="Switch"]')
    // await delayedResolve()
    // await Promise.all([
    //     page.waitForNavigation(),
    //     page.click('div[aria-label="Switch"]')
    // ])

    // Check to see that the login has happened
    let changedProfile = false
    // const h1s = await page.$$('h1')
    const profileTags = await page.$$('*[href*="https://www.facebook.com/profile.php"]')
    for (const h of profileTags) {

        const name = await (await h.getProperty('innerText')).jsonValue() as string;
        if (name.toLowerCase().trim().includes(ProfileName.toLocaleLowerCase().trim())) {
            changedProfile = true
            console.log(`Switched profile to ${ProfileName}`)
            break
        }

    }

    return changedProfile
}