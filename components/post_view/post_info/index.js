// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {removePost} from 'mattermost-redux/actions/posts';
import {getMissingProfilesByIds} from 'mattermost-redux/actions/users';
import {isCurrentChannelReadOnly} from 'mattermost-redux/selectors/entities/channels';
import {makeGetDisplayName} from 'mattermost-redux/selectors/entities/users';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {get} from 'mattermost-redux/selectors/entities/preferences';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {emitShortcutReactToLastPostFrom} from 'actions/post_actions.jsx';
import {Preferences} from 'utils/constants';
import * as PostUtils from 'utils/post_utils.jsx';
import {getSelectedPostCard} from 'selectors/rhs';
import {getShortcutReactToLastPostEmittedFrom} from 'selectors/emojis';

import PostInfo from './post_info.jsx';

function mapStateToProps(state, ownProps) {
    const selectedCard = getSelectedPostCard(state);
    const config = getConfig(state);
    const channel = state.entities.channels.channels[ownProps.post.channel_id];
    const channelIsArchived = channel ? channel.delete_at !== 0 : null;
    const enableEmojiPicker = config.EnableEmojiPicker === 'true' && !channelIsArchived;
    const teamId = getCurrentTeamId(state);
    const shortcutReactToLastPostEmittedFrom = getShortcutReactToLastPostEmittedFrom(state);
    const getDisplayName = makeGetDisplayName();

    return {
        teamId,
        isFlagged: get(state, Preferences.CATEGORY_FLAGGED_POST, ownProps.post.id, null) != null,
        isMobile: state.views.channel.mobileView,
        isCardOpen: selectedCard && selectedCard.id === ownProps.post.id,
        enableEmojiPicker,
        isReadOnly: isCurrentChannelReadOnly(state) || channelIsArchived,
        readStatus: state.views.channel.readStatus?.[channel.id]
            ?.filter((rs) => rs.last_viewed_at >= ownProps.post.create_at && rs.user_id !== ownProps.post.user_id)
            .map((rs) => ({user_id: rs.user_id, displayName: getDisplayName(state, rs.user_id)})),
        shouldShowDotMenu: PostUtils.shouldShowDotMenu(state, ownProps.post, channel),
        shortcutReactToLastPostEmittedFrom
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            removePost,
            emitShortcutReactToLastPostFrom,
            getMissingProfilesByIds,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PostInfo);
