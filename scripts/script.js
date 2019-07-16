i18next.init({
    lng: 'en',
    resources: { en, cn },
}, function (err, t) {
    jqueryI18next.init(i18next, $);
    $('.section').localize();
    $('.bar').localize();
});


$(document).ready(function () {
    $('body').pagepiling({
        // onLeave: function (index, nextIndex, direction) {
        // },
    });
});
$('.menu .item').tab();
$('.dropdown').dropdown();

$('#languages').dropdown({
    onChange: function (src, _, elem) {
        i18next.changeLanguage(elem.attr('value'), (err, r) => {
            $('.section').localize();
            $('.bar').localize();
        })
    }
});

$('#downloadFor').attr('data-i18n', `downloadFor.${platform.os}`);

function initGithubInfo() {
    let releases
    function handleReleases(inReleases) {
        releases = inReleases;
        const latest = releases[0];
        $('#version').text(latest.tag_name);
        if (latest.prerelease) {
            $('#prerelease').css('visibility', 'visible');
        } else {
            $('#prerelease').css('visibility', 'hidden');
        }

        switch (platform.os.family) {
            case 'Windows':
                $('[win]').clone().appendTo('[main]');
                break;
            case 'Mac':
                $('[mac]').clone().appendTo('[main]');
                break;
            case 'Ubuntu':
            case 'Debian':
            case 'SuSE':
            case 'Fedora':
            case 'Red Hat':
                $('[linux]').clone().appendTo('[main]');
                break;
        }

        $('[win-portable]').attr('href', latest.assets.find(a => a.name.indexOf('-setup-') === -1 && a.name.endsWith('.exe')).browser_download_url);
        $('[win-zip-32]').attr('href', latest.assets.find(a => a.name.endsWith('win.zip') && a.name.indexOf('ia32') !== -1).browser_download_url);
        $('[win-zip]').attr('href', latest.assets.find(a => a.name.endsWith('win.zip') && a.name.indexOf('ia32') === -1).browser_download_url);
        $('[win-setup]').attr('href', latest.assets.find(a => a.name.indexOf('-setup-') !== -1 && a.name.endsWith('.exe')).browser_download_url);
        $('[mac-zip]').attr('href', latest.assets.find(a => a.name.endsWith('mac.zip')).browser_download_url);
        $('[dmg]').attr('href', latest.assets.find(a => a.name.endsWith('.dmg')).browser_download_url);
        $('[snap]').attr('href', latest.assets.find(a => a.name.endsWith('.snap')).browser_download_url);
        $('[appimage]').attr('href', latest.assets.find(a => a.name.endsWith('.AppImage')).browser_download_url);

        const { installer, portable, zip } = getLatestDownloadsByPlatform(latest.assets);
        $('#download').attr('href', installer.browser_download_url);
        if (portable) {
            $('#download-portable').attr('href', portable.browser_download_url);
        } else {
            $('#download-portable').attr('disable', true);
        }
        if (zip) {
            $('#download-zip').attr('href', zip.browser_download_url);
        } else {
            $('#download-zip').attr('disable', true);
        }
    }


    function getLatestDownloadsByPlatform(assets) {
        const os = platform.os;
        const is64 = os.architecture === 64;
        switch (os.family) {
            case 'Windows':
                return {
                    installer: assets.find(a => a.name.indexOf('-setup-') !== -1 && a.name.endsWith('.exe')),
                    portable: assets.find(a => a.name.indexOf('-setup-') === -1 && a.name.endsWith('.exe')),
                    zip: is64 ? assets.find(a => a.name.endsWith('win.zip') && a.name.indexOf('ia32') === -1)
                        : assets.find(a => a.name.endsWith('win.zip') && a.name.indexOf('ia32') !== -1),
                };
            case 'OS X':
                return {
                    installer: assets.find(a => a.name.endsWith('.dmg')),
                    zip: assets.find(a => a.name.endsWith('mac.zip')),
                }
            case 'Linux':
                return {
                    installer: assets.find(a => a.name.endsWith('.AppImage')),
                    portable: assets.find(a => a.name.endsWith('.snap')),
                }
        }
        return '';
    }

    fetch('https://api.github.com/repos/voxelum/voxelauncher/releases')
        .then(resp => resp.json())
        .then(handleReleases)
}


initGithubInfo();
