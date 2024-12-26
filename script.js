let profiles = loadProfilesFromStorage();
console.log(profiles);
let currentProfile=null; 
$(function () {
    
  // ----- Initial Page (Team Members) -----
  $("#continue-to-profiles").on("click", function () {
    $(".team-members-page").addClass("hidden");
    $(".profile-page").removeClass("hidden");

    renderProfiles();
  });

  $("#new-profile-btn").on("click", function () {
    $("#add-box").removeClass("hidden");
    $("#add-box input").focus();
  });

  $("#add-profile-btn").on("click", function () {
    if ($("#add-box input").val() === "") alert("Please enter a name.");
    else {
        profiles.push({ name: $("#add-box input").val(), initialMoney: 1000, currentDay:2, coins:{} });
        console.log("profile info"+ profiles);}

    $("#add-box input").val("");
    $("#add-box").addClass("hidden");
    saveProfiles();
    renderProfiles();
  });

  renderProfiles = () => {
    $(".profile-list").empty();

    if (profiles.length === 0) {
      $(".profile-list").append(`
                <div class="profile">
                    <h3>EMPTY</h3>
                </div>
            `);
    } else {
      $(".profile-list").empty();

      for (let i = 0; i < profiles.length; i++) {
        $(".profile-list").append(`
                    <a class="user-wallet-link" href="#" data-name="${profiles[i].name}">
                    <div class="profile">
                        
                            <button class="rmv-btn">Remove</button>
                            <h3>${profiles[i].name}</h3>
                            <p>Initial Money: $${profiles[i].initialMoney}</p>
                        
                    </div>
               </a>
                `);

        localStorage.setItem("profiles", JSON.stringify(profiles));
      }
    }
  };

  //remove profile
  $(".profile-list").on("click", ".rmv-btn", function (e) {
    let index = $(this).parent().index();
    e.stopPropagation();
    localStorage.removeItem(profiles.splice(index, 1));
    renderProfiles();
  });



$(".profile-list").on("click", ".user-wallet-link", function (e) {
    e.preventDefault();
    const name = $(this).data("name");
  
    // Find the profile by name
    currentProfile = profiles.find(profile => profile.name === name);
  
    if (currentProfile) {
      console.log(currentProfile);
      //console.log(name);
  
      $(".profile-page").addClass("hidden");
      $(".main-content").removeClass("hidden");
      $(".header-right").removeClass("hidden");
      $("#current-profile-name").text(currentProfile.name);
      updateUI();
    } else {
        console.error("Profile not found!");
      }
    });


  $(".header-right button").on("click", function () {
    $(".profile-page").removeClass("hidden");
    $(".header-right").addClass("hidden");
    $(".main-content").addClass("hidden");
  });

  //
  // DAY BUTTONS
  //
  // constants
  const END_DAY = 365;
  const START_DAY = 2;
  const YEAR_START = new Date(2021, 0, 1);
  let currentDay = START_DAY;
  // date part of the next day button
  function calculateDateFromDay(day) {
    const date = new Date(YEAR_START.getTime());
    date.setDate(date.getDate() + (day - 1)); // adjust for the given day
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  /*
  // update day and date in the UI
  let selectedCoin = "BTC"; // bu dümenden bi implementasyon, currentProfile gelene kadar
  function updateUI(selectedCoin) {
    $("#current-day").text(currentProfile{"name"}.currentDay);
    $("#current-date").text(calculateDateFromDay(currentProfile.currentDay));

    // $(".coin-option").removeClass("selected");
    // buraya currentProfile.selectedCoin gelmesi lazım
    // put the ring selection to the new coin
    $(`.coin-option[data-coin="${selectedCoin}"]`).addClass("selected");
    // display the coin name
    $("#selected-coin-name").text(coinFullName(selectedCoin));

    //
  }*/

    const updateUI = () => {
        if (!currentProfile) return;
        $("#current-day").text(currentProfile.currentDay);
        $("#current-date").text(calculateDateFromDay(currentProfile.currentDay));
      };


  // it changes to the next day until the end of the sim
  $("#next-day-btn").on("click", function () {
    if (currentProfile.currentDay < END_DAY) {
      currentProfile.currentDay++;
      updateUI();
    } else {
      alert("End of the simulation!");
    }
  });

  //
  //    COIN SELECTION BUTTONS
  //
  //
  function coinFullName(coin) {
    switch (coin) {
      case "BTC":
        return "Bitcoin";
      case "ETH":
        return "Ethereum";
      case "ADA":
        return "Cardano";
      case "XRP":
        return "Ripple";
      case "DOGE":
        return "Dogecoin";
      case "AVAX":
        return "Avalanche";
      case "TRX":
        return "Tron";
      case "SNX":
        return "Synthetix";
      case "POL":
        return "Polygon";
      default:
        return coin;
    }
  }

  $(".coin-option").on("click", function () {
    selectedCoin = $(this).data("coin");
    $(".coin-option").removeClass("selected");
    $(this).addClass("selected");

    // update the new coin name
    $("#selected-coin-name").text(coinFullName(selectedCoin));

    console.log(`Selected coin updated to: ${selectedCoin}`);
  });
  //
  // chartstick implementation
  //
  //
  let chartVisibleDays = 120; //num of visible days of chart
  function renderCandlestick(date, coinCode) {
    // find the data for that day's date
    const dayData = market.find((day) => day.date === date);

    // find the data for a specific coin
    const coinData = dayData.coins.find((coin) => coin.code === coinCode);

    // render candlestick chart
    const $chart = $("#candlestick-chart");
    const dayIndex = market.findIndex((day) => day.date === date);
    const stickLeft = dayIndex * 20; // Adjust spacing
    const barLeft = stickLeft - 5;

    const stick = $("<div>")
      .addClass("stick")
      .css({
        height: `${coinData.high - coinData.low}px`,
        bottom: `${coinData.low}px`,
        left: `${stickLeft}px`,
      });

    const bar = $("<div>")
      .addClass("bar")
      .css({
        height: `${Math.abs(coinData.close - coinData.open)}px`,
        bottom: `${Math.min(coinData.open, coinData.close)}px`,
        left: `${barLeft}px`,
        backgroundColor: coinData.close > coinData.open ? "green" : "red",
      });

    $chart.append(stick);
    $chart.append(bar);
  }

  // test
  renderCandlestick("01-01-2021", "eth");
  renderCandlestick("02-01-2021", "eth");
  renderCandlestick("03-01-2021", "eth");
  renderCandlestick("04-01-2021", "eth");
  //
  //
  //
  //

  updateUI();
});

function saveProfiles() {
  localStorage.setItem("profiles", JSON.stringify(profiles));
  console.log(profiles);
}

function loadProfilesFromStorage() {
  let data = localStorage.getItem("profiles");
  return data ? JSON.parse(data) : [];
}