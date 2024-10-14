import wixData from 'wix-data';
import {fetch} from 'wix-fetch'; // To use fetch in Wix

// Function to fetch the user's country
function getUserCountry() {
    return fetch('https://ipinfo.io/json', { method: 'get' })
        .then(response => response.json())
        .then(data => {
            $w("#countryFlag").src = `https://flagsapi.com/${data.country}/flat/64.png`;
            return data.country; // Returns the country code, e.g., 'US', 'IN', 'GB'
        })
        .catch(error => {
            console.error('Error fetching country:', error);
            return 'Unknown'; // Fallback if something goes wrong
        });
}

let readyToClick = 1;

$w.onReady(function () {
    $w("#container1").hide();
    $w("#container2").hide();
    $w("#container3").hide();
    $w("#container4").hide();
    $w("#audioPlayer1").hide();
    $w("#audioPlayer2").hide();
    $w("#audioPlayer3").hide();
    $w("#audioPlayer4").hide();
    $w("#popup-leaderboard").hide();
    $w("#popup-widget").show();
    $w("#cat-img-open").hide(); // Initially hide the open mouth cat image

    // Fetch the user's country
    getUserCountry().then(countryCode => {
        // Add click event to the image
        $w('#cat-img-close').onClick(() => {
            if(readyToClick == 1) {
                readyToClick = 0;
                // Show the open mouth cat image
                $w("#cat-img-close").hide();
                $w("#cat-img-open").show();
    
                // Perform the animation and increment logic
                showAnimation();
                incrementClickCount(countryCode); // Pass the country code when incrementing

                vibrateClickCountText();
    
                // After a short delay, revert back to the closed mouth cat image
                setTimeout(() => {
                    $w("#cat-img-open").hide();
                    $w("#cat-img-close").show();
                    readyToClick = 1;
                }, 150); // Adjust the delay as needed
            }
        });

        // Start fetching and updating the leaderboard data every second
        setInterval(() => {
            loadLeaderboardData();
        }, 1000); // Update every 1000 ms (1 second)
    }).catch(error => {
        console.error("Error fetching user country:", error);
    });

    // Listen for messages from the HTML widget
    $w("#popup-widget").onMessage((event) => {
        if (event.data.action === 'clicked') {
            let widgetType = event.data.type;

            if(widgetType == "popup-widget") {
                $w("#popup-widget").hide();
                $w("#popup-leaderboard").show();
            } else if(widgetType == "popup-leaderboard") {
                $w("#popup-widget").show();
                $w("#popup-leaderboard").hide();
            }
        }
    });

    // Listen for messages from the HTML widget
    $w("#popup-leaderboard").onMessage((event) => {
        if (event.data.action === 'clicked') {
            let widgetType = event.data.type;

            if(widgetType == "popup-widget") {
                $w("#popup-widget").hide();
                $w("#popup-leaderboard").show();
            } else if(widgetType == "popup-leaderboard") {
                $w("#popup-widget").show();
                $w("#popup-leaderboard").hide();
            }
        }
    });
});

// Array of animation objects
const animations = [
    { src: "https://static.wixstatic.com/media/56e255_30c7079ba9c5474fa3215cc0d86d304d~mv2.gif", duration: 1200 },
    { src: "https://static.wixstatic.com/media/56e255_096308cbb1e246678f2fbcd0f442a57d~mv2.gif", duration: 1300 },
    { src: "https://static.wixstatic.com/media/56e255_5c9aa274ca5e4c4cac631a4710dffd7e~mv2.gif", duration: 1500 },
    { src: "https://static.wixstatic.com/media/56e255_80d256c2448e49ca9bf49f39cb940a83~mv2.gif", duration: 1200 },
    { src: "https://static.wixstatic.com/media/56e255_cda331ee66d34fe39c0e2a72e5645f21~mv2.gif", duration: 1200 },
    { src: "https://static.wixstatic.com/media/56e255_cda331ee66d34fe39c0e2a72e5645f21~mv2.gif", duration: 1300 },
    { src: "https://static.wixstatic.com/media/56e255_5c6d74e1e8a04d0a8efe9dcc36b2aaf9~mv2.gif", duration: 1500 },
    { src: "https://static.wixstatic.com/media/56e255_6c3adffd26174780839b686bef620f42~mv2.gif", duration: 1200 },
    // Add more animations as needed
];

let currentAnimationIndex = 0, clickedNumber = 0;

function showAnimation() {
    // Get the current animation object
    const currentAnimation = animations[currentAnimationIndex];

    // Get the container image element
    const containerElement = $w(`#container${currentAnimationIndex + 1}`);

    // Set the src of the container to the current animation GIF
    containerElement.src = currentAnimation.src;

    // Show the container element
    containerElement.show();

    playMusic(currentAnimationIndex % 4);

    clickedNumber = clickedNumber + 1;

    $w("#clickCountText").text = `${clickedNumber}`;

    // Automatically hide the GIF after the specified duration
    setTimeout(() => {
        containerElement.hide();
        containerElement.src = "";
    }, currentAnimation.duration);

    // Move to the next animation
    currentAnimationIndex = (currentAnimationIndex + 1) % animations.length;
}

