document.addEventListener('DOMContentLoaded', () => {
    const nextDelayInput = document.getElementById('nextDelay');
    const nextDelayValue = document.getElementById('nextDelayValue');
    const skipDelayInput = document.getElementById('skipDelay');
    const skipDelayValue = document.getElementById('skipDelayValue');
    const applyButton = document.getElementById('applyButton');
    const allowAccessButton = document.getElementById('allowAccessButton');
    const successMessage = document.getElementById('successMessage'); // Existing success message element
    const permissionMessage = document.createElement('p'); // Create a new paragraph for permission messages
    const nextUpToggle = document.getElementById('nextUpToggle');
    const skipToggle = document.getElementById('skipToggle');

    // Add styles for the permission message
    permissionMessage.style.color = 'green';
    permissionMessage.style.display = 'none'; // Initially hidden
    permissionMessage.style.marginBottom = '10px'; // Space below the message

    // Insert the permission message above the allowAccessButton
    allowAccessButton.parentNode.insertBefore(permissionMessage, allowAccessButton);

    const loadSettings = () => {
        chrome.storage.sync.get(['nextDelay', 'skipDelay', 'skipEnabled', 'nextUpEnabled'], (result) => {
            if (chrome.runtime.lastError) {
                console.error("Error retrieving data: ", chrome.runtime.lastError);
                return;
            }

            const nextDelay = result.nextDelay !== undefined ? result.nextDelay / 1000 : 5;
            const skipDelay = result.skipDelay !== undefined ? result.skipDelay / 1000 : 0;

            nextDelayInput.value = nextDelay;
            nextDelayValue.value = nextDelay.toFixed(1); // Ensure input value is set correctly
            skipDelayInput.value = skipDelay;
            skipDelayValue.value = skipDelay.toFixed(1); // Ensure input value is set correctly

            // Set toggle states
            nextUpToggle.checked = result.nextUpEnabled ?? true;
            skipToggle.checked = result.skipEnabled ?? true;

            updateFields();
        });
    };

    const updateFields = () => {
        // Update skip delay fields
        if (skipToggle.checked) {
            skipDelayInput.removeAttribute('readonly');
            skipDelayInput.classList.remove('disabled');
            skipDelayValue.removeAttribute('readonly');
            skipDelayValue.classList.remove('disabled');
            skipDelayInput.removeAttribute('disabled');
            skipDelayValue.removeAttribute('disabled');
        } else {
            skipDelayInput.setAttribute('readonly', true);
            skipDelayInput.classList.add('disabled');
            skipDelayValue.setAttribute('readonly', true);
            skipDelayValue.classList.add('disabled');
            skipDelayInput.setAttribute('disabled', true);
            skipDelayValue.setAttribute('disabled', true);
        }

        // Update next delay fields
        if (nextUpToggle.checked) {
            nextDelayInput.removeAttribute('readonly');
            nextDelayInput.classList.remove('disabled');
            nextDelayValue.removeAttribute('readonly');
            nextDelayValue.classList.remove('disabled');
            nextDelayInput.removeAttribute('disabled');
            nextDelayValue.removeAttribute('disabled');
        } else {
            nextDelayInput.setAttribute('readonly', true);
            nextDelayInput.classList.add('disabled');
            nextDelayValue.setAttribute('readonly', true);
            nextDelayValue.classList.add('disabled');
            nextDelayInput.setAttribute('disabled', true);
            nextDelayValue.setAttribute('disabled', true);
        }
    };

    nextUpToggle.addEventListener('change', updateFields);
    skipToggle.addEventListener('change', updateFields);

    loadSettings();

    nextDelayInput.addEventListener('input', () => {
        nextDelayValue.value = parseFloat(nextDelayInput.value).toFixed(1);
    });

    skipDelayInput.addEventListener('input', () => {
        skipDelayValue.value = parseFloat(skipDelayInput.value).toFixed(1);
    });

    nextDelayValue.addEventListener('input', () => {
        nextDelayInput.value = parseFloat(nextDelayValue.value).toFixed(1);
    });

    skipDelayValue.addEventListener('input', () => {
        skipDelayInput.value = parseFloat(skipDelayValue.value).toFixed(1);
    });

    applyButton.addEventListener('click', () => {
        const nextDelayInMs = nextDelayInput.value * 1000;
        const skipDelayInMs = skipDelayInput.value * 1000;

        chrome.storage.sync.set({
            nextDelay: nextDelayInMs,
            skipDelay: skipDelayInMs,
            nextUpEnabled: document.getElementById('nextUpToggle').checked,
            skipEnabled: document.getElementById('skipToggle').checked
        }, () => {
            nextDelayValue.value = (nextDelayInMs / 1000).toFixed(1);
            skipDelayValue.value = (skipDelayInMs / 1000).toFixed(1);
            successMessage.style.display = 'block';
            successMessage.textContent = 'Settings applied!';
        });
    });


    const origins = [
        "*://*.amazon.com/*",
        "*://*.amazon.co.uk/*",
        "*://*.amazon.de/*",
        "*://*.amazon.co.jp/*",
        "*://*.amazon.in/*",
        "*://*.amazon.fr/*",
        "*://*.amazon.it/*",
        "*://*.amazon.es/*",
        "*://*.amazon.ca/*",
        "*://*.amazon.com.mx/*",
        "*://*.amazon.cn/*",
        "*://*.amazon.com.au/*",
        "*://*.amazon.ae/*"
    ];


    const triggerApply = (event) => {
        if (event.key === 'Enter') {
            applyButton.click();
        }
    };

    nextDelayInput.addEventListener('keydown', triggerApply);
    skipDelayInput.addEventListener('keydown', triggerApply);
    nextDelayValue.addEventListener('keydown', triggerApply);
    skipDelayValue.addEventListener('keydown', triggerApply);

    
    const checkPermissions = () => {
        chrome.permissions.getAll((permissions) => {
            if (chrome.runtime.lastError) {
                console.error("Error retrieving permissions: ", chrome.runtime.lastError);
                return;
            }

            const hasAccess = origins.every(origin => permissions.origins.includes(origin));

            if (hasAccess) {
                allowAccessButton.textContent = "Revoke Access";
                allowAccessButton.classList.remove("btn-success");
                allowAccessButton.classList.add("btn-danger");
                allowAccessButton.onclick = revokeAccess;
            } else {
                allowAccessButton.textContent = "Allow Access";
                allowAccessButton.classList.remove("btn-danger");
                allowAccessButton.classList.add("btn-success");
                allowAccessButton.onclick = requestAccess;
            }
        });
    };

    const requestAccess = () => {
        chrome.permissions.request({ origins })
            .then(granted => {
                if (granted) {
                    permissionMessage.textContent = "Permissions granted!";
                    permissionMessage.style.display = 'block'; // Show the message
                    checkPermissions();
                } else {
                    permissionMessage.textContent = "Permissions denied.";
                    permissionMessage.style.display = 'block'; // Show the message
                }
            })
            .catch(error => {
                console.error("Error requesting permissions:", error);
            });

        setTimeout(() => {
            window.close();
        }, 100);
    };

    const revokeAccess = () => {
        chrome.permissions.remove({ origins })
            .then(removed => {
                if (removed) {
                    permissionMessage.textContent = "Permissions revoked!";
                    permissionMessage.style.display = 'block'; // Show the message
                    checkPermissions();
                } else {
                    permissionMessage.textContent = "Permissions not revoked.";
                    permissionMessage.style.display = 'block'; // Show the message
                }
            })
            .catch(error => {
                console.error("Error revoking permissions:", error);
            });
    };

    const setTheme = () => {
        const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.setAttribute('data-bs-theme', isDarkTheme ? 'dark' : 'light');
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setTheme);
    setTheme();

    checkPermissions();
});
