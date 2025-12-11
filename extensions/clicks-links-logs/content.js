//
// content.js
//
// https://developer.chrome.com/docs/extensions/reference/api/tabs
// event (Required):
// "click": When an element is clicked.
// "mouseover": When the mouse pointer enters an element.
// "mouseout": When the mouse pointer leaves an element.
// "keydown": When a key is pressed down.
// "input": When the value of an input element changes.
// "submit": When a form is submitted.
//

function linkAction(result) {
  console.log('linkAction: ', result.result);
  if (result.result == 'disableLink') {
    console.log('click blocked' + result.href);
    alert('Clicking on link ' + result.href + ' disabled, you may manually Righ-click and select on of the open options to proceed with caution');
  }
}

document.addEventListener('click', function(event) {
  tagName = event.target.tagName.toLowerCase();

  if (tagName == 'a') {
    const metadata= {'action': 'click', 'tagName': 'a', 'href': event.target.href, 'text': event.target.textContent, 'tagId': '', 'timestamp': Date.now()};
    chrome.runtime.sendMessage(metadata, function(response) {
      console.log('service worker response: ', response.result);
      linkAction(response.result);
      });

  } else if (tagName == 'p') {
    url = event.target.href;
    text = event.target.textContent;
    const metadata= {'action': 'click', 'tagName': 'p', 'url': '', 'text': text, 'tagId': '', 'timestamp': Date.now()};
    chrome.runtime.sendMessage({metadata: metadata}, function(response) {
        console.log('service worker response: ', response.result);
    })
  };
});
