// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import SettingItemMin from 'components/setting_item_min.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';

import ChannelStore from 'stores/channel_store.jsx';

import $ from 'jquery';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {updateChannelNotifyProps} from 'actions/channel_actions.jsx';

export default class ChannelNotificationsModal extends React.Component {
    constructor(props) {
        super(props);

        this.updateSection = this.updateSection.bind(this);
        this.onHide = this.onHide.bind(this);

        this.handleSubmitNotifyLevel = this.handleSubmitNotifyLevel.bind(this);
        this.handleUpdateNotifyLevel = this.handleUpdateNotifyLevel.bind(this);
        this.createNotifyLevelSection = this.createNotifyLevelSection.bind(this);

        this.handleSubmitMarkUnreadLevel = this.handleSubmitMarkUnreadLevel.bind(this);
        this.handleUpdateMarkUnreadLevel = this.handleUpdateMarkUnreadLevel.bind(this);
        this.createMarkUnreadLevelSection = this.createMarkUnreadLevelSection.bind(this);

        this.state = {
            activeSection: '',
            show: true,
            notifyLevel: props.channelMember.notify_props.desktop,
            unreadLevel: props.channelMember.notify_props.mark_unread
        };
    }

    updateSection(section) {
        if ($('.section-max').length) {
            $('.settings-modal .modal-body').scrollTop(0).perfectScrollbar('update');
        }
        this.setState({activeSection: section});
    }

    onHide() {
        this.setState({show: false});
    }

