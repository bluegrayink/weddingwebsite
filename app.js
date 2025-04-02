// UID map
const uidToPageMap = {
    "profile.html":["04DE5AA0672681"]
};

// Elements
const iphoneButton = document.getElementById("iphoneButton");
const iphoneSection = document.getElementById("iphoneSection");
const submitUidButton = document.getElementById("submitUidButton");
const uidInput = document.getElementById("uidInput");
const statusDiv = document.getElementById("status");
const scanButton = document.getElementById("scanButton");
const logDiv = document.getElementById("log");

// Helper functions for logging and status
const ChromeSamples = {
    log: function () {
        const line = Array.from(arguments)
            .map(arg => (typeof arg === "string" ? arg : JSON.stringify(arg)))
            .join(" ");
        logDiv.innerHTML += line + "<br>";
    },
    setStatus: function (status) {
        statusDiv.textContent = status;
    }
};

// Alias for logging
const log = ChromeSamples.log;

// Function to sanitize UID (remove colons if present)
const sanitizeUID = (uid) => {
    return uid.replace(/:/g, "").toUpperCase(); // Remove ":" and convert to uppercase
};

// Function to validate UID and redirect
const validateAndRedirect = (rawUid) => {
    const uid = sanitizeUID(rawUid); // Sanitize UID
    let redirectTo = null;

    for (const [page, uids] of Object.entries(uidToPageMap)) {
        if (uids.includes(uid)) {
            redirectTo = page;
            break;
        }
    }

    if (redirectTo) {
        ChromeSamples.setStatus("Access granted. Redirecting...");
        setTimeout(() => {
            localStorage.setItem("isLoggedIn", "true"); // Set login status
            window.location.href = redirectTo; // Redirect to respective page
        }, 1000);
    } else {
        ChromeSamples.setStatus("Access denied: Invalid UID.");
    }
};

// Show input section for iPhone
iphoneButton.addEventListener("click", () => {
    iphoneSection.style.display = "block";
});

// Handle UID submission
submitUidButton.addEventListener("click", () => {
    const rawUid = uidInput.value.trim();
    if (rawUid) {
        validateAndRedirect(rawUid);
    } else {
        ChromeSamples.setStatus("Please enter a valid UID.");
    }
});

// NFC scanning logic
scanButton.addEventListener("click", async () => {
    log("Please scan your NFC card...");

    try {
        const ndef = new NDEFReader();
        await ndef.scan();
        log("<i>&gt; Scan started &lt;</i>");

        ndef.addEventListener("readingerror", () => {
            log("Cannot read data from the NFC tag. Try another one?");
        });

        ndef.addEventListener("reading", ({ serialNumber }) => {
            const scannedUID = Array.from(new Uint8Array(serialNumber.split(':').map(val => parseInt(val, 16))))
                .map(b => b.toString(16).padStart(2, "0"))
                .join("")
                .toUpperCase();

            log(`Scanned UID: ${scannedUID}`);
            validateAndRedirect(scannedUID);
        });
    } catch (error) {
        log("Error: " + error.message);
    }
});
