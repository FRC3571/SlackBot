"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
let cache = {};
exports.TBAReq = {
    TeamList: (page_num, onOutdated) => TBAGet('teams/' + page_num, onOutdated),
    TeamReq: (team_key, onOutdated) => TBAGet('team/' + team_key, onOutdated),
    TeamEvents: (team_key, year, onOutdated) => TBAGet(`team/${team_key}/${year}/events`, onOutdated),
    TeamEventAward: (team_key, event_key, onOutdated) => TBAGet(`team/${team_key}/event/${event_key}/awards`, onOutdated),
    TeamEventMatch: (team_key, event_key, onOutdated) => TBAGet(`team/${team_key}/event/${event_key}/matches`, onOutdated),
    TeamYearsParticipated: (team_key, onOutdated) => TBAGet(`team/${team_key}/years_participated`, onOutdated),
    TeamMedia: (team_key, year, onOutdated) => TBAGet(`team/${team_key}/${year}/media`, onOutdated),
    TeamHistoryEvents: (team_key, onOutdated) => TBAGet(`team/${team_key}/history/events`, onOutdated),
    TeamHistoryAwards: (team_key, onOutdated) => TBAGet(`team/${team_key}/history/awards`, onOutdated),
    TeamHistoryRobots: (team_key, onOutdated) => TBAGet(`team/${team_key}/history/robots`, onOutdated),
    TeamHistoryDistricts: (team_key, onOutdated) => TBAGet(`team/${team_key}/history/districts`, onOutdated),
    EventList: (year, onOutdated) => TBAGet(`events/${year}`, onOutdated),
    EventReq: (event_key, onOutdated) => TBAGet(`event/${event_key}`, onOutdated),
    EventTeams: (event_key, onOutdated) => TBAGet(`event/${event_key}/teams`, onOutdated),
    EventMatches: (event_key, onOutdated) => TBAGet(`event/${event_key}/matches`, onOutdated),
    EventStats: (event_key, onOutdated) => TBAGet(`event/${event_key}/stats`, onOutdated),
    EventRankings: (event_key, onOutdated) => TBAGet(`event/${event_key}/rankings`, onOutdated),
    EventAwards: (event_key, onOutdated) => TBAGet(`event/${event_key}/awards`, onOutdated),
    EventDistrictPoints: (event_key, onOutdated) => TBAGet(`event/${event_key}/awards`, onOutdated),
    SingleMatch: (match_key, onOutdated) => TBAGet(`match/${match_key}`, onOutdated),
    DistrictList: (year, onOutdated) => TBAGet(`districts/${year}`, onOutdated),
    DistrictEvents: (district_short, year, onOutdated) => TBAGet(`district/${district_short}/${year}/events`, onOutdated),
    DistrictRankings: (district_short, year, onOutdated) => TBAGet(`district/${district_short}/${year}/rankings`, onOutdated),
    DistrictTeams: (district_short, year, onOutdated) => TBAGet(`district/${district_short}/${year}/teams`, onOutdated),
    Status: (onOutdated) => TBAGet('status', onOutdated)
};
function TBAGet(path, onOutdated) {
    let modified, tempCache, maxAge;
    if (path in cache) {
        modified = cache[path].modified;
        tempCache = cache[path].val;
        maxAge = cache[path].max_age;
    }
    return new Promise((resolve, reject) => {
        if (maxAge != null && maxAge > +new Date()) {
            resolve(tempCache);
            if (onOutdated)
                setTimeout(onOutdated, maxAge - +new Date(), () => TBAGet(path, onOutdated)).unref();
            console.log(path + ' from cache due to age');
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
                if (onOutdated)
                    setTimeout(onOutdated, maxAge - +new Date(), () => TBAGet(path, onOutdated)).unref();
                if (res.statusCode === 304) {
                    resolve(tempCache);
                    console.log(path + ' from cache due to 304');
                }
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
