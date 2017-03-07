import * as fs from 'fs'
import * as slack from 'slack'
import * as https from 'https'
let keyFS = fsPromise('key.txt')
import { TBAReq as tba } from './tbaApi'

let year = 2017

Promise.all([tba.Status(), keyFS]).then(([status, key]) => {
    if (status.is_datafeed_down) {
        console.log('datafeed is down')
        console.log(status)
        return
    }
    year = status.current_season
    let bot = slack.rtm.client()
    bot.listen({ token: key })
    bot.hello(msg => console.log(msg))
    bot.message(a => {
        if ('subtype' in a) return
        console.log({ a })
        if (a.text[0] === '!') {
            let c = a.text.split(' ')
            let com = c[0].toLowerCase()
            if (com in commands) {
                commands[com](a, c, res => {
                    let post: slack.post = { token: key, channel: a.channel, text: res.text }
                    if (res.attachments) post.attachments = res.attachments
                    slack.chat.postMessage(post, (err, data) => {
                        console.log({ err, data })
                    })
                })
            }
        }
    })
}).catch(e => console.log(e))

let commands: { [key: string]: (mesg: slack.Message, par: string[], response: (a: { text: string, attachments?: slack.Attachment[] }) => any) => any } = {
    "!info": (mesg, par, res) => {
        let num = /\d{1,4}/.exec(par[1])
        if (num !== null) {
            Promise.all([tba.TeamReq('frc' + num[0]), tba.TeamEvents('frc' + num[0], year)]).then(([team, events]) => {
                res({
                    text: `Info for Team ` + num[0],
                    attachments: [
                        {
                            title: "Info",
                            fields: [
                                {
                                    title: "Team Name",
                                    value: team.nickname
                                },
                                {
                                    title: "Rookie Year",
                                    value: team.rookie_year.toString()
                                },
                                {
                                    title: "Current Competitions",
                                    value: events.map(a => a.start_date + ' -> ' + a.short_name + ' in ' + a.location).sort().join('\n') || "This team is not participating in any events this year"
                                }
                            ]
                        }
                    ]
                })
            }).catch(err => {
                if ('404' in err) {
                    res({ text: `Sorry team ${par[1]} does not exist ${parseInt(par[1]) > 7000 ? 'yet' : ''}` })
                }
                console.log({ err })
            })
        } else {
            res({ text: 'Sorry That is an invalid team number' })
        }
    },
    "!status": (mesg, par, res) => {

    },
    "!track": (mesg, par, res) => {

    }
}

function fsPromise(src: string) {
    return new Promise<string>((res, rej) => {
        fs.readFile(src, 'utf8', (err, data) => {
            if (err) rej(err)
            else res(data)
        })
    })
}