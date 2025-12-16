var query = `
query ($search: String) { 
    Character(search: $search) { 
        id
    name {
        native
    }
    image {
        large
    }
        media {
            nodes {
                title {
                    native
                }
            }
        }
    }
}`;

var url = 'https://graphql.anilist.co';

function runQuery(searchTerm) {
    console.log('[aaaa.js] runQuery start, term:', searchTerm);
    var variables = { search: searchTerm };
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ query: query, variables: variables })
    };

    console.log('[aaaa.js] Sending GraphQL query:', searchTerm);
    fetch(url, options).then(handleResponse)
        .then(function (res) { console.log('[aaaa.js] GraphQL response parsed', res); return handleData(res); })
        .catch(handleError);
}

function handleResponse(response) {
    return response.json().then(function (json) {
        console.log('[aaaa.js] handleResponse json:', json);
        // If GraphQL returned errors, surface them clearly
        if (json && json.errors && json.errors.length) {
            console.error('[aaaa.js] GraphQL errors:', json.errors);
            // Reject with the json so caller can inspect errors array
            return Promise.reject(json);
        }
        // If HTTP status indicates failure but no GraphQL errors, reject too
        if (!response.ok) {
            console.error('[aaaa.js] HTTP error, status:', response.status, response.statusText);
            return Promise.reject(json);
        }
        return json;
    }).catch(function (err) {
        console.error('[aaaa.js] handleResponse json parse error', err);
        throw err;
    });
}

function handleData(data) {
    console.log('[aaaa.js] handleData start', data);
    // The GraphQL query in this project requests Character.name.native and Character.media.nodes[].title.native
    var character = data && data.data && data.data.Character ? data.data.Character : null;
    // media might be nested under character.media.nodes[] per the query
    var mediaNodes = character && character.media && character.media.nodes ? character.media.nodes : [];
    // prefer native name because query requests native
    var charNativeName = (character && character.name && character.name.native) ? character.name.native : '';
    // there may not be an image field in this query; handle gracefully
    var charImage = (character && character.image && character.image.large) ? character.image.large : '';
    var mediaTitle = '';
    if (mediaNodes && mediaNodes.length > 0) {
        var first = mediaNodes[0];
        if (first && first.title) mediaTitle = first.title.native || '';
    }
    var charName = charNativeName || '';

    console.log('[aaaa.js] Extracted data:', { charName, charNativeName, charImage, mediaTitle });

    // If API didn't return an image, still decide whether to continue.
    // To avoid errors, only send to PHP when we have at least a name.
    if (charName && charName.trim() !== '') {
        // send image even if empty; PHP side will not display image when empty
        sendToPhp(charName, mediaTitle || '', charImage);
    } else {
        console.warn('[aaaa.js] キャラクター名が見つかりませんでした', data);
        alert('キャラクターが見つかりませんでした');
    }
}

function sendToPhp(charName, animeName, charImage) {
    console.log('[aaaa.js] sendToPhp', { charName: charName, animeName: animeName, charImage: charImage });
    var formData = new FormData();
    formData.append('charcterName', charName);
    formData.append('animeName', animeName);
    formData.append('charcterImage', charImage);
    formData.append('推し活診断', '1'); // どのボタンが押されたかを示す
    // 部分更新フラグ
    formData.append('ajax', '1');

    // Forward current query string (e.g. ?SUB1=1) so server can detect SUB flags on GET
    var targetUrl = 'Character_entry.php' + (window.location.search || '');
    fetch(targetUrl, {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(html => {
            console.log('[aaaa.js] Received HTML fragment from PHP', html);
            // 返ってきた断片HTMLを resultArea に差し替える
            var area = document.getElementById('resultArea');
            // turn off loading indicator
            try { var loader = document.getElementById('loader'); if (loader) loader.remove(); } catch (e) { }
            if (area) {
                area.innerHTML = html;
                console.log('[aaaa.js] Updated resultArea innerHTML');

                // Hide the main title when search results are displayed
                try {
                    var mainTitle = document.getElementById('mainTitle');
                    if (mainTitle) mainTitle.style.display = 'none';
                } catch (e) { }

                // Re-attach form listener to newly injected form
                setTimeout(function () {
                    console.log('[aaaa.js] Reattaching form listener after DOM update');
                    attachFormListener();
                }, 0);

                // 検索欄が埋まっていなければ、今回のキャラ名で埋める
                try {
                    var input = document.getElementById('searchInput');
                    if (input && (!input.value || input.value.trim() === '')) input.value = charName;
                } catch (e) { }
            } else {
                // フォールバック: ページ全体を置換
                document.open();
                document.close();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('データの送信に失敗しました');
        });
}

function handleError(error) {
    // If this is a GraphQL error object, show messages
    try {
        if (error && error.errors && Array.isArray(error.errors)) {
            var messages = error.errors.map(function (e) { return e.message || JSON.stringify(e); }).join('\n');
            alert('GraphQL エラー:\n' + messages);
            console.error('[aaaa.js] GraphQL error details:', error.errors);
            return;
        }
    } catch (e) {
        console.error('[aaaa.js] Error inspecting error object', e);
    }

    // Fallback: generic error
    alert('Error（詳細はコンソール）');
    console.error(error);
}

// Helper function to attach form submit listener
function attachFormListener() {
    console.log('[aaaa.js] attachFormListener called');

    // Remove old listener by cloning and replacing
    var form = document.getElementById('searchForm');
    if (!form) {
        console.warn('[aaaa.js] searchForm not found on attach');
        return;
    }

    var newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    // Add new listener to cloned form
    newForm.addEventListener('submit', function (e) {
        console.log('[aaaa.js] Form submit event triggered');
        e.preventDefault();
        var input = document.getElementById('searchInput');
        var term = input && input.value ? input.value.trim() : '';

        // Check if input is empty
        if (!term || term === '') {
            console.warn('[aaaa.js] Search term is empty');
            alert('キャラクター名を入力してください');
            return;
        }

        console.log('[aaaa.js] Running query with term:', term);
        // show loading indicator
        try {
            var area = document.getElementById('resultArea');
            if (area) {
                var loader = document.createElement('div');
                loader.id = 'loader';
                loader.textContent = '検索中...';
                area.appendChild(loader);
            }
        } catch (e) { }
        runQuery(term);
    });
    console.log('[aaaa.js] Form listener attached successfully');
}

// Initialize on DOM ready
function initializeFormListener() {
    console.log('[aaaa.js] initializeFormListener called');
    var input = document.getElementById('searchInput');
    if (!input) {
        console.warn('[aaaa.js] searchInput not found');
        return;
    }

    // If server provided a search term, populate the input with it
    try {
        if (window.serverSearch && typeof window.serverSearch === 'string' && window.serverSearch.trim() !== '') {
            console.log('[aaaa.js] Setting input from window.serverSearch:', window.serverSearch);
            input.value = window.serverSearch;
        }
    } catch (e) {
        console.error('[aaaa.js] Error setting serverSearch:', e);
    }

    // Attach form listener
    attachFormListener();
}

// Try multiple ways to initialize
if (document.readyState === 'loading') {
    console.log('[aaaa.js] Document still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initializeFormListener);
} else {
    console.log('[aaaa.js] Document already loaded, initializing immediately');
    initializeFormListener();
}

// Also try on window load as fallback
window.addEventListener('load', function () {
    console.log('[aaaa.js] Window load event');
    initializeFormListener();
});