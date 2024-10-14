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
    
                // After a short delay, revert back to the closed mouth cat image
                setTimeout(() => {
                    $w("#cat-img-open").hide();
                    $w("#cat-img-close").show();
                    readyToClick = 1;
                }, 500); // Adjust the delay as needed
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
    { src: "https://static.wixstatic.com/media/56e255_c8e5b6da25ae4c03a8196f3fbd1f620f~mv2.gif", duration: 4000 },
    { src: "https://static.wixstatic.com/media/56e255_1bd8e4ca56cc4cc78084273c16675f8c~mv2.gif", duration: 3700 },
    { src: "https://static.wixstatic.com/media/56e255_95fbd5fbc58f44d48e3f6d0d6ebc03b1~mv2.gif", duration: 3700 },
    { src: "https://static.wixstatic.com/media/56e255_882222e33395436992f4d6d8c6e29c15~mv2.gif", duration: 3700 },
    { src: "https://static.wixstatic.com/media/56e255_0478677302c7415eb157eacf7d078855~mv2.gif", duration: 3000 },
    { src: "https://static.wixstatic.com/media/56e255_4685038cc5754a029f76b6dd31951ced~mv2.gif", duration: 2700 },
    { src: "https://static.wixstatic.com/media/56e255_ef01692653694301877e890c741d626e~mv2.gif", duration: 2700 },
    { src: "https://static.wixstatic.com/media/56e255_6212768520bc407f9bba8ecbfaf26d9f~mv2.gif", duration: 2700 },
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

