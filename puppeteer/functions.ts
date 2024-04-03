/* eslint-disable @typescript-eslint/no-explicit-any */
// import { resolve } from 'path'
import { BrowserWindow } from 'electron'
import { createPost, getMyProfiles, launchBrowser, loginToAccount, SwitchProfiles } from './utility'
import { CredentialsType } from './types'

const ConfirmAccount = async (args: any, win: BrowserWindow) => {
    try {
        const { username, password } = args[1]

        console.log(`Confirming account username:${username}, password:${password}`)

        const [browser, page] = await launchBrowser({ autoCloseAlert: true, disableNotifications: true })
        console.log(`Launched browser`)

        try {
            if (await loginToAccount(page, { email: username, password: password })) {
                // 
                const pages = await getMyProfiles(page, false)
                console.log(pages)

                win.webContents.send('send-profiles', JSON.stringify(pages[0]))
                // 
            }
        } catch (error) { /* empty */ }

        const image = await page.screenshot({ encoding: "base64" }).catch(() => { });
        browser.close()

        // Send image of screenshot to browser
        win.webContents.send('send-screenshot', image);
        return image
    } catch (error) {
        console.log(error)
    }
}

const CreatePost = async (args: any, win: BrowserWindow) => {
    // 
    const [browser, page] = await launchBrowser({ autoCloseAlert: true })

    try {
        const credentials: CredentialsType = {
            email: args[1].username,
            password: args[1].password
        }
        // 
        let loginState = false
        const max_login_attempt = 3
        for (let index = 0; index < max_login_attempt; index++) {
            if (await loginToAccount(page, credentials)) {
                console.log(`Login was successful`)
                loginState = true
                break
            }
            console.log(`Login was unsuccessful`)
        }

        if (!loginState) {
            console.log(`login state is false`)
            throw new Error("Login wasn't successfull")
        }
        console.log(`login state is true`)


        const postPages = args[1].profiles

        for (const postPage of postPages) {
            if (await SwitchProfiles(page, postPage))
                await createPost(page, args[1].postData)
        }

        const image = await page.screenshot({ encoding: "base64" }).catch(() => { });
        browser.close()

        // Send image of screenshot to browser
        win.webContents.send('send-screenshot', image);
        win.webContents.send('send-post-completed', { res: true });


    } catch (error: any) {
        console.log(error)
        win.webContents.send('send-post-error', JSON.stringify({ result: 'error', message: error.message }))
    }
}


const EventHandlers = async (_event: any, args: unknown[], win: BrowserWindow) => {
    switch (args[0]) {
        case "confirm-account":
            return await ConfirmAccount(args, win);

        case "create-post":
            return await CreatePost(args, win);

        default:
            break;
    }
}

export default EventHandlers;