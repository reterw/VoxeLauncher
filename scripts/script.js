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
// particlesJS('fullpage', {
//     "particles": {
//         "number": {
//             "value": 80,
//             "density": {
//                 "enable": true,
//                 "value_area": 800
//             }
//         },
//         "color": {
//             "value": "#ffffff"
//         },
//         "shape": {
//             "type": "circle",
//             "stroke": {
//                 "width": 0,
//                 "color": "#000000"
//             },
//             "polygon": {
//                 "nb_sides": 5
//             },
//             "image": {
//                 "src": "img/github.svg",
//                 "width": 100,
//                 "height": 100
//             }
//         },
//         "opacity": {
//             "value": 0.5,
//             "random": false,
//             "anim": {
//                 "enable": false,
//                 "speed": 1,
//                 "opacity_min": 0.1,
//                 "sync": false
//             }
//         },
//         "size": {
//             "value": 10,
//             "random": true,
//             "anim": {
//                 "enable": false,
//                 "speed": 80,
//                 "size_min": 0.1,
//                 "sync": false
//             }
//         },
//         "line_linked": {
//             "enable": true,
//             "distance": 300,
//             "color": "#ffffff",
//             "opacity": 0.4,
//             "width": 2
//         },
//         "move": {
//             "enable": true,
//             "speed": 12,
//             "direction": "none",
//             "random": false,
//             "straight": false,
//             "out_mode": "out",
//             "bounce": false,
//             "attract": {
//                 "enable": false,
//                 "rotateX": 600,
//                 "rotateY": 1200
//             }
//         }
//     },
//     "interactivity": {
//         "detect_on": "canvas",
//         "events": {
//             "onhover": {
//                 "enable": false,
//                 "mode": "repulse"
//             },
//             "onclick": {
//                 "enable": true,
//                 "mode": "push"
//             },
//             "resize": true
//         },
//         "modes": {
//             "grab": {
//                 "distance": 800,
//                 "line_linked": {
//                     "opacity": 1
//                 }
//             },
//             "bubble": {
//                 "distance": 800,
//                 "size": 80,
//                 "duration": 2,
//                 "opacity": 0.8,
//                 "speed": 3
//             },
//             "repulse": {
//                 "distance": 400,
//                 "duration": 0.4
//             },
//             "push": {
//                 "particles_nb": 4
//             },
//             "remove": {
//                 "particles_nb": 2
//             }
//         }
//     },
//     "retina_detect": true
// });
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
            case 'Mac':
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