    handleSubmitNotifyLevel() {
        const channelId = this.props.channel.id;
        const notifyLevel = this.state.notifyLevel;
        const currentUserId = this.props.currentUser.id;

        if (this.props.channelMember.notify_props.desktop === notifyLevel) {
            this.updateSection('');
            return;
        }

        const data = {
            channel_id: channelId,
            user_id: currentUserId,
            desktop: notifyLevel
        };

        updateChannelNotifyProps(data,
            () => {
                // YUCK
                var member = ChannelStore.getMyMember(channelId);
                member.notify_props.desktop = notifyLevel;
                ChannelStore.storeMyChannelMember(member);

                this.updateSection('');
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    handleUpdateNotifyLevel(notifyLevel) {
        this.setState({notifyLevel});
    }

    createNotifyLevelSection(serverError) {
        // Get glabal user setting for notifications
        const globalNotifyLevel = this.props.currentUser.notify_props ? this.props.currentUser.notify_props.desktop : 'all';
        let globalNotifyLevelName;
        if (globalNotifyLevel === 'all') {
            globalNotifyLevelName = (
                <FormattedMessage
                    id='channel_notifications.allActivity'
                    defaultMessage='For all activity'
                />
            );
        } else if (globalNotifyLevel === 'mention') {
            globalNotifyLevelName = (
                <FormattedMessage
                    id='channel_notifications.onlyMentions'
                    defaultMessage='Only for mentions'
                />
            );
        } else {
            globalNotifyLevelName = (
                <FormattedMessage
                    id='channel_notifications.never'
                    defaultMessage='Never'
                />
            );
        }

        const sendDesktop = (
            <FormattedMessage
                id='channel_notifications.sendDesktop'
                defaultMessage='Send desktop notifications'
            />
        );

        const notificationLevel = this.state.notifyLevel;

        if (this.state.activeSection === 'desktop') {
            const notifyActive = [false, false, false, false];
            if (notificationLevel === 'default') {
                notifyActive[0] = true;
            } else if (notificationLevel === 'all') {
                notifyActive[1] = true;
            } else if (notificationLevel === 'mention') {
                notifyActive[2] = true;
            } else {
                notifyActive[3] = true;
            }

            var inputs = [];

            inputs.push(
                <div key='channel-notification-level-radio'>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                name='desktopNotificationLevel'
                                checked={notifyActive[0]}
                                onChange={this.handleUpdateNotifyLevel.bind(this, 'default')}
                            />
                            <FormattedMessage
                                id='channel_notifications.globalDefault'
                                defaultMessage='Global default ({notifyLevel})'
                                values={{
                                    notifyLevel: (globalNotifyLevelName)
                                }}
                            />
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                name='desktopNotificationLevel'
                                checked={notifyActive[1]}
                                onChange={this.handleUpdateNotifyLevel.bind(this, 'all')}
                            />
                            <FormattedMessage id='channel_notifications.allActivity'/>
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                name='desktopNotificationLevel'
                                checked={notifyActive[2]}
                                onChange={this.handleUpdateNotifyLevel.bind(this, 'mention')}
                            />
                            <FormattedMessage id='channel_notifications.onlyMentions'/>
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                name='desktopNotificationLevel'
                                checked={notifyActive[3]}
                                onChange={this.handleUpdateNotifyLevel.bind(this, 'none')}
                            />
                            <FormattedMessage id='channel_notifications.never'/>
                        </label>
                    </div>
                </div>
            );

            const handleUpdateSection = function updateSection(e) {
                this.updateSection('');
                e.preventDefault();
            }.bind(this);

            const extraInfo = (
                <span>
                    <FormattedMessage
                        id='channel_notifications.override'
                        defaultMessage='Selecting an option other than "Default" will override the global notification settings. Desktop notifications are available on Firefox, Safari, and Chrome.'
                    />
                </span>
            );

            return (
                <SettingItemMax
                    title={sendDesktop}
                    inputs={inputs}
                    submit={this.handleSubmitNotifyLevel}
                    server_error={serverError}
                    updateSection={handleUpdateSection}
                    extraInfo={extraInfo}
                />
            );
        }

        var describe;
        if (notificationLevel === 'default') {
            describe = (
                <FormattedMessage
                    id='channel_notifications.globalDefault'
                    values={{
                        notifyLevel: (globalNotifyLevelName)
                    }}
                />
            );
        } else if (notificationLevel === 'mention') {
            describe = (<FormattedMessage id='channel_notifications.onlyMentions'/>);
        } else if (notificationLevel === 'all') {
            describe = (<FormattedMessage id='channel_notifications.allActivity'/>);
        } else {
            describe = (<FormattedMessage id='channel_notifications.never'/>);
        }

        return (
            <SettingItemMin
                title={sendDesktop}
                describe={describe}
                updateSection={() => {
                    this.updateSection('desktop');
                }}
            />
        );
    }

    handleSubmitMarkUnreadLevel() {
        const channelId = this.props.channel.id;
        const markUnreadLevel = this.state.unreadLevel;

        if (this.props.channelMember.notify_props.mark_unread === markUnreadLevel) {
            this.updateSection('');
            return;
        }

        const data = {
            channel_id: channelId,
            user_id: this.props.currentUser.id,
            mark_unread: markUnreadLevel
        };

        updateChannelNotifyProps(data,
            () => {
                // Yuck...
                var member = ChannelStore.getMyMember(channelId);
                member.notify_props.mark_unread = markUnreadLevel;
                ChannelStore.storeMyChannelMember(member);
                this.updateSection('');
            },
            (err) => {
                this.setState({serverError: err.message});
            }
        );
    }

    handleUpdateMarkUnreadLevel(unreadLevel) {
        this.setState({unreadLevel});
    }

    createMarkUnreadLevelSection(serverError) {
        let content;

        const markUnread = (
            <FormattedMessage
                id='channel_notifications.markUnread'
                defaultMessage='Mark Channel Unread'
            />
        );
        if (this.state.activeSection === 'markUnreadLevel') {
            const inputs = [(
                <div key='channel-notification-unread-radio'>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                name='markUnreadLevel'
                                checked={this.state.unreadLevel === 'all'}
                                onChange={this.handleUpdateMarkUnreadLevel.bind(this, 'all')}
                            />
                            <FormattedMessage
                                id='channel_notifications.allUnread'
                                defaultMessage='For all unread messages'
                            />
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                type='radio'
                                name='markUnreadLevel'
                                checked={this.state.unreadLevel === 'mention'}
                                onChange={this.handleUpdateMarkUnreadLevel.bind(this, 'mention')}
                            />
                            <FormattedMessage id='channel_notifications.onlyMentions'/>
                        </label>
                        <br/>
                    </div>
                </div>
            )];

            const handleUpdateSection = function handleUpdateSection(e) {
                this.updateSection('');
                e.preventDefault();
            }.bind(this);

            const extraInfo = (
                <span>
                    <FormattedMessage
                        id='channel_notifications.unreadInfo'
                        defaultMessage='The channel name is bolded in the sidebar when there are unread messages. Selecting "Only for mentions" will bold the channel only when you are mentioned.'
                    />
                </span>
            );

            content = (
                <SettingItemMax
                    title={markUnread}
                    inputs={inputs}
                    submit={this.handleSubmitMarkUnreadLevel}
                    server_error={serverError}
                    updateSection={handleUpdateSection}
                    extraInfo={extraInfo}
                />
            );
        } else {
            let describe;

            if (!this.state.unreadLevel || this.state.unreadLevel === 'all') {
                describe = (
                    <FormattedMessage
                        id='channel_notifications.allUnread'
                        defaultMessage='For all unread messages'
                    />
                );
            } else {
                describe = (<FormattedMessage id='channel_notifications.onlyMentions'/>);
            }

            const handleUpdateSection = function handleUpdateSection(e) {
                this.updateSection('markUnreadLevel');
                e.preventDefault();
            }.bind(this);

            content = (
                <SettingItemMin
                    title={markUnread}
                    describe={describe}
                    updateSection={handleUpdateSection}
                />
            );
        }

        return content;
    }

    render() {
        var serverError = null;
        if (this.state.serverError) {
            serverError = <div className='form-group has-error'><label className='control-label'>{this.state.serverError}</label></div>;
        }

        return (
            <Modal
                show={this.state.show}
                dialogClassName='settings-modal settings-modal--tabless'
                onHide={this.onHide}
                onExited={this.props.onHide}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='channel_notifications.preferences'
                            defaultMessage='Notification Preferences for '
                        />
                        <span className='name'>{this.props.channel.display_name}</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='settings-table'>
                        <div className='settings-content'>
                            <div
                                ref='wrapper'
                                className='user-settings'
                            >
                                <br/>
                                <div className='divider-dark first'/>
                                {this.createNotifyLevelSection(serverError)}
                                <div className='divider-light'/>
                                {this.createMarkUnreadLevelSection(serverError)}
                                <div className='divider-dark'/>
                            </div>
                        </div>
                    </div>
                    {serverError}
                </Modal.Body>
            </Modal>
        );
    }
}

ChannelNotificationsModal.propTypes = {
    onHide: React.PropTypes.func.isRequired,
    channel: React.PropTypes.object.isRequired,
    channelMember: React.PropTypes.object.isRequired,
    currentUser: React.PropTypes.object.isRequired
};
