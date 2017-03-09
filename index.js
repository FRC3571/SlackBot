"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const slack = require("slack");
let keyFS = fsPromise('key.txt');
const tbaApi_1 = require("./tbaApi");
let year = 2017;
Promise.all([tbaApi_1.TBAReq.Status(), keyFS]).then(([status, key]) => {
    if (status.is_datafeed_down) {
        console.log('datafeed is down');
        console.log(status);
        return;
    }
    year = status.current_season;
    let bot = slack.rtm.client();
    bot.listen({ token: key });
    bot.hello(msg => console.log(msg));
    bot.message(a => {
        if ('subtype' in a)
            return;
        console.log({ a });
        if (a.text[0] === '!') {
            let c = a.text.split(' ');
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
        }
    });
}).catch(e => console.log(e));
let commands = {
    "!info": (mesg, par, res) => {
        let num = /\d{1,4}/.exec(par[1]);
        if (num !== null) {
            Promise.all([tbaApi_1.TBAReq.TeamReq('frc' + num[0]), tbaApi_1.TBAReq.TeamEvents('frc' + num[0], year)]).then(([team, events]) => {
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
                });
            }).catch(err => {
                if ('404' in err) {
                    res({ text: `Sorry team ${par[1]} does not exist ${parseInt(par[1]) > 7000 ? 'yet' : ''}` });
                }
                console.log({ err });
            });
        }
        else {
            res({ text: 'Sorry That is an invalid team number' });
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
        tbaApi_1.TBAReq.TeamEvents('frc' + team[0], year).then(events => {
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
        res({ text: `Info`, attachments: [
                {
                    fields: [
                        {
                            title: '!info',
                            value: `Param: <Team number>
                        Get info on a Team`
                        },
                        {
                            title: '!status',
                            value: 'Get tracking status of the bot'
                        },
                        {
                            title: '!track',
                            value: `Param: <Tem Number>`
                        }
                    ]
                }
            ] });
    }
};
function fsPromise(src) {
    return new Promise((res, rej) => {
        fs.readFile(src, 'utf8', (err, data) => {
            if (err)
                rej(err);
            else
                res(data);
        });
    });
}
