import * as https from 'https'
type onOutdated<T> = (callback: () => Promise<T>) => any
let cache: { [key: string]: { modified: string, val: any, max_age: number } } = {}
export let TBAReq = {
    TeamList: (page_num: number, onOutdated?: onOutdated<Team[]>) => TBAGet<Team[]>('teams/' + page_num, onOutdated),
    TeamReq: (team_key: string, onOutdated?: onOutdated<Team>) => TBAGet<Team>('team/' + team_key, onOutdated),
    TeamEvents: (team_key: string, year: number, onOutdated?: onOutdated<FRCEvent[]>) => TBAGet<FRCEvent[]>(`team/${team_key}/${year}/events`, onOutdated),
    TeamEventAward: (team_key: string, event_key: string, onOutdated?: onOutdated<Award[]>) => TBAGet<Award[]>(`team/${team_key}/event/${event_key}/awards`, onOutdated),
    TeamEventMatch: (team_key: string, event_key: string, onOutdated?: onOutdated<Match[]>) => TBAGet<Match[]>(`team/${team_key}/event/${event_key}/matches`, onOutdated),
    TeamYearsParticipated: (team_key: string, onOutdated?: onOutdated<number[]>) => TBAGet<number[]>(`team/${team_key}/years_participated`, onOutdated),
    TeamMedia: (team_key: string, year: number, onOutdated?: onOutdated<Media[]>) => TBAGet<Media[]>(`team/${team_key}/${year}/media`, onOutdated),
    TeamHistoryEvents: (team_key: string, onOutdated?: onOutdated<FRCEvent[]>) => TBAGet<FRCEvent[]>(`team/${team_key}/history/events`, onOutdated),
    TeamHistoryAwards: (team_key: string, onOutdated?: onOutdated<Award[]>) => TBAGet<Award[]>(`team/${team_key}/history/awards`, onOutdated),
    TeamHistoryRobots: (team_key: string, onOutdated?: onOutdated<Robot[]>) => TBAGet<Robot[]>(`team/${team_key}/history/robots`, onOutdated),
    TeamHistoryDistricts: (team_key: string, onOutdated?: onOutdated<StrDict>) => TBAGet<StrDict>(`team/${team_key}/history/districts`, onOutdated),
    EventList: (year: number, onOutdated?: onOutdated<FRCEvent[]>) => TBAGet<FRCEvent[]>(`events/${year}`, onOutdated),
    EventReq: (event_key: string, onOutdated?: onOutdated<FRCEvent>) => TBAGet<FRCEvent>(`event/${event_key}`, onOutdated),
    EventTeams: (event_key: string, onOutdated?: onOutdated<Team[]>) => TBAGet<Team[]>(`event/${event_key}/teams`, onOutdated),
    EventMatches: (event_key: string, onOutdated?: onOutdated<Match[]>) => TBAGet<Match[]>(`event/${event_key}/matches`, onOutdated),
    EventStats: (event_key: string, onOutdated?: onOutdated<Stats>) => TBAGet<Stats>(`event/${event_key}/stats`, onOutdated),
    EventRankings: (event_key: string, onOutdated?: onOutdated<(string | number)[][]>) => TBAGet<(string | number)[][]>(`event/${event_key}/rankings`, onOutdated),
    EventAwards: (event_key: string, onOutdated?: onOutdated<Award[]>) => TBAGet<Award[]>(`event/${event_key}/awards`, onOutdated),
    EventDistrictPoints: (event_key: string, onOutdated?: onOutdated<DistrictPoints>) => TBAGet<DistrictPoints>(`event/${event_key}/awards`, onOutdated),
    SingleMatch: (match_key: string, onOutdated?: onOutdated<Match>) => TBAGet<Match>(`match/${match_key}`, onOutdated),
    DistrictList: (year: number, onOutdated?: onOutdated<{ name: string, key: string }[]>) => TBAGet<{ name: string, key: string }[]>(`districts/${year}`, onOutdated),
    DistrictEvents: (district_short: string, year, onOutdated?: onOutdated<FRCEvent[]>) => TBAGet<FRCEvent[]>(`district/${district_short}/${year}/events`, onOutdated),
    DistrictRankings: (district_short: string, year, onOutdated?: onOutdated<DistrictRank[]>) => TBAGet<DistrictRank[]>(`district/${district_short}/${year}/rankings`, onOutdated),
    DistrictTeams: (district_short: string, year, onOutdated?: onOutdated<Team[]>) => TBAGet<Team[]>(`district/${district_short}/${year}/teams`, onOutdated),
    Status: (onOutdated?: onOutdated<TBAStatus>) => TBAGet<TBAStatus>('status', onOutdated)
}

