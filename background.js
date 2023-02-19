chrome.action.onClicked.addListener(tab => {
  chrome.tabs.sendMessage(tab.id,"toggle");
  console.log('message sent');
  });
  

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

const promise = getCurrentTab();
console.log(promise);
const getData = () => {
  promise.then((appData) => {
    console.log(appData);
  });
};

getData()







