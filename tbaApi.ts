import * as https from 'https'
let cache: { [key: string]: { modified: string, val: any, max_age: number } } = {}
export let TBAReq = {
        TeamList: (page_num: number) => TBAGet<Team[]>('teams/' + page_num),
        TeamReq: (team_key: string) => TBAGet<Team>('team/' + team_key),
        TeamEvents: (team_key: string, year: number) => TBAGet<FRCEvent[]>(`team/${team_key}/${year}/events`),
        TeamEventAward: (team_key: string, event_key: string) => TBAGet<Award[]>(`team/${team_key}/event/${event_key}/awards`),
        TeamEventMatch: (team_key: string, event_key: string) => TBAGet<Match[]>(`team/${team_key}/event/${event_key}/matches`),
        TeamYearsParticipated: (team_key: string) => TBAGet<number[]>(`team/${team_key}/years_participated`),
        TeamMedia: (team_key: string, year: number) => TBAGet<Media[]>(`team/${team_key}/${year}/media`),
        TeamHistoryEvents: (team_key: string) => TBAGet<FRCEvent[]>(`team/${team_key}/history/events`),
        TeamHistoryAwards: (team_key: string) => TBAGet<Award[]>(`team/${team_key}/history/awards`),
        TeamHistoryRobots: (team_key: string) => TBAGet<Robot[]>(`team/${team_key}/history/robots`),
        TeamHistoryDistricts: (team_key: string) => TBAGet<{ [key: string]: string }>(`team/${team_key}/history/districts`),
        EventList: (year: number) => TBAGet<FRCEvent[]>(`events/${year}`),
        EventReq: (event_key: string) => TBAGet<FRCEvent>(`event/${event_key}`),
        EventTeams: (event_key: string) => TBAGet<Team[]>(`event/${event_key}/teams`),
        EventMatches: (event_key: string) => TBAGet<Match[]>(`event/${event_key}/matches`),
        EventStats: (event_key: string) => TBAGet<{ oprs: StrNumDic, ccwms: StrNumDic, dprs: StrNumDic }>(`event/${event_key}/stats`),
        EventRankings: (event_key: string) => TBAGet<(string|number)[][]>(`event/${event_key}/rankings`),
        EventAwards: (event_key: string) => TBAGet<Award[]>(`event/${event_key}/awards`),
        EventDistrictPoints: (event_key: string) => TBAGet<DistrictPoints>(`event/${event_key}/awards`),
        SingleMatch: (match_key: string) => TBAGet<Match>(`match/${match_key}`),
        DistrictList: (year: number) => TBAGet<{ name: string, key: string }[]>(`districts/${year}`),
        DistrictEvents: (district_short: string, year) => TBAGet<FRCEvent[]>(`district/${district_short}/${year}/events`),
        DistrictRankings: (district_short: string, year) => TBAGet<DistrictRank[]>(`district/${district_short}/${year}/rankings`),
        DistrictTeams: (district_short: string, year) => TBAGet<Team[]>(`district/${district_short}/${year}/teams`),
        Status: () => TBAGet<TBAStatus>('status')
    }

function TBAGet<T>(path: string) {
    let modified, tempCache: T, maxAge: number
    if (path in cache) {
        modified = cache[path].modified
        tempCache = cache[path].val
        maxAge = cache[path].max_age
    }
    return new Promise<T>((resolve, reject) => {
        if (maxAge != null && maxAge > +new Date()) {
            resolve(tempCache)
            console.log('resolved early')
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
                if (res.statusCode === 304) resolve(tempCache)
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
type StrNumDic = { [key: string]: number }

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