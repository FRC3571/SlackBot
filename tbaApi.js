"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
let cache = {};
exports.TBAReq = {
    TeamList: (page_num) => TBAGet('teams/' + page_num),
    TeamReq: (team_key) => TBAGet('team/' + team_key),
    TeamEvents: (team_key, year) => TBAGet(`team/${team_key}/${year}/events`),
    TeamEventAward: (team_key, event_key) => TBAGet(`team/${team_key}/event/${event_key}/awards`),
    TeamEventMatch: (team_key, event_key) => TBAGet(`team/${team_key}/event/${event_key}/matches`),
    TeamYearsParticipated: (team_key) => TBAGet(`team/${team_key}/years_participated`),
    TeamMedia: (team_key, year) => TBAGet(`team/${team_key}/${year}/media`),
    TeamHistoryEvents: (team_key) => TBAGet(`team/${team_key}/history/events`),
    TeamHistoryAwards: (team_key) => TBAGet(`team/${team_key}/history/awards`),
    TeamHistoryRobots: (team_key) => TBAGet(`team/${team_key}/history/robots`),
    TeamHistoryDistricts: (team_key) => TBAGet(`team/${team_key}/history/districts`),
    EventList: (year) => TBAGet(`events/${year}`),
    EventReq: (event_key) => TBAGet(`event/${event_key}`),
    EventTeams: (event_key) => TBAGet(`event/${event_key}/teams`),
    EventMatches: (event_key) => TBAGet(`event/${event_key}/matches`),
    EventStats: (event_key) => TBAGet(`event/${event_key}/stats`),
    EventRankings: (event_key) => TBAGet(`event/${event_key}/rankings`),
    EventAwards: (event_key) => TBAGet(`event/${event_key}/awards`),
    EventDistrictPoints: (event_key) => TBAGet(`event/${event_key}/awards`),
    SingleMatch: (match_key) => TBAGet(`match/${match_key}`),
    DistrictList: (year) => TBAGet(`districts/${year}`),
    DistrictEvents: (district_short, year) => TBAGet(`district/${district_short}/${year}/events`),
    DistrictRankings: (district_short, year) => TBAGet(`district/${district_short}/${year}/rankings`),
    DistrictTeams: (district_short, year) => TBAGet(`district/${district_short}/${year}/teams`),
    Status: () => TBAGet('status')
};
function TBAGet(path) {
    let modified, tempCache, maxAge;
    if (path in cache) {
        modified = cache[path].modified;
        tempCache = cache[path].val;
        maxAge = cache[path].max_age;
    }
    return new Promise((resolve, reject) => {
        if (maxAge != null && maxAge > +new Date()) {
            resolve(tempCache);
            console.log('resolved early');
            return;
        }
        let opt = { protocol: 'https:', hostname: 'www.thebluealliance.com', path: '/api/v2/' + path, headers: { "X-TBA-App-Id": 'frc3571:Slack-Bot:v1' } };
        if (modified)
            opt.headers['If-Modified-Since'] = modified;
        https.get(opt, res => {
            res.setEncoding('utf8');
            let raw = '';
            res.on('data', m => {
                raw += m;
            });
            res.on('end', () => {
                modified = res.headers['last-modified'] || res.headers['Last-Modified'];
                let cacheControl = /max-age=(\d+)/.exec(res.headers['cache-control']);
                if (cacheControl !== null && cacheControl[1])
                    maxAge = 1000 * parseInt(cacheControl[1], 10) + +new Date();
                if (res.statusCode === 304)
                    resolve(tempCache);
                else if (res.statusCode === 404)
                    reject(JSON.parse(raw));
                else {
                    try {
                        tempCache = JSON.parse(raw);
                        cache[path] = { modified, val: tempCache, max_age: maxAge };
                        resolve(tempCache);
                    }
                    catch (e) {
                        reject(e);
                    }
                }
            });
            res.on('error', e => {
                reject(e);
            });
        });
    });
}
