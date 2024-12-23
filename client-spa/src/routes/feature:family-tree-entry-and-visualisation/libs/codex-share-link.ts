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
