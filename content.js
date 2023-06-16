// Select the target node that you want to observe for changes
const targetNode = document.body;

// Create a new instance of MutationObserver
const observer = new MutationObserver(function(mutationsList, observer) {
  // Iterate over the list of mutations
  for (let mutation of mutationsList) {
    // Handle the specific type of mutation you are interested in
    if (mutation.type === 'childList') {
      // Perform actions or execute code when a change is detected
      const url = window.location.href;
      if (url == "https://student.iclicker.com/#/polling") {
        try {
            const btn = document.querySelectorAll('.btn-container');
            btn[0].children[0].click();
          } catch (error) {
            console.log('buttons not found')
          }
      }
    }
  }
});

// Configuration options for the observer
const observerConfig = { 
  childList: true,  // Watch for changes in the child nodes of the target
  subtree: true,    // Watch for changes in the entire subtree of the target
  // ... additional options if needed
};

// Start observing the target node for changes
observer.observe(targetNode, observerConfig);