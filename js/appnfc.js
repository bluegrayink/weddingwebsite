const uidToPageMap = {
    "profile.html":["04DE5AA0672681","EDELYN00ACC","PUNI00ACC","OLA00ACC","MATCHA00ACC"]
};

// Elements
    const iphoneButton = document.getElementById("iphoneButton");
    const androidButton = document.getElementById("scanButton");
    const iphoneSection = document.getElementById("iphoneSection");
    const androidSection = document.getElementById("androidSection");
    const submitUidButton = document.getElementById("submitUidButton");
    const uidInput = document.getElementById("uidInput");
    const statusDiv = document.getElementById("status");
    const logDiv = document.getElementById("log");


// Helper functions
const setStatus = (status) => {
    statusDiv.textContent = status;
};

const log = (message) => {
    logDiv.innerHTML += message + "<br>";
};

// Function to sanitize UID
const sanitizeUID = (uid) => uid.replace(/:/g, "").toUpperCase();

// Function to validate UID and redirect
const validateAndRedirect = (rawUid) => {
    const uid = sanitizeUID(rawUid);
    let redirectTo = Object.keys(uidToPageMap).find(page => uidToPageMap[page].includes(uid));

    if (redirectTo) {
        setStatus("Access granted. Redirecting...");
        setTimeout(() => {
            localStorage.setItem("isLoggedIn", "true");
            window.location.href = redirectTo;
        }, 1000);
    } else {
        setStatus("Access denied: Invalid UID.");
    }
};

    // Handle UID submission for iPhone users
    submitUidButton.addEventListener("click", () => {
        const rawUid = uidInput.value.trim();
        console.log("Submitted UID:", rawUid);
        if (rawUid) {
            validateAndRedirect(rawUid);
        } else {
            setStatus("Please enter a valid UID.");
        }
    });

    // NFC scanning logic for Android
    androidButton.addEventListener("click", async () => {
        log("Please scan your NFC card...");

        try {
            const ndef = new NDEFReader();
            await ndef.scan();
            log("<i>&gt; Scan started &lt;</i>");
            console.log("NFC scan started");

            ndef.addEventListener("readingerror", () => {
                log("Cannot read data from the NFC tag. Try another one?");
                console.log("NFC reading error");
            });

            ndef.addEventListener("reading", ({ serialNumber }) => {
                if (!serialNumber) {
                    log("No serial number detected!");
                    console.log("No serial number detected");
                    return;
                }
                const scannedUID = sanitizeUID(serialNumber);
                log(`Scanned UID: ${scannedUID}`);
                console.log("Scanned UID:", scannedUID);
                validateAndRedirect(scannedUID);
            });
        } catch (error) {
            log("Error: " + error.message);
            console.error("NFC error:", error);
        }
    });
