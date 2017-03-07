"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let key = "xoxb-147371785172-lzTFS1mRXSzVAfFs7HJrWkas";
const slack = require("slack");
const tbaApi_1 = require("./tbaApi");
tbaApi_1.TBAReq.Status().then(status => {
    let bot = slack.rtm.client();
    bot.listen({ token: key });
    bot.hello(msg => console.log(msg));
    bot.message(a => {
        if ('subtype' in a)
            return;
        console.log({ a });
        if (a.text[0] === '!') {
            let c = a.text.split(' ');
            switch (c[0].toLowerCase()) {
                case '!info':
                    let num = /\d{1,4}/.exec(c[1]);
                    if (num !== null) {
                        Promise.all([tbaApi_1.TBAReq.TeamReq('frc' + num[0]), tbaApi_1.TBAReq.TeamEvents('frc' + num[0], status.current_season)]).then(([team, events]) => {
                            slack.chat.postMessage({
                                token: key, channel: a.channel, text: `Info for Team ` + num[0], attachments: [
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
                            }, (err, data) => {
                                console.log({ err, data });
                            });
                        }).catch(err => {
                            if ('404' in err) {
                                slack.chat.postMessage({ token: key, channel: a.channel, text: `Sorry team ${c[1]} does not exist ${parseInt(c[1]) > 7000 ? 'yet' : ''}` }, (err, data) => {
                                    console.log({ err, data });
                                });
                            }
                            console.log({ err });
                        });
                    }
                    else {
                        slack.chat.postMessage({ token: key, channel: a.channel, text: 'Sorry That is an invalid team number' }, (err, data) => {
                            console.log({ err, data });
                        });
                    }
                    break;
            }
        }
    });
}).catch(e => console.log(e));
