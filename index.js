"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const slack = require("slack");
const tbaApi_1 = require("./tbaApi");
const tz = require("moment-timezone");
let keyFS = fsPromise('key.txt');
let curYear = 2017;
Promise.all([tbaApi_1.TBAReq.Status(), keyFS]).then(([status, key]) => {
    if (status.is_datafeed_down) {
        console.log('datafeed is down');
        console.log(status);
        return;
    }
    curYear = status.current_season;
    let bot = slack.rtm.client();
    bot.listen({ token: key });
    bot.hello(msg => console.log(msg));
    bot.message(a => {
        if ('subtype' in a)
            return;
        console.log({ a });
        if (a.text[0] === '!') {
            let c = a.text.replace(/`|_|~|\*/g, '').split(/\s+/);
            let com = c[0].toLowerCase();
            if (com in commands) {
                commands[com](a, c, res => {
                    let post = { token: key, channel: a.channel, text: res.text, username: 'frc_match' };
                    if (res.attachments)
                        post.attachments = res.attachments;
                    slack.chat.postMessage(post, (err, data) => {
                        console.log({ err, data });
                    });
                });
            }
            else {
                slack.chat.postMessage({ token: key, channel: a.channel, text: `Command \`${com.substr(1)}\` not found`, username: 'frc_match' }, (err, data) => {
                    console.log({ err, data });
                });
            }
        }
    });
}).catch(e => console.log(e));
let teamMatch = {};
let commands = {
    "!info": (mesg, par, res) => {
        let year = parseInt(par[2], 10) || curYear;
        let teamNum = /\d{1,4}/.exec(par[1]);
        console.log({ year, teamNum });
        if (teamNum !== null) {
            let TeamId = 'frc' + teamNum[0];
            Promise.all([tbaApi_1.TBAReq.TeamReq(TeamId), tbaApi_1.TBAReq.TeamEvents(TeamId, year)]).then(([team, events]) => {
                let dateNow = Date.now();
                let num = 0, resp = [];
                for (let i = 0; i < events.length; i++) {
                    let name = events[i].short_name;
                    if (+tz.tz(events[i].start_date + " 08:00", events[i].timezone) < Date.now()) {
                        num++;
                        Promise.all([tbaApi_1.TBAReq.EventRankings(events[i].key), tbaApi_1.TBAReq.EventStats(events[i].key)]).then(([ranks, stats]) => {
                            if (ranks[0] === undefined) {
                                num--;
                                if (num === 0) {
                                    res({ text: "", attachments: resp });
                                }
                                return;
                            }
                            let tNum = parseInt(teamNum[0], 10);
                            let pointsI = ranks[0].indexOf("Record (W-L-T)"), rankI = ranks[0].indexOf("Rank"), teamI = ranks[0].indexOf("Team"), teamRank = ranks.find(e => e[teamI] == tNum), dpr = stats.dprs[teamNum[0]], opr = stats.oprs[teamNum[0]], ccwm = stats.ccwms[teamNum[0]];
                            let fields = [{ title: 'Rank', value: teamRank[rankI].toString() }];
                            if (teamRank[pointsI] !== undefined) {
                                fields.push({
                                    title: 'Record (W-L-T)',
                                    value: teamRank[pointsI].toString()
                                });
                            }
                            fields.push({
                                title: 'Defense : Offensive Power Rating',
                                value: `${dpr.toPrecision(5)} : ${opr.toPrecision(5)}`
                            }, {
                                title: 'Calculated Contribution to Win',
                                value: ccwm.toPrecision(5)
                            });
                            resp.push({
                                title: name,
                                fields
                            });
                            num--;
                            if (num === 0) {
                                res({ text: "", attachments: resp });
                            }
                        }).catch(console.log);
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
                                    value: events.map(a => a.start_date + ' -> ' + a.short_name + ' in ' + a.location).sort().join('\n') || `This team ${year < curYear ? "has not participated" : "is not participating"} in any events during this year`
                                }
                            ]
                        }
                    ]
                });
            }).catch(err => {
                if ('404' in err) {
                    res({ text: `Sorry team ${par[1]} does not exist ${parseInt(par[1]) > 7000 ? 'yet' : ''}` });
                }
                console.log({ err });
            });
        }
        else {
            res({ text: par.length === 1 ? 'This command needs to be called with a team number' : 'Sorry That is an invalid team number' });
        }
    },
    "!status": (mesg, par, res) => {
    },
    "!track": (mesg, par, res) => {
        let team = /\d{1,4}/.exec(par[1]);
        if (team == null) {
            res({ text: "Sorry this is an invalid team number" });
            return;
        }
        tbaApi_1.TBAReq.TeamEvents('frc' + team[0], curYear).then(events => {
            let s = "";
            for (let i = 0; i < events.length; i++) {
                for (let ii = 0; ii < events[i].matches.length; ii++) {
                    let match = events[i].matches[ii];
                    if (match.alliances.blue.teams.indexOf(team[0]) >= 0) {
                        s += `${match.score_breakdown.blue} match ${match.match_number}`;
                    }
                    else if (match.alliances.red.teams.indexOf(team[0]) >= 0) {
                    }
                }
            }
        }).catch(err => {
            if ('404' in err) {
                res({ text: `Sorry team ${par[1]} does not exist ${parseInt(par[1]) > 7000 ? 'yet' : ''}` });
            }
            console.log({ err });
        });
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
        });
    }
};
function fsPromise(src) {
    return new Promise((res, rej) => {
        fs.readFile(src, 'utf8', (err, data) => {
            if (err)
                rej(err);
            else
                res(data.trim());
        });
    });
}
