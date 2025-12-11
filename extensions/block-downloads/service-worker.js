//
// service-worker.js
//

// https://icon128.com/
// https://chrome.jscn.org/docs/extensions/reference/downloads/#type-DownloadItem
chrome.downloads.onCreated.addListener(function(downloadRequest) {
    // blockUrl personal email downloads
    url = downloadRequest.url;
    if (url.includes("mail.google.com")) {blockUrl(downloadRequest);}
        else if (url.includes("gmail.com")) {blockUrl(downloadRequest);}
        else if (url.includes("drive.google.com")) {blockUrl(downloadRequest);}

    if (url.includes("seclab.stanford.edu")) {blockUrl(downloadRequest);}

    // Mime types: https://mimetype.io/all-types
    switch(downloadRequest.mime) {
        case "application/pdf":
            blockUrl(downloadRequest);
            break;
        // .bat, .com, .dll, .exe, .msi
        case "application/x-msdownload":
//            blockUrl(downloadRequest.url);
            break;
        // .a, .bin, .bpk, .deploy, .dist, .distz, .dmg, .dms, .dump, .elc, .lha, .lrf, .lzh, .o, .obj, .pkg, .so
        case "application/octet-stream":
//            blockUrl(downloadRequest.url);
            break;
        default:
            break;
    }
});

function blockUrl(downloadRequest) {
    console.warn('Block download from: ', downloadRequest.url);
    chrome.downloads.cancel(downloadRequest.id);
    console.warn('----------------------------->BLOCK!<-----------------------------------');
    console.warn("              Danger state:", downloadRequest.danger);
    console.warn("              Safe state:", downloadRequest.safe);
    console.warn("              Download ID:", downloadRequest.id);
    console.warn("              URL:", downloadRequest.url);
    console.warn("              Final URL:", downloadRequest.finalUrl);
    console.warn("              Referrer:", downloadRequest.referrer);
    console.warn("              MIME Type:", downloadRequest.mime);
    console.warn('==============================>BLOCK!<==================================');

    chrome.notifications.create({
        type: 'basic', // Other types include 'image', 'list', and 'progress'
        iconUrl: 'icon.png', // Path to a small icon
        title: 'Download Action',
        message: 'This is the main message of the notification.',
        buttons: [{ title: 'Action Button' }], // Optional buttons
        priority: 0 // Optional priority level
    });
}