// Function to send total clicks to the HTML widget
function sendClickCountToWidget(clickCount) {
    const htmlElement = $w("#popup-widget");  // Replace with your HTML widget ID
    htmlElement.postMessage({ clickCount : clickCount });
}

function incrementClickCount(countryCode) {
    // Query the database to get the current click count for the specific country
    wixData.query("ClickCounts")
        .eq("countryCode", countryCode) // Filter by country code
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                // If a record exists, update the click count
                let item = results.items[0];
                item.clickCount = (item.clickCount || 0) + 1;
                
                wixData.update("ClickCounts", item)
                    .then((updatedItem) => {
                        // sendClickCountToWidget(updatedItem.clickCount);
                    })
                    .catch((error) => {
                        console.error("Error updating click count:", error);
                    });
            } else {
                // If no record exists for the country, create a new one
                let newItem = {
                    countryCode: countryCode,
                    clickCount: 1
                };
                
                wixData.insert("ClickCounts", newItem)
                    .then((insertedItem) => {
                        // sendClickCountToWidget(insertedItem.clickCount);
                    })
                    .catch((error) => {
                        console.error("Error inserting new click count:", error);
                    });
            }
        })
        .catch((error) => {
            console.error("Error querying click count:", error);
        });
}

function loadClickCount(countryCode) {
    wixData.query("ClickCounts")
        .eq("countryCode", countryCode) // Filter by country code
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                let item = results.items[0];

                // Update the total clicks in the HTML widget
                sendClickCountToWidget(item.clickCount);
            } else {
                // Update the total clicks in the HTML widget
                sendClickCountToWidget(0);
            }
        })
        .catch((error) => {
            console.error("Error loading click count:", error);
        });
}

function playMusic(currentAnimationIndex) {
    const audioElement = $w(`#audioPlayer${currentAnimationIndex + 1}`); // Replace with the ID of your audio player
    
    // Set the src attribute to the desired MP3 URL
    audioElement.src = "https://static.wixstatic.com/mp3/56e255_b8b666fadd6740f59724e5d878359789.mp3"; // Replace with your MP3 URL
    
    // Play the audio
    audioElement.play()
        .then(() => {
            // Set a timeout to reset the audio element after its duration
            setTimeout(() => {
                audioElement.pause();
                audioElement.seek(0);
            }, audioElement.duration * 500); // Convert duration to milliseconds
        })
        .catch((error) => {
            console.error("Error playing music:", error);
        });
}

// Function to load total clicks and country-specific clicks, and sort them
function loadLeaderboardData() {
    wixData.query("ClickCounts")
        .find()
        .then((results) => {
            if (results.items.length > 0) {
                // Calculate total clicks
                let totalPops = results.items.reduce((sum, country) => sum + (country.clickCount || 0), 0);

                // Sort the countries by click count in descending order
                let countries = results.items
                    .map(country => ({
                        code: country.countryCode,
                        name: getCountryNameFromCode(country.countryCode), // Optionally map code to name
                        clicks: country.clickCount || 0
                    }))
                    .sort((a, b) => b.clicks - a.clicks); // Sort by clicks in descending order

                // Send the data to the HTML widget
                sendLeaderboardDataToWidget(totalPops, countries);
                sendClickCountToWidget(totalPops);
            } else {
                // If no data, send 0 values
                sendLeaderboardDataToWidget(0, []);
                sendClickCountToWidget(0);
            }
        })
        .catch((error) => {
            console.error("Error loading leaderboard data:", error);
        });
}

// Function to send total pops and country data to HTML widget
function sendLeaderboardDataToWidget(totalPops, countries) {
    const htmlElement = $w("#popup-leaderboard");  // Replace with your HTML widget ID
    htmlElement.postMessage({
        action: "updateLeaderboard",
        totalPops: totalPops,
        countries: countries
    });
}

// Helper function to map country codes to country names (optional)
function getCountryNameFromCode(code) {
    const countryNames = {
        'US': 'United States',
        'GB': 'United Kingdom',
        'RU': 'Russia',
        'IN': 'India',
        // Add more country codes as needed
    };
    return countryNames[code] || code;
}

function vibrateClickCountText() {
    const textElement = $w("#clickCountText");

    // Define vibration parameters
    const vibrations = 6; // Number of vibrations
    const distance = 3; // Distance to move (in pixels)
    const duration = 30; // Duration of one vibration (in milliseconds)

    // Create a timeline for the vibration effect
    const timeline = wixAnimations.timeline();

    for (let i = 0; i < vibrations; i++) {
        // Move right
        timeline.add(textElement, {
            x: distance,
            duration: duration
        });

        // Move left
        timeline.add(textElement, {
            x: -distance,
            duration: duration
        });
    }

    // Reset position after vibrations
    timeline.add(textElement, {
        x: 0,
        duration: duration
    });

    // Play the timeline
    timeline.play();
}