function TBAGet<T>(path: string, onOutdated?: onOutdated<T>) {
    let modified, tempCache: T, maxAge: number
    if (path in cache) {
        modified = cache[path].modified
        tempCache = cache[path].val
        maxAge = cache[path].max_age
    }
    return new Promise<T>((resolve, reject) => {
        if (maxAge != null && maxAge > +new Date()) {
            resolve(tempCache)
            if (onOutdated) setTimeout(onOutdated, maxAge - +new Date(), () => TBAGet(path, onOutdated)).unref()
            console.log(path + ' from cache due to age')
            return
        }
        let opt: https.RequestOptions = { protocol: 'https:', hostname: 'www.thebluealliance.com', path: '/api/v2/' + path, headers: { "X-TBA-App-Id": 'frc3571:Slack-Bot:v1' } }
        if (modified) opt.headers['If-Modified-Since'] = modified
        https.get(opt, res => {
            res.setEncoding('utf8')
            let raw = ''
            res.on('data', m => {
                raw += m
            })
            res.on('end', () => {
                modified = res.headers['last-modified'] || res.headers['Last-Modified']
                let cacheControl = /max-age=(\d+)/.exec(res.headers['cache-control'])
                if (cacheControl !== null && cacheControl[1]) maxAge = 1000 * parseInt(cacheControl[1], 10) + +new Date()
                if (onOutdated) setTimeout(onOutdated, maxAge - +new Date(), () => TBAGet(path, onOutdated)).unref()
                if (res.statusCode === 304) {
                    resolve(tempCache)
                    console.log(path + ' from cache due to 304')
                }
                else if (res.statusCode === 404) reject(JSON.parse(raw))
                else {
                    try {
                        tempCache = JSON.parse(raw)
                        cache[path] = { modified, val: tempCache, max_age: maxAge }
                        resolve(tempCache)
                    } catch (e) {
                        reject(e)
                    }
                }
            })
            res.on('error', e => {
                reject(e)
            })
        })
    })
}
type StrNumDict = { [key: string]: number }
type StrDict = { [key: string]: string }

export interface Stats {
    oprs: StrNumDict
    ccwms: StrNumDict
    dprs: StrNumDict
}

export interface TBAStatus {
    current_season: number
    down_events: string[]
    is_datafeed_down: boolean
    max_season: number
}

export interface Team {
    website: string
    name: string
    locality: string
    region: string
    country_name: string
    location: string
    team_number: number
    key: string
    nickname: string
    rookie_year: number
    motto: string
}
export interface FRCEvent {
    key: string
    name: string
    short_name: string
    event_code: string
    event_type_string: string
    event_type: number
    event_district_string: string
    event_district: number
    year: number
    week: number
    location: string
    venue_address: string
    timezone: string
    website: string
    official: boolean
    teams: Team[]
    matches: Match[]
    awards: Award[]
    webcast: {
        type: string
        channel: string
        file: string
    }
    alliances: {
        declines: string[]
        picks: string[]
    }[]
    district_points: DistrictPoints
    start_date: string
    end_date: string
}
export interface DistrictPoints {
    points: {
        [key: string]: {
            alliance_points: number
            total: number
            award_points: number
            elim_points: number
            qual_points: number
        }
    }
    tiebreakers: {
        [key: string]: {
            highest_qual_scores: number[]
            qual_wins: number
        }
    }
}
export interface DistrictRank {
    points_total: number
    team_key: string
    event_points: {
        [key: string]: {
            alliance_points: number
            award_points: number
            elim_points: number
            district_cmp: boolean
            total: number
            qual_points: number
        }
    }
    rank: number
    rookie_bonus: number
}
export interface Match {
    key: string
    comp_level: string
    set_number: number
    match_number: number
    alliances: {
        blue: {
            surrogates: any[]
            score: number
            teams: string[]
        }
        red: {
            surrogates: any[]
            score: number
            teams: string[]
        }
    }
    score_breakdown: {
        blue: { [key: string]: any }
        red: { [key: string]: any }
    }
    event_key: string
    videos: {
        type: string
        key: string
    }[]
    time_string: string
    time: number
}
export interface Award {
    name: string
    award_type: number
    event_key: string
    recipient_list: {
        team_number: number
        awardee: any
    }[]
    year: number
}
export interface Media {
    type: string
    foreign_key: string
    details: {
        [key: string]: string
    }
    preferred: boolean
}
export interface Robot {
    key: string
    team_key: string
    year: number
    name: string
}