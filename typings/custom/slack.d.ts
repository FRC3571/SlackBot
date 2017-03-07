declare module "slack" {
    interface Mesg {
        ok: boolean
    }
    interface Attachment {
        fallback?: string
        color?: string
        pretext?: string
        author_name?: string
        author_link?: string
        author_icon?: string
        title?: string
        title_link?: string
        text?: string
        fields?: {
            title?: string
            value?: string
            short?: boolean
        }[]
        image_url?: string
        thumb_url?: string
        footer?: string
        footer_icon?: string
        ts?: number
    }
    type Message = {
        type: "message"
        channel: string
        user: string
        text: string
        ts: string
        team: string
        attachments: Attachment[]
    } & ({
        subtype: "bot_message"
        bot_id: string
        username: string
        icons: { [key: string]: string }
    } | {
            subtype: "channel_archive"
            members: string[]
        } | {
            subtype: "channel_join"
        } | {
            subtype: "channel_leave"
        } | {
            subtype: "channel_name"
            old_name: string
            name: string
        } | {
            subtype: "message_changed"
            hidden: boolean
            message: Message & {
                eddited: {
                    user: string
                    ts: string
                }
            }
        } | {
            subtype: "channel_topic"
            topic: string
        } | {
            subtype: "channel_purpose"
            purpose: string
        })
    interface User {
        id: string
        name: string
        deleted: boolean
        color: string
        profile: {
            first_name: string
            last_name: string
            real_name: string
            email: string
            skype: string
            phone: string
            [key: string]: string
        }
        is_admin: boolean
        is_owner: boolean
        is_primary_owner: boolean
        is_restricted: boolean
        is_ultra_restricted: boolean
        has_2fa: boolean
        two_factor_type: string
    }
    interface Channel {
        id: string
        name: string
        is_chanel: string
        created: number
        creator: string
        is_archived: boolean
        is_general: boolean
        members: string[]
        topic: {
            value: string
            creator: string
            last_set: number
        }
        purpose: {
            value: string
            creator: string
            last_set: number
        }
        is_member: boolean
        last_read: string
        latest: Message
        unread_count: number
        unread_count_display: number
    }
    interface Group {
        id: string
        name: string
        is_group: string
        created: number
        creator: string
        is_archived: boolean
        is_mpim: boolean
        members: string[]
        topic: {
            value: string
            creator: string
            last_set: number
        }
        purpose: {
            value: string
            creator: string
            last_set: number
        }
        last_read: string
        latest: Message
        unread_count: number
        unread_count_display: number
    }
    interface mpim {
        id: string
        name: string
        is_mpim: boolean
        is_group: string
        created: number
        creator: string
        members: string[]
        last_read: string
        latest: Message
        unread_count: number
        unread_count_display: number
    }
    interface im {
        id: string
        is_im: boolean
        user: string
        created: number
        is_user_deleted: boolean
    }
    export namespace api {
        /** This method helps you test your calling code. */
        function test(a: { error?: string, foo?: string }, callback: (err: ErrorEvent, data: Mesg & { foo: string }) => any);
    }
    export namespace auth {
        /** This method revokes an access token. Use it when you no longer need a token. */
        function revoke(a: { token?: string, test?: boolean }, callback: (err: ErrorEvent, data: Mesg & { revoked: boolean }) => any)
        /** This method checks authentication and tells you who you are. */
        function test(a: { token: string }, callback: (err: ErrorEvent, data: Mesg & { url: string, team: string, user: string, team_id: string, user_id: string }) => any)
    }
    export namespace bots {
        /** Use this method to look up the username and icons for those bot users. Use the app_id field to identify whether a bot belongs to your Slack app. */
        function info(a: { token: string, bot?: string }, callback: (err: ErrorEvent, data: Mesg & Bot) => any)
        interface Bot {
            id: string,
            app_id: string,
            deleted: boolean,
            name: string,
            icons: {
                [key: string]: string
            }
        }
    }
    export namespace channels {
        interface Channel {
            id: string
            name: string
            created: number
            creator: string
            is_archived: boolean
            is_member: boolean
            is_general: boolean
            members: string[]
            topic: {
                value: string
                creator: string
                last_set: number
            }
            purpose: {
                value: string
                creator: string
                last_set: number
            }
            last_read: string
            latest: Object

        }
        /** Archives a channel. */
        function archive(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        /** Creates a channel. */
        function create(a: { token: string, name: string, validate?: boolean }, callback: (err: ErrorEvent, data: Mesg & { channel: Channel }) => any)
        function history(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function info(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function invite(a: { token: string, channel: string, user: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function join(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function kick(a: { token: string, channel: string, user: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function leave(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function list(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function mark(a: { token: string, channel: string, ts: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function rename(a: { token: string, channel: string, name: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function replies(a: { token: string, channel: string, thread_ts: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function setPurpose(a: { token: string, channel: string, purpose: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function setTopic(a: { token: string, channel: string, topic: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function unarchive(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
    interface post{
         token: string
         channel: string
         text: string
         parse?: string
         link_names?: boolean
         attachments?: Attachment[]
         unfurl_links?: boolean
         unfurl_media?: boolean
         username?: string
         as_user?: boolean
         icon_url?: string
         icon_emoji?: string
         thread_ts?: number
         reply_broadcast?: boolean 
    }
    export var chat: {
        delete(a: { token: string, ts: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        meMessage(a: { token: string, channel: string, text: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        /**
         * Posts a message to a public channel, private channel, or direct message/IM channel
         */
        postMessage(a: post, callback: (err: ErrorEvent, data: Mesg) => any)
        update(a: { token: string, ts: string, channel: string, text: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
    export namespace dnd {
        function endDnd(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function endSnooze(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function info(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function setSnooze(a: { token: string, num_minutes: number }, callback: (err: ErrorEvent, data: Mesg) => any)
        function teamInfo(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
    export namespace emoji {
        function list(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
    export var files: {
        comments: {
            add(a: { token: string, file: string, comment: string }, callback: (err: ErrorEvent, data: Mesg) => any)
            delete(a: { token: string, file: string, id: string }, callback: (err: ErrorEvent, data: Mesg) => any)
            edit(a: { token: string, file: string, id: string, comment: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        }
        delete(a: { token: string, file: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        info(a: { token: string, file: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        list(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        revokePublicURL(a: { token: string, file: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        sharedPublicURL(a: { token: string, file: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        upload(a: { token: string, filename: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
    export namespace groups {
        function archive(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function close(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function create(a: { token: string, name: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function createChild(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function history(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function info(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function invite(a: { token: string, channel: string, user: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function kick(a: { token: string, channel: string, user: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function leave(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function list(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function mark(a: { token: string, channel: string, ts: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function open(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function rename(a: { token: string, channel: string, name: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function replies(a: { token: string, channel: string, thread_ts: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function setPurpose(a: { token: string, channel: string, purpose: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function setTopic(a: { token: string, channel: string, topic: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function unarchive(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
    export namespace im {
        function close(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function history(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function list(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function mark(a: { token: string, channel: string, ts: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function open(a: { token: string, user: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function replies(a: { token: string, channel: string, thread_ts: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
    export namespace mpim {
        function close(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function history(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function list(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function mark(a: { token: string, channel: string, ts: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function open(a: { token: string, users: string[] }, callback: (err: ErrorEvent, data: Mesg) => any)
        function replies(a: { token: string, channel: string, thread_ts: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
    export namespace oauth {
        function access(a: { client_id: string, client_secret: string, code: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
    export namespace pins {
        function add(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function list(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function remove(a: { token: string, channel: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
    export namespace reactions {
        function add(a: { token: string, name: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function get(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function list(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function remove(a: { token: string, name: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
    export var reminders: {
        add(a: { token: string, text: string, time: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        complete(a: { token: string, reminder: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        delete(a: { token: string, reminder: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        info(a: { token: string, reminder: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        list(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
    export namespace rtm {
        interface startMesg {
            url: string,
            self: {
                id: string
                name: string,
                prefs: {

                }
                created: number
                manual_presence: string
            }
            team: {
                id: string
                name: string
                email_domain: string
                domain: string
                icon: {
                    [id: string]: string
                }
                msg_edit_window_mins: number
                over_storage_limit: boolean
                prefs: {

                }
                plan: string
            }
            users: User[]
            chanels: Channel[]
            groups: Group[]
            mpims: mpim[]
            ims: im[]
            bots: Object[]
        }
        function start(a: { token: string, simple_latest?: boolean, no_unreads?: boolean, mpim_aware?: boolean }, callback: (err: ErrorEvent, data: Mesg & startMesg) => any)
        function client(): client
        interface client {
            listen({ token: string })
            started(callback: (payload: string) => any)
            accounts_changed(callback: (msg: string) => any)
            bot_added(callback: (msg: string) => any)
            bot_changed(callback: (msg: string) => any)
            channel_archive(callback: (msg: string) => any)
            channel_created(callback: (msg: string) => any)
            channel_deleted(callback: (msg: string) => any)
            channel_history_changed(callback: (msg: string) => any)
            channel_joined(callback: (msg: string) => any)
            channel_left(callback: (msg: string) => any)
            channel_marked(callback: (msg: string) => any)
            channel_rename(callback: (msg: string) => any)
            channel_unarchive(callback: (msg: string) => any)
            commands_changed(callback: (msg: string) => any)
            dnd_updated(callback: (msg: string) => any)
            dnd_updated_user(callback: (msg: string) => any)
            email_domain_changed(callback: (msg: string) => any)
            emoji_changed(callback: (msg: string) => any)
            file_comment_added(callback: (msg: string) => any)
            file_comment_deleted(callback: (msg: string) => any)
            file_comment_edited(callback: (msg: string) => any)
            file_created(callback: (msg: string) => any)
            file_deleted(callback: (msg: string) => any)
            file_public(callback: (msg: string) => any)
            file_shared(callback: (msg: string) => any)
            file_unshared(callback: (msg: string) => any)
            goodbye(callback: (msg: string) => any)
            group_archive(callback: (msg: string) => any)
            group_close(callback: (msg: string) => any)
            group_history_changed(callback: (msg: string) => any)
            group_joined(callback: (msg: string) => any)
            group_left(callback: (msg: string) => any)
            group_marked(callback: (msg: string) => any)
            group_open(callback: (msg: string) => any)
            group_rename(callback: (msg: string) => any)
            group_unarchive(callback: (msg: string) => any)
            hello(callback: (msg: { type: "hello" }) => any)
            im_close(callback: (msg: string) => any)
            im_created(callback: (msg: string) => any)
            im_history_changed(callback: (msg: string) => any)
            im_marked(callback: (msg: string) => any)
            im_open(callback: (msg: string) => any)
            manual_presence_change(callback: (msg: string) => any)
            message: {
                (callback: (msg: Mesg & Message) => any)
                channels(callback: (msg: string) => any)
                groups(callback: (msg: string) => any)
                im(callback: (msg: string) => any)
                mpim(callback: (msg: string) => any)
            }
            pin_added(callback: (msg: string) => any)
            pin_removed(callback: (msg: string) => any)
            pong(callback: (msg: string) => any)
            pref_change(callback: (msg: string) => any)
            presence_change(callback: (msg: string) => any)
            reaction_added(callback: (msg: string) => any)
            reaction_removed(callback: (msg: string) => any)
            reconnect_url(callback: (msg: string) => any)
            star_added(callback: (msg: string) => any)
            star_removed(callback: (msg: string) => any)
            subteam_created(callback: (msg: string) => any)
            subteam_self_added(callback: (msg: string) => any)
            subteam_self_removed(callback: (msg: string) => any)
            subteam_updated(callback: (msg: string) => any)
            team_domain_change(callback: (msg: string) => any)
            team_join(callback: (msg: string) => any)
            team_migration_started(callback: (msg: string) => any)
            team_plan_change(callback: (msg: string) => any)
            team_pref_change(callback: (msg: string) => any)
            team_profile_change(callback: (msg: string) => any)
            team_profile_delete(callback: (msg: string) => any)
            team_profile_reorder(callback: (msg: string) => any)
            team_rename(callback: (msg: string) => any)
            url_verification(callback: (msg: string) => any)
            user_change(callback: (msg: string) => any)
            user_typing(callback: (msg: string) => any)
        }
    }
    export namespace search {
        function all(a: { token: string, query: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function files(a: { token: string, query: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function files(a: { token: string, query: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
    export namespace stars {
        function add(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function list(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function remove(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
    export namespace team {
        function accessLogs(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function billableInfo(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function info(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function integrationLogs(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        namespace profile {
            function get(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        }
    }
    export namespace usergroups {
        function create(a: { token: string, name: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function disable(a: { token: string, usergroup: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function enable(a: { token: string, usergroup: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function list(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function update(a: { token: string, usergroup: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        namespace users {
            function list(a: { token: string, usergroup: string }, callback: (err: ErrorEvent, data: Mesg) => any)
            function update(a: { token: string, usergroup: string, users: string[] }, callback: (err: ErrorEvent, data: Mesg) => any)
        }
    }
    export namespace users {
        function deletePhoto(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function getPresence(a: { token: string, user: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function identity(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function info(a: { token: string, user: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function list(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        namespace profile {
            function get(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
            function set(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        }
        function setActive(a: { token: string }, callback: (err: ErrorEvent, data: Mesg) => any)
        function setPhoto(a: { token: string, image: ImageData }, callback: (err: ErrorEvent, data: Mesg) => any)
        function setPresence(a: { token: string, presence: string }, callback: (err: ErrorEvent, data: Mesg) => any)
    }
}