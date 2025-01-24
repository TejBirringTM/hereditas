import { createSearchParams } from 'react-router-dom';
import { urlSearchKey_familyTreeToken } from '../slice';

export function codexShareLink(token: string, relative?: boolean) {
    if (relative) {
        const searchStrings = createSearchParams([
            [urlSearchKey_familyTreeToken, token]
        ]);
        return `/codex?${searchStrings.toString()}`;
    }
    const baseUrl = window.location.origin;
    const url = new URL(baseUrl + "/codex");
    url.searchParams.append(urlSearchKey_familyTreeToken, token);
    return url.toString();
}

export function novitasShareLink(recordId: string, relative?: boolean) {
    if (relative) {
        return `/novitas/${recordId}`;
    }
    const baseUrl = window.location.origin;
    const url = new URL(baseUrl + `/novitas/${recordId}`);
    return url.toString();
}

export function mainShareLink() {
    const baseUrl = window.location.origin;
    const url = new URL(baseUrl);
    return url.toString();
}

export function shareLink(args: {token?: string, recordId?: string}, relative?: boolean) {
    if (args.recordId) {
        return novitasShareLink(args.recordId, relative);
    } else if (args.token) {
        return codexShareLink(args.token, relative);
    } else {
        return mainShareLink();
    }
}