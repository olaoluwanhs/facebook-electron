// import fs from 'fs'
// import { resolve } from 'path'
// import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer'
// import { delayedResolve } from './utility'
// import { CredentialsType, PostType, browserOptions } from './types'
// import processInfo from '../process.json'



// const main = async () => {
//     //
//     const [browser, page] = await launchBrowser({ autoCloseAlert: true })

//     const credentials: CredentialsType = {
//         // email: '09064232292',
//         // password: '@#$123ola'
//         // email: 'olaoluwanhs@gmail.com',
//         // password: 'mummy?'
//         email: processInfo.username,
//         password: processInfo.password
//     }

//     let loginState = false
//     const max_login_attempt = 3
//     for (let index = 0; index < max_login_attempt; index++) {
//         if (await loginToAccount(page, credentials)) {
//             console.log(`Login was successful`)
//             loginState = true
//             break
//         }
//         console.log(`Login was unsuccessful`)
//     }

//     if (!loginState) {
//         console.log(`login state is false`)
//         return
//     }
//     console.log(`login state is true`)

//     // Create a post
//     const PostInfo: PostType = {
//         // files: ['background.jpg', 'pexels.mp4'],
//         // text: "#You are #welcome by the way."
//         files: processInfo.postData.upload,
//         text: processInfo.postData.text
//     }

//     // for (let i = 0; i <= 3; i++) {

//     //     console.log(`Attempt #${i}`)
//     //     const postCreated = await createPost(page, PostInfo)
//     //     if (postCreated) {
//     //         console.log(`Post created successfully`)
//     //         browser.close()
//     //         return
//     //     }
//     //     console.log(`Post not created`)
//     // }

//     // const postPages = ['Cerebral Generated Imagery', 'Cheap pleasure']
//     const postPages = processInfo.profiles

//     for (const postPage of postPages) {
//         if (await SwitchProfiles(page, postPage))
//             await createPost(page, PostInfo)
//     }

//     browser.close()
// }

// main()

// register a user facebook account route
// get all profiles route
// create a post route
// upload media route
// view your media route
