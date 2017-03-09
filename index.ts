import * as fs from 'fs'
import * as slack from 'slack'
import * as https from 'https'
let keyFS = fsPromise('key.txt')
import { TBAReq as tba, Match } from './tbaApi'
import * as tz from "moment-timezone"

let curYear = 2017

Promise.all([tba.Status(), keyFS]).then(([status, key]) => {
    if (status.is_datafeed_down) {
        console.log('datafeed is down')
        console.log(status)
        return
    }
    curYear = status.current_season
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
                    let post: slack.post = { token: key, channel: a.channel, text: res.text, username: 'frc_match' }
                    if (res.attachments) post.attachments = res.attachments
                    slack.chat.postMessage(post, (err, data) => {
                        console.log({ err, data })
                    })
                })
            }
        }
    })
}).catch(e => console.log(e))

type resType = { text: string, attachments?: slack.Attachment[] }

let teamMatch: { [key: string]: Match[] } = {}
let commands: { [key: string]: (mesg: slack.Message, par: string[], response: (a: resType) => any) => any } = {
    "!info": (mesg, par, res) => {
        let year = parseInt(par[2], 10) || curYear
        let teamNum = /\d{1,4}/.exec(par[1])
        if (teamNum !== null) {
            let TeamId = 'frc' + teamNum[0]
            Promise.all([tba.TeamReq(TeamId), tba.TeamEvents(TeamId, year)]).then(([team, events]) => {
                let dateNow = Date.now()
                let num = 0, resp: slack.Attachment[] = []
                for (let i = 0; i < events.length; i++) {
                    let name = events[i].short_name
                    if (+tz.tz(events[i].start_date + " 08:00", events[i].timezone) < Date.now()) {
                        num++
                        Promise.all([tba.EventRankings(events[i].key), tba.EventStats(events[i].key)]).then(([ranks, stats]) => {
                            if (ranks[0] === undefined) {
                                num--;
                                if (num === 0) {
                                    res({ text: "", attachments: resp })
                                }
                                return
                            }
                            let tNum = parseInt(teamNum[0], 10)
                            let pointsI = ranks[0].indexOf("Record (W-L-T)"),
                                rankI = ranks[0].indexOf("Rank"),
                                teamI = ranks[0].indexOf("Team"),
                                teamRank = ranks.find(e => e[teamI] == tNum),
                                dpr = stats.dprs[teamNum[0]],
                                opr = stats.oprs[teamNum[0]],
                                ccwm = stats.ccwms[teamNum[0]]
                            let fields: { title?: string, value?: string }[] = []
                            if (teamRank[pointsI] !== undefined) {
                                fields.push({
                                    title: 'Record (W-L-T)',
                                    value: teamRank[pointsI].toString()
                                })
                            }
                            if (teamRank[rankI] !== undefined) {
                                fields.push({
                                    title: 'Rank',
                                    value: teamRank[rankI].toString()
                                })
                            }
                            fields.push({
                                title: 'Defense Power Rating',
                                value: dpr.toPrecision(5)
                            },
                                {
                                    title: 'Offensive Power Rating',
                                    value: opr.toPrecision(5)
                                },
                                {
                                    title: 'Calculated Contribution to Winning',
                                    value: ccwm.toPrecision(5)
                                })
                            resp.push({
                                title: name,
                                fields
                            })
                            num--
                            if (num === 0) {
                                res({ text: "", attachments: resp })
                            }
                        }).catch(console.log)
                    }
                }
                res({
                    text: `Info for Team ` + teamNum[0],
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
        let team = /\d{1,4}/.exec(par[1])
        if (team == null) {
            res({ text: "Sorry this is an invalid team number" })
            return
        }
        tba.TeamEvents('frc' + team[0], curYear).then(events => {
            let s = ""
            for (let i = 0; i < events.length; i++) {
                for (let ii = 0; ii < events[i].matches.length; ii++) {
                    let match = events[i].matches[ii]
                    if (match.alliances.blue.teams.indexOf(team[0]) >= 0) {
                        s += `${match.score_breakdown.blue} match ${match.match_number}`
                    } else if (match.alliances.red.teams.indexOf(team[0]) >= 0) {

                    }
                }
            }
        }).catch(err => {
            if ('404' in err) {
                res({ text: `Sorry team ${par[1]} does not exist ${parseInt(par[1]) > 7000 ? 'yet' : ''}` })
            }
            console.log({ err })
        })
    },
    "!help": (mesg, par, res) => {
        res({
            text: `Info`, attachments: [
                {
                    fields: [
                        {
                            title: '!info <Team number> ?<year>',
                            value: `Get info on a Team\nIf year is not provided than current year will be assumed`
                        },
                        {
                            title: '!status',
                            value: 'Get tracking status of the bot'
                        },
                        {
                            title: '!track <Tem Number>',
                            value: `Track a team`
                        }
                    ]
                }
            ]
        })
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